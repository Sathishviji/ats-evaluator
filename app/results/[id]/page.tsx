import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { getAnalysisById } from "@/app/actions"
import { ResultsDisplay } from "@/components/results-display"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const analysisData = await getAnalysisById(id);
  console.log(analysisData)
  if (!analysisData) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Resume Analysis Results
            </h1>
            <Link href="/">
              <Button variant="outline">New Analysis</Button>
            </Link>
          </div>

          <div className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            <p>Resume: {analysisData.resumeFilename}</p>
            <p>Job Description: {analysisData.jobDescFilename}</p>
            <p>
              Analysis Date: {new Date(analysisData.timestamp).toLocaleString()}
            </p>
          </div>

          <ResultsDisplay analysis={analysisData.analysis} />
        </div>
      </div>
    </main>
  );
}
