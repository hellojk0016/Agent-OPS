
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  UserPlus,
  LucideIcon 
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'completion' | 'comment' | 'assignment' | 'addition';
  user: string;
  target: string;
  time: string;
}

const icons: Record<string, LucideIcon> = {
  completion: CheckCircle2,
  comment: MessageSquare,
  assignment: Clock,
  addition: UserPlus
};

const colors: Record<string, string> = {
  completion: 'text-emerald-400 bg-emerald-500/10',
  comment: 'text-blue-400 bg-blue-500/10',
  assignment: 'text-amber-400 bg-amber-500/10',
  addition: 'text-purple-400 bg-purple-500/10'
};

const labels: Record<string, string> = {
  completion: 'completed',
  comment: 'commented on',
  assignment: 'assigned',
  addition: 'added'
};

const dummyActivities: ActivityItem[] = [
  { id: '1', type: 'completion', user: 'Knight Wolf', target: 'Project Alpha Deployment', time: '2m ago' },
  { id: '2', type: 'comment', user: 'Admin', target: 'Security Audit', time: '45m ago' },
  { id: '3', type: 'assignment', user: 'System', target: 'Weekly Sync', time: '1h ago' },
  { id: '4', type: 'addition', user: 'Commerce Agents', target: 'New Sales Lead', time: '3h ago' },
];

export default function ActivityFeed() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mt-2">
          Recent Activity
        </h3>
      </div>
      
      <div className="relative space-y-8 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-zinc-800">
        {dummyActivities.map((activity, index) => {
          const Icon = icons[activity.type];
          return (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={activity.id}
              className="relative flex items-start gap-4"
            >
              <div className={cn(
                "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#16161a]",
                colors[activity.type]
              )}>
                <Icon className="h-4 w-4" />
              </div>
              
              <div className="flex flex-col gap-1">
                <p className="text-sm text-zinc-300">
                  <span className="font-bold text-white">{activity.user}</span>
                  {' '}{labels[activity.type]}{' '}
                  <span className="font-medium text-neon-blue">{activity.target}</span>
                </p>
                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                  {activity.time}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
