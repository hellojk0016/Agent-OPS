"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Circle, Zap, Eye, CheckCircle2 } from "lucide-react";
import TaskCard from "./TaskCard";

interface Task {
    id: string;
    title: string;
    description: string | null;
    status: string;
    assigneeId: string | null;
    priority?: string | null;
    dueDate?: Date | string | null;
    companyType?: string | null;
    createdAt: Date;
    assignee: { name: string | null } | null;
}

interface Employee {
    id: string;
    name: string | null;
}

interface CalendarViewProps {
    tasks: Task[];
    userId: string;
    userRole: string;
    employees?: Employee[];
}

const STATUS_CONFIG = {
    TODO: { color: "#71717A", bg: "rgba(113,113,122,0.1)", icon: Circle }, // Zinc
    IN_PROGRESS: { color: "#00F5FF", bg: "rgba(0,245,255,0.1)", icon: Zap }, // Neon
    REVIEW: { color: "#00F5FF", bg: "rgba(0,245,255,0.1)", icon: Eye }, // Neon
    DONE: { color: "rgba(0,245,255,0.4)", bg: "rgba(0,245,255,0.05)", icon: CheckCircle2 }, // Neon-dim
};

export default function CalendarView({ tasks, userId, userRole, employees = [] }: CalendarViewProps) {
    const isAdmin = userRole === "ADMIN";

    // Filter tasks based on role
    const visibleTasks = isAdmin
        ? tasks
        : tasks.filter(t => t.assigneeId === userId);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // Default to today

    // Calendar navigation
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
    };

    // Calculate calendar grid
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    // Map tasks by date string (YYYY-MM-DD local)
    const tasksByDate = useMemo(() => {
        const map = new Map<string, Task[]>();
        visibleTasks.forEach(task => {
            if (task.dueDate) {
                const d = new Date(task.dueDate);
                // Adjust for local timezone to ensure visual consistency
                const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

                if (!map.has(dateKey)) map.set(dateKey, []);
                map.get(dateKey)!.push(task);
            }
        });
        return map;
    }, [visibleTasks]);

    // Tasks for selected date
    const selectedDateTasks = useMemo(() => {
        if (!selectedDate) return [];
        const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        return tasksByDate.get(dateKey) || [];
    }, [selectedDate, tasksByDate]);

    // Generate grid days
    const renderWeeks = () => {
        const weeks = [];
        let curWeek = [];
        // Pad empty days at start
        for (let i = 0; i < firstDayOfMonth; i++) {
            curWeek.push(<div key={`empty-${i}`} className="p-2 opacity-0" />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

            const isToday = new Date().toDateString() === date.toDateString();
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            const dayTasks = tasksByDate.get(dateKey) || [];

            // Prevent selecting dates entirely without visual feedback
            const handleClick = () => setSelectedDate(date);

            curWeek.push(
                <button
                    key={day}
                    onClick={handleClick}
                    className={`relative flex flex-col items-center justify-start p-2 h-16 sm:h-24 border border-white/5 rounded-xl transition-all duration-200 group
                        ${isSelected ? 'bg-[#00F5FF]/10 border-[#00F5FF]/50 ring-1 ring-[#00F5FF]/30' : 'hover:bg-white/5 bg-zinc-900/40'}
                    `}
                >
                    {/* Day Number */}
                    <span className={`text-sm sm:text-base font-medium mt-1
                        ${isToday ? 'text-[#00F5FF] font-bold' : isSelected ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}
                    `}>
                        {day}
                    </span>

                    {/* Task Indicators */}
                    {dayTasks.length > 0 && (
                        <div className="flex gap-1 flex-wrap justify-center mt-auto mb-1 px-1">
                            {dayTasks.slice(0, 3).map((t, idx) => (
                                <div
                                    key={t.id}
                                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shadow-[0_0_8px_rgba(0,245,255,0.4)]"
                                    style={{ background: STATUS_CONFIG[t.status as keyof typeof STATUS_CONFIG]?.color || '#00F5FF' }}
                                />
                            ))}
                            {dayTasks.length > 3 && (
                                <span className="text-[10px] text-zinc-500 font-bold leading-none">+{dayTasks.length - 3}</span>
                            )}
                        </div>
                    )}

                    {/* Today marker logic */}
                    {isToday && !isSelected && (
                        <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-[#00F5FF] animate-pulse" />
                    )}
                </button>
            );

            if (curWeek.length === 7) {
                weeks.push(<div key={`week-${day}`} className="grid grid-cols-7 gap-2 sm:gap-4">{curWeek}</div>);
                curWeek = [];
            }
        }

        // Pad end of month
        if (curWeek.length > 0 && curWeek.length < 7) {
            const remaining = 7 - curWeek.length;
            for (let i = 0; i < remaining; i++) {
                curWeek.push(<div key={`empty-end-${i}`} className="p-2 opacity-0" />);
            }
            weeks.push(<div key={`week-end`} className="grid grid-cols-7 gap-2 sm:gap-4">{curWeek}</div>);
        }

        return weeks;
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden animate-fade-in pb-6">

            {/* ── Left Column: Calendar Grid ── */}
            <div className="flex-1 flex flex-col glass-panel rounded-2xl p-4 sm:p-6 border border-white/5 relative overflow-y-auto custom-scrollbar">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#00F5FF]/10 flex items-center justify-center border border-[#00F5FF]/20 shadow-[0_0_15px_rgba(0,245,255,0.1)]">
                            <CalendarIcon className="w-5 h-5 text-[#00F5FF]" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                            {monthNames[currentDate.getMonth()]} <span className="text-zinc-500">{currentDate.getFullYear()}</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={goToToday} className="btn-surface text-xs h-8 px-3 rounded-lg hidden sm:block">
                            Today
                        </button>
                        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/5">
                            <button onClick={prevMonth} className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
                                <ChevronLeft className="w-4 h-4 text-zinc-400" />
                            </button>
                            <button onClick={nextMonth} className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
                                <ChevronRight className="w-4 h-4 text-zinc-400" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-2">
                    {dayNames.map(day => (
                        <div key={day} className="text-center font-bold text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="flex flex-col gap-2 sm:gap-4 pb-4">
                    {renderWeeks()}
                </div>
            </div>

            {/* ── Right Column: Selected Date Tasks ── */}
            <div className="w-full lg:w-[400px] flex flex-col gap-4">

                {/* Date Header Plate */}
                <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden flex-shrink-0">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F5FF]/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#00F5FF] mb-1">
                        {selectedDate ? dayNames[selectedDate.getDay()] : 'Select Date'}
                    </h3>
                    <p className="text-2xl font-light text-white tracking-tight">
                        {selectedDate
                            ? `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
                            : 'No date selected'}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00F5FF]" />
                        <span className="text-xs text-zinc-400 font-medium">
                            {selectedDateTasks.length} {selectedDateTasks.length === 1 ? 'task' : 'tasks'} due
                        </span>
                    </div>
                </div>

                {/* Tasks List */}
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1 min-h-[300px]">
                    <AnimatePresence mode="popLayout">
                        {selectedDateTasks.length > 0 ? (
                            selectedDateTasks.map((task) => (
                                <motion.div
                                    key={task.id}
                                    layout
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="pointer-events-none" // Optional: Make cards static in calendar viewing
                                    style={{ pointerEvents: 'auto' }} // Override since cards have interactions
                                >
                                    <TaskCard
                                        task={task as any}
                                        userId={userId}
                                        userRole={userRole}
                                        employees={employees}
                                        isKanban={false}
                                    />
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center p-10 text-center glass-panel rounded-2xl border border-white/5 h-48"
                            >
                                <CalendarIcon className="w-8 h-8 text-zinc-700 mb-3" />
                                <p className="text-sm font-semibold text-zinc-500 uppercase">FREE DAY!</p>
                                <p className="text-xs text-zinc-600 mt-1 max-w-[200px]">
                                    No tasks are scheduled for this date.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>

        </div>
    );
}
