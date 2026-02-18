import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const MultiDatePicker = ({ selectedDates = [], onChange }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Helper to format date as YYYY-MM-DD (local time)
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay(); // 0 = Sunday
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const toggleDate = (dateStr) => {
        const newSelectedDates = selectedDates.includes(dateStr)
            ? selectedDates.filter(d => d !== dateStr)
            : [...selectedDates, dateStr].sort(); // Keep sorted

        onChange(newSelectedDates);
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        // Adjust grid for start day (if 0 is Sunday)
        // Let's assume standard grid starting Sunday

        const days = [];
        // Empty cells for days before first day of month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="p-2"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(year, month, day);
            const dateStr = formatDate(dateObj);
            const isSelected = selectedDates.includes(dateStr);
            const isToday = dateStr === formatDate(new Date());

            days.push(
                <button
                    type="button"
                    key={dateStr}
                    onClick={() => toggleDate(dateStr)}
                    className={`
                        aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                        ${isSelected
                            ? 'bg-primary text-white shadow-lg scale-105'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10'
                        }
                        ${isToday && !isSelected ? 'border-2 border-primary/50 text-primary' : ''}
                    `}
                >
                    {day}
                </button>
            );
        }
        return days;
    };

    const formatMonthYear = (date) => {
        return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="glass-card p-4 bg-slate-900/50 border-glass-border">
            <div className="flex items-center justify-between mb-4">
                <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2 font-bold text-white capitalize">
                    <Calendar size={18} className="text-primary" />
                    {formatMonthYear(currentDate)}
                </div>
                <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                <div>Dom</div>
                <div>Lun</div>
                <div>Mar</div>
                <div>Mié</div>
                <div>Jue</div>
                <div>Vie</div>
                <div>Sáb</div>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {renderCalendar()}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-sm">
                <span className="text-gray-400">
                    {selectedDates.length} días seleccionados
                </span>
                {selectedDates.length > 0 && (
                    <button
                        type="button"
                        onClick={() => onChange([])}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                        Limpiar selección
                    </button>
                )}
            </div>
        </div>
    );
};

export default MultiDatePicker;
