'use client';

import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Share2, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function PWAInstallPrompt() {
    const { isInstallable, isStandalone, installPWA } = usePWAInstall();
    const [isIOS, setIsIOS] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIOSDevice);

        // Show prompt if installable or if it's iOS and not standalone
        if ((isInstallable || (isIOSDevice && !isStandalone)) && !isStandalone) {
            const timer = setTimeout(() => {
                setShowPrompt(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isInstallable, isStandalone]);

    if (!showPrompt || isStandalone) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-[320px] bg-zinc-900 rounded-[24px] overflow-hidden shadow-2xl border border-white/5 animate-in zoom-in-95 duration-300">
                <div className="p-6">
                    <h2 className="text-white text-xl font-semibold mb-6">Install app</h2>
                    
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                            <img src="/ops-logo.png" alt="Knight Wolf" className="w-10 h-10 object-contain rounded-lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-white text-lg font-medium leading-tight">Knight Wolf</h3>
                            <p className="text-zinc-500 text-sm">agentops.com</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-6 text-[15px] font-semibold">
                        <button
                            onClick={() => setShowPrompt(false)}
                            className="text-[#34d399] hover:opacity-80 transition-opacity uppercase tracking-wide"
                        >
                            Cancel
                        </button>
                        
                        {isIOS ? (
                            <div className="flex items-center gap-2 text-[#34d399] uppercase tracking-wide opacity-50 cursor-not-allowed">
                                <span>Share</span>
                                <Share2 size={16} />
                            </div>
                        ) : (
                            <button
                                onClick={installPWA}
                                className="text-[#34d399] hover:opacity-80 transition-opacity uppercase tracking-wide"
                            >
                                Install
                            </button>
                        )}
                    </div>
                </div>

                {isIOS && (
                    <div className="px-6 pb-6 pt-0">
                        <div className="p-4 bg-zinc-800/50 rounded-2xl border border-white/5">
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                To install this app on your iPhone: tap the <span className="text-[#34d399] font-bold inline-flex items-center gap-1 mx-0.5">Share <Share2 size={12} /></span> button in the browser bar and select <span className="text-white font-bold">"Add to Home Screen"</span>.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
