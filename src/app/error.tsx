'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('App Crash caught by Global Boundary:', error)
    }, [error])

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-zinc-400 max-w-md mb-8">
                We've encountered an unexpected error. This might be due to a lost connection or a temporary server issue.
            </p>

            <div className="flex flex-col gap-3 w-full max-w-xs">
                <button
                    onClick={() => reset()}
                    className="flex items-center justify-center gap-2 w-full h-14 bg-cyan-500 text-black font-bold rounded-xl hover:bg-cyan-400 transition-all active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                >
                    <RefreshCcw className="w-5 h-5" />
                    Try Again
                </button>

                <button
                    onClick={() => window.location.href = '/'}
                    className="flex items-center justify-center gap-2 w-full h-14 bg-zinc-900 text-zinc-400 font-semibold rounded-xl hover:bg-zinc-800 transition-all active:scale-95 border border-zinc-800"
                >
                    <Home className="w-5 h-5" />
                    Go to Home
                </button>
            </div>

            <div className="mt-12 text-zinc-600 text-xs font-mono">
                Error ID: {error.digest || 'no-digest'}
            </div>
        </div>
    )
}
