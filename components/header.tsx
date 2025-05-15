import Link from "next/link"
import { ModeToggle } from "./mode-toggle"

export function Header() {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-slate-900 dark:text-white">ATS Evaluator</span>
          </Link>
          <nav className="flex items-center space-x-4">
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
