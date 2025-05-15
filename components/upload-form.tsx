"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileUploader } from "./file-uploader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { analyzeResume } from "@/app/actions"
import { Loader2, AlertCircle } from "lucide-react"

export function UploadForm() {
  const router = useRouter()
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jobDescFile, setJobDescFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!resumeFile || !jobDescFile) {
      setError("Please upload both a resume and job description")
      return
    }

    setIsLoading(true)
    setError(null)
    setIsAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append("resume", resumeFile)
      formData.append("jobDescription", jobDescFile)

      const result = await analyzeResume(formData)

      if (result.success) {
        router.push(`/results/${result.analysisId}`)
      } else {
        setError(result.error || "An error occurred during analysis. Please try again.")
      }
    } catch (err) {
      console.error("Upload form error:", err)
      setError("Failed to analyze files. Please try again with different files or check your network connection.")
    } finally {
      setIsLoading(false)
      setIsAnalyzing(false)
    }
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Upload Resume</h3>
              <FileUploader
                accept=".pdf,.doc,.docx,.txt"
                maxSize={5}
                onFileSelect={setResumeFile}
                selectedFile={resumeFile}
                label="Upload your resume (PDF, DOC, DOCX, TXT)"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Upload Job Description</h3>
              <FileUploader
                accept=".pdf,.doc,.docx,.txt"
                maxSize={5}
                onFileSelect={setJobDescFile}
                selectedFile={jobDescFile}
                label="Upload job description (PDF, DOC, DOCX, TXT)"
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isAnalyzing && (
            <div className="text-sm text-slate-600 dark:text-slate-400 p-2 bg-slate-100 dark:bg-slate-800 rounded">
              <p>Analysis may take up to 30 seconds depending on the length of your documents.</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || !resumeFile || !jobDescFile}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Resume"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
