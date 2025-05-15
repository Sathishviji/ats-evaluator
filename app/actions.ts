"use server";

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import redis from "@/lib/redis";

const apiKey = process.env.OPENAI_API_KEY;



export async function analyzeResume(formData: FormData) {
  try {
    // Get files from form data
    const resumeFile = formData.get("resume") as File;
    const jobDescFile = formData.get("jobDescription") as File;

    if (!resumeFile || !jobDescFile) {
      return {
        success: false,
        error: "Missing required files",
      };
    }

    // Extract text from files
    const resumeText = await extractTextFromFile(resumeFile);
    const jobDescText = await extractTextFromFile(jobDescFile);

    if (!resumeText || !jobDescText) {
      return {
        success: false,
        error: "Failed to extract text from files",
      };
    }

    // Check if the text is too short
    if (resumeText.length < 50 || jobDescText.length < 50) {
      return {
        success: false,
        error: "The uploaded files contain too little text to analyze",
      };
    }

    // Generate a unique ID for this analysis
    const analysisId = uuidv4();

    // Perform the analysis using OpenAI
    const analysis = await performAnalysis(resumeText, jobDescText);

    // Store the analysis results
    const payload = {
      id: analysisId,
      timestamp: new Date().toISOString(),
      resumeFilename: resumeFile.name,
      jobDescFilename: jobDescFile.name,
      resumeText,
      jobDescText,
      analysis,
    };

    await redis.set(
      `analysis:${analysisId}`,
      JSON.stringify(payload),
      "EX",
      60 * 60 * 1
    ); // Optional: expires in 24h

    /*analysisStore.set(analysisId, {
      id: analysisId,
      timestamp: new Date().toISOString(),
      resumeFilename: resumeFile.name,
      jobDescFilename: jobDescFile.name,
      resumeText,
      jobDescText,
      analysis,
    });*/

    console.log(redis);

    revalidatePath("/results");

    return {
      success: true,
      analysisId,
    };
  } catch (error) {
    console.error("Analysis error:", error);
    return {
      success: false,
      error: "Failed to analyze resume. Please try again with different files.",
    };
  }
}

/*export async function getAnalysisById(id: string) {
  return analysisStore.get(id) || null
}*/

export async function getAnalysisById(id: string) {
  const result = await redis.get(`analysis:${id}`);
  return result ? JSON.parse(result) : null;
}

export async function extractTextFromFile(file: File): Promise<string> {
  // For simplicity, we're just reading text files
  // In a real app, you'd use libraries to extract text from PDFs, DOCs, etc.
  try {
    const text = await file.text();
    return text;
  } catch (error) {
    console.error("Text extraction error:", error);
    return "";
  }
}

// Helper function to extract JSON from text that might contain markdown formatting
export async function extractJsonFromText(text: string) {
  // Remove markdown code block formatting if present
  let cleanedText = text;

  // Check if the response is wrapped in markdown code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleanedText = codeBlockMatch[1].trim();
  }

  // Try to find JSON object in the text
  const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  return cleanedText;
}

export async function performAnalysis(resumeText: string, jobDescText: string) {
  try {
    // Truncate texts if they're too long to avoid token limits
    const maxLength = 4000;
    const truncatedResumeText =
      resumeText.length > maxLength
        ? resumeText.substring(0, maxLength) + "..."
        : resumeText;

    const truncatedJobDescText =
      jobDescText.length > maxLength
        ? jobDescText.substring(0, maxLength) + "..."
        : jobDescText;

    const prompt = `
      You are an expert ATS (Applicant Tracking System) analyzer. 
      
      I will provide you with a resume and a job description. Your task is to:
      
      1. Analyze how well the resume matches the job description
      2. Provide a match score from 0-100
      3. Identify key skills present in the resume that match the job requirements
      4. Identify important skills mentioned in the job description that are missing from the resume
      5. Provide specific suggestions to improve the resume for this job
      
      Resume:
      ${truncatedResumeText}
      
      Job Description:
      ${truncatedJobDescText}
      
      IMPORTANT: Respond ONLY with a raw JSON object without any markdown formatting, code blocks, or additional text.
      The JSON should follow this exact structure:
      {
        "matchScore": number,
        "summary": "string",
        "matchingSkills": ["string"],
        "missingSkills": ["string"],
        "suggestions": ["string"],
        "keywordAnalysis": {
          "found": ["string"],
          "missing": ["string"]
        }
      }
    `;

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.5,
      maxTokens: 2000,
    });

    console.log("Raw API response:", text.substring(0, 200) + "..."); // Log the beginning of the response for debugging

    // Extract JSON from the response and handle markdown formatting
    const jsonText = await extractJsonFromText(text);

    try {
      return JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Failed to parse extracted JSON:", parseError);
      console.error("Extracted text:", jsonText.substring(0, 200) + "...");

      // If parsing fails, return a default structure
      return {
        matchScore: 50,
        summary: "Unable to generate a detailed analysis. Please try again.",
        matchingSkills: [],
        missingSkills: [],
        suggestions: [
          "Try uploading a clearer version of your resume and job description.",
        ],
        keywordAnalysis: {
          found: [],
          missing: [],
        },
      };
    }
  } catch (error) {
    console.error("OpenAI analysis error:", error);

    // Return a default structure instead of throwing an error
    return {
      matchScore: 50,
      summary: "An error occurred during analysis. Please try again.",
      matchingSkills: [],
      missingSkills: [],
      suggestions: ["Try again with a shorter resume and job description."],
      keywordAnalysis: {
        found: [],
        missing: [],
      },
    };
  }
}
