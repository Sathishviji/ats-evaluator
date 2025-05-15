import { UploadForm } from "@/components/upload-form"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl mb-4">
              AI ATS Resume Evaluator
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Upload your resume and a job description to get AI-powered insights on how well your resume matches the
              job requirements.
            </p>
          </div>
          <UploadForm />
        </div>
      </div>
    </main>
  )
}
