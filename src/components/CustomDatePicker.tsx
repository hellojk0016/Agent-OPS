"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO, isValid } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Portal from "./Portal";

interface CustomDatePickerProps {
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
    className?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
    value,
    onChange,
    placeholder = "SELECT DATE",
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, side: 'bottom' as 'top' | 'bottom' });
    const [isMobile, setIsMobile] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Sync currentMonth with value if value changes
    useEffect(() => {
        if (value) {
            const date = parseISO(value);
            if (isValid(date)) {
                setCurrentMonth(date);
            }
        }
    }, [value]);

    // Handle Mobile Detection
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Calculate position for Portal
    const updateCoords = useCallback(() => {
        if (isOpen && triggerRef.current && !isMobile) {
            const rect = triggerRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const dropdownWidth = 280;
            const dropdownHeight = 380; // Approximate height

            let left = rect.left + window.scrollX;
            let top = rect.bottom + window.scrollY;
            let side: 'top' | 'bottom' = 'bottom';

            // Collision Detection - Horizontal
            if (left + dropdownWidth > viewportWidth) {
                left = viewportWidth - dropdownWidth - 20;
            }
            if (left < 20) left = 20;

            // Collision Detection - Vertical
            if (rect.bottom + dropdownHeight > viewportHeight && rect.top > dropdownHeight) {
                top = rect.top + window.scrollY - dropdownHeight - 10;
                side = 'top';
            }

            setCoords({ top, left, width: rect.width, side });
        }
    }, [isOpen, isMobile]);

    useEffect(() => {
        updateCoords();
        window.addEventListener('scroll', updateCoords);
        window.addEventListener('resize', updateCoords);
        return () => {
            window.removeEventListener('scroll', updateCoords);
            window.removeEventListener('resize', updateCoords);
        };
    }, [updateCoords]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                triggerRef.current && !triggerRef.current.contains(event.target as Node) &&
                dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const onDateClick = (day: Date) => {
        onChange(format(day, "yyyy-MM-dd"));
        setIsOpen(false);
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/5 bg-zinc-900/50">
                <span className="text-sm font-bold uppercase tracking-widest text-zinc-100">
                    {format(currentMonth, "MMMM yyyy")}
                </span>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={prevMonth}
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors text-zinc-400 hover:text-neon-blue active:scale-90"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        onClick={nextMonth}
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors text-zinc-400 hover:text-neon-blue active:scale-90"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    {isMobile && (
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-zinc-400 hover:text-white ml-2"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        return (
            <div className="grid grid-cols-7 mb-2 px-2 mt-2">
                {days.map((day) => (
                    <div key={day} className="text-[10px] font-bold text-zinc-600 text-center py-2 uppercase tracking-tighter">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        const selectedDate = value ? parseISO(value) : null;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, "d");
                const cloneDay = day;
                const isSelected = selectedDate && isValid(selectedDate) && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);

                days.push(
                    <div
                        key={day.toString()}
                        className={`relative aspect-square flex items-center justify-center cursor-pointer text-sm transition-all rounded-xl m-1
                            ${!isCurrentMonth ? "text-zinc-700 pointer-events-none opacity-20" : "text-zinc-300 hover:bg-neon-blue/10 hover:text-neon-blue"}
                            ${isSelected ? "bg-neon-blue/20 text-neon-blue font-bold ring-2 ring-neon-blue/50 shadow-[0_0_15px_rgba(0,245,255,0.3)]" : ""}
                        `}
                        onClick={() => isCurrentMonth && onDateClick(cloneDay)}
                    >
                        <span>{formattedDate}</span>
                        {isSameDay(day, new Date()) && !isSelected && (
                            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-neon-blue rounded-full shadow-[0_0_8px_rgba(0,245,255,1)]" />
                        )}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="px-2 pb-4">{rows}</div>;
    };

    const displayDate = () => {
        if (!value) return placeholder;
        const date = parseISO(value);
        return isValid(date) ? format(date, "dd-MM-yyyy") : placeholder;
    };

    return (
        <div className={`relative ${className}`}>
            <div 
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className="field-input flex items-center justify-between cursor-pointer group hover:border-neon-blue/30 transition-all duration-300 h-14 active:scale-[0.99]"
            >
                <span className={`text-base font-medium uppercase tracking-wide ${value ? "text-zinc-100" : "text-zinc-500"}`}>
                    {displayDate()}
                </span>
                <CalendarIcon className={`w-5 h-5 transition-all duration-300 ${isOpen ? "text-neon-blue drop-shadow-[0_0_8px_rgba(0,245,255,0.5)]" : "text-neon-blue/50 group-hover:text-neon-blue group-hover:drop-shadow-[0_0_8px_rgba(0,245,255,0.3)]"}`} />
            </div>

            <Portal>
                <AnimatePresence>
                    {isOpen && (
                        <>
                            {/* Backdrop for Mobile */}
                            {isMobile && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsOpen(false)}
                                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999]"
                                />
                            )}
                            <motion.div
                                ref={dropdownRef}
                                initial={isMobile 
                                    ? { opacity: 0, y: "100%" } 
                                    : { opacity: 0, y: coords.side === 'bottom' ? -10 : 10, scale: 0.95 }
                                }
                                animate={isMobile 
                                    ? { opacity: 1, y: 0 } 
                                    : { opacity: 1, y: coords.side === 'bottom' ? 5 : -5, scale: 1 }
                                }
                                exit={isMobile 
                                    ? { opacity: 0, y: "100%" } 
                                    : { opacity: 0, y: coords.side === 'bottom' ? -10 : 10, scale: 0.95 }
                                }
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                style={isMobile ? {
                                    position: "fixed",
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    zIndex: 10000,
                                } : { 
                                    position: "absolute",
                                    top: coords.top,
                                    left: coords.left,
                                    width: 320,
                                    zIndex: 10000
                                }}
                                className={`bg-[#050505] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(0,245,255,0.1)] overflow-hidden backdrop-blur-3xl
                                    ${isMobile ? "rounded-t-[32px] pb-10" : "rounded-2xl"}
                                `}
                            >
                                {renderHeader()}
                                {renderDays()}
                                {renderCells()}
                                
                                <div className="p-3 border-t border-white/5 grid grid-cols-2 gap-3 bg-zinc-900/20">
                                    <button
                                        type="button"
                                        onClick={() => onDateClick(new Date())}
                                        className="py-3.5 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-neon-blue hover:bg-neon-blue/5 rounded-2xl transition-all border border-transparent hover:border-neon-blue/20"
                                    >
                                        Today
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const tomorrow = new Date();
                                            tomorrow.setDate(tomorrow.getDate() + 1);
                                            onDateClick(tomorrow);
                                        }}
                                        className="py-3.5 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-neon-blue hover:bg-neon-blue/5 rounded-2xl transition-all border border-transparent hover:border-neon-blue/20"
                                    >
                                        Tomorrow
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </Portal>
        </div>
    );
};

export default CustomDatePicker;
