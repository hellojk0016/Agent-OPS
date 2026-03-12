
'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  variant?: 'blue' | 'purple' | 'emerald' | 'rose';
  className?: string;
}

const variants = {
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: 'text-blue-400',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.1)]'
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    icon: 'text-purple-400',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.1)]'
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: 'text-emerald-400',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]'
  },
  rose: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    icon: 'text-rose-400',
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.1)]'
  }
};

export default function MetricCard({
  title,
  value,
  change,
  changeType = 'positive',
  icon: Icon,
  variant = 'blue',
  className
}: MetricCardProps) {
  const styles = variants[variant];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 transition-all duration-300",
        "bg-[#16161a] backdrop-blur-xl",
        styles.border,
        styles.glow,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-white">
              {value}
            </h3>
            {change && (
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                changeType === 'positive' && "text-emerald-400 bg-emerald-500/10",
                changeType === 'negative' && "text-rose-400 bg-rose-500/10",
                changeType === 'neutral' && "text-zinc-400 bg-zinc-500/10"
              )}>
                {change}
              </span>
            )}
          </div>
        </div>
        
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          styles.bg
        )}>
          <Icon className={cn("h-5 w-5", styles.icon)} />
        </div>
      </div>
      
      {/* Decorative Gradient Overlay */}
      <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-2xl pointer-events-none" />
    </motion.div>
  );
}
