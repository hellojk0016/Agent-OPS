"use client";

import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#09090b] p-6">
            <div
                className="text-center max-w-sm w-full rounded-2xl p-10"
                style={{
                    background: "rgba(12, 12, 16, 0.95)",
                    border: "1px solid rgba(0, 245, 255, 0.15)",
                    boxShadow: "0 0 60px rgba(0, 245, 255, 0.08)",
                }}
            >
                {/* Icon */}
                <div
                    className="mx-auto mb-6 flex items-center justify-center rounded-2xl"
                    style={{
                        width: 72,
                        height: 72,
                        background: "rgba(0, 245, 255, 0.08)",
                        border: "1px solid rgba(0, 245, 255, 0.2)",
                    }}
                >
                    <WifiOff className="w-9 h-9" style={{ color: "#00F5FF" }} />
                </div>

                {/* Text */}
                <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
                    You&apos;re Offline
                </h1>
                <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
                    No internet connection detected.<br />
                    Check your network and try again.
                </p>

                {/* Retry */}
                <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-zinc-950 bg-[#00F5FF] hover:bg-[#20F8FF] transition-all"
                    style={{
                        boxShadow: "0 4px 16px rgba(0, 245, 255, 0.3)",
                    }}
                >
                    <RefreshCw className="w-4 h-4" />
                    Retry Connection
                </button>

                {/* Pulsing indicator */}
                <div className="mt-8 flex items-center justify-center gap-2">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#00F5FF", opacity: 0.4 }}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                        Waiting for connection
                    </span>
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#00F5FF", opacity: 0.4 }}
                    />
                </div>
            </div>
        </div>
    );
}
