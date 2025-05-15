"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Check, X, AlertTriangle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SkillsMatchChart } from "./skills-match-chart"

interface Analysis {
  matchScore: number
  summary: string
  matchingSkills: string[]
  missingSkills: string[]
  suggestions: string[]
  keywordAnalysis: {
    found: string[]
    missing: string[]
  }
}

interface ResultsDisplayProps {
  analysis: Analysis
}

export function ResultsDisplay({ analysis }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreText = (score: number) => {
    if (score >= 80) return "Excellent Match"
    if (score >= 60) return "Good Match"
    if (score >= 40) return "Fair Match"
    return "Poor Match"
  }

  const handleDownloadReport = () => {
    const report = `
ATS Resume Analysis Report
=========================

Match Score: ${analysis.matchScore}/100 - ${getScoreText(analysis.matchScore)}

Summary:
${analysis.summary}

Matching Skills:
${analysis.matchingSkills.map((skill) => `- ${skill}`).join("\n")}

Missing Skills:
${analysis.missingSkills.map((skill) => `- ${skill}`).join("\n")}

Suggestions for Improvement:
${analysis.suggestions.map((suggestion, i) => `${i + 1}. ${suggestion}`).join("\n")}

Keyword Analysis:
Found: ${analysis.keywordAnalysis.found.join(", ")}
Missing: ${analysis.keywordAnalysis.missing.join(", ")}
    `.trim()

    const blob = new Blob([report], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "ats-resume-analysis.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Match Score</CardTitle>
            <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleDownloadReport}>
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
            <div className="relative h-32 w-32 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={analysis.matchScore >= 80 ? "#22c55e" : analysis.matchScore >= 60 ? "#eab308" : "#ef4444"}
                  strokeWidth="10"
                  strokeDasharray={`${analysis.matchScore * 2.83} 283`}
                  strokeDashoffset="0"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreColor(analysis.matchScore)}`}>
                  {analysis.matchScore}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className={`text-xl font-semibold mb-2 ${getScoreColor(analysis.matchScore)}`}>
                {getScoreText(analysis.matchScore)}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">{analysis.summary}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resume Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Match Breakdown</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Skills Match</span>
                        <span className="text-sm font-medium">
                          {Math.round(
                            (analysis.matchingSkills.length /
                              (analysis.matchingSkills.length + analysis.missingSkills.length)) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          (analysis.matchingSkills.length /
                            (analysis.matchingSkills.length + analysis.missingSkills.length)) *
                          100
                        }
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Keyword Match</span>
                        <span className="text-sm font-medium">
                          {Math.round(
                            (analysis.keywordAnalysis.found.length /
                              (analysis.keywordAnalysis.found.length + analysis.keywordAnalysis.missing.length)) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          (analysis.keywordAnalysis.found.length /
                            (analysis.keywordAnalysis.found.length + analysis.keywordAnalysis.missing.length)) *
                          100
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  Matching Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.matchingSkills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <X className="h-5 w-5 text-red-500 mr-2" />
                  Missing Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Skills Match Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <SkillsMatchChart
                  matchingCount={analysis.matchingSkills.length}
                  missingCount={analysis.missingSkills.length}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                Improvement Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex">
                    <span className="mr-2 font-bold">{index + 1}.</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  Found Keywords
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywordAnalysis.found.map((keyword, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <X className="h-5 w-5 text-red-500 mr-2" />
                  Missing Keywords
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywordAnalysis.missing.map((keyword, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
