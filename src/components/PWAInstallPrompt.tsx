'use client';

import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, X, Share } from 'lucide-react';
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
        <div className="fixed bottom-24 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-5 duration-500 md:bottom-20">
            <div className="bg-zinc-900/95 backdrop-blur-xl border border-neon-blue/30 rounded-2xl p-4 shadow-2xl shadow-neon-blue/20">
                <button
                    onClick={() => setShowPrompt(false)}
                    className="absolute top-2 right-2 text-zinc-500 hover:text-white bg-white/5 rounded-full p-1"
                >
                    <X size={16} />
                </button>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-neon-blue/10 rounded-xl flex items-center justify-center border border-neon-blue/20 shrink-0 shadow-[0_0_15px_rgba(0,245,255,0.1)]">
                        <img src="/ops-logo.png" alt="OPS" className="w-9 h-9 object-cover rounded-lg" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-sm">Install Agent OPS</h3>
                        <p className="text-zinc-400 text-xs line-clamp-2">Get the full experience with offline support and faster access.</p>
                    </div>

                    {isIOS ? (
                        <div className="flex flex-col items-center gap-1 shrink-0">
                            <div className="bg-neon-blue/20 p-2 rounded-xl border border-neon-blue/30 shadow-[0_0_10px_rgba(0,245,255,0.1)]">
                                <Share size={20} className="text-neon-blue" />
                            </div>
                            <span className="text-[10px] text-neon-blue font-bold uppercase tracking-wider">Tap Share</span>
                        </div>
                    ) : (
                        <button
                            onClick={installPWA}
                            className="bg-neon-blue hover:bg-neon-blue/80 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,245,255,0.3)] hover:scale-105 active:scale-95"
                        >
                            Install
                        </button>
                    )}
                </div>

                {isIOS && (
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-3 text-[10px] text-zinc-400 font-medium">
                        <div className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-black border border-white/10">+</div>
                        <span>Scroll down and tap <span className="text-white font-bold">"Add to Home Screen"</span></span>
                    </div>
                )}
            </div>
        </div>
    );
}
