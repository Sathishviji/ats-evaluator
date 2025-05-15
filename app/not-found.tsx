import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 px-4">
      <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-slate-50">404 - Not Found</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8 text-center">
        The analysis you're looking for doesn't exist or has expired.
      </p>
      <Link href="/">
        <Button>Return to Home</Button>
      </Link>
    </div>
  )
}
