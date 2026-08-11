import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const CustomDatePicker = ({ label, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse YYYY-MM-DD string into a local Date
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const selectedDate = parseDate(value);
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());

  // Close calendar on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update calendar view when selected value changes externally
  useEffect(() => {
    const d = parseDate(value);
    setCurrentMonth(d.getMonth());
    setCurrentYear(d.getFullYear());
  }, [value]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Calculate days in the current viewing month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Calculate the day of the week the month starts on (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const startOffset = getFirstDayOfMonth(currentMonth, currentYear);

  // Handle month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Format date to YYYY-MM-DD for the output
  const formatDateString = (year, month, day) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Format date for button display (e.g., "10 August 2026")
  const formatDisplayDate = (date) => {
    const d = date.getDate();
    const mName = monthNames[date.getMonth()];
    const y = date.getFullYear();
    return `${d} ${mName} ${y}`;
  };

  // Handle day selection
  const handleSelectDay = (day) => {
    const dateStr = formatDateString(currentYear, currentMonth, day);
    onChange(dateStr);
    setIsOpen(false);
  };

  // Render day grid items
  const renderDays = () => {
    const cells = [];
    
    // Empty padding slots for offset days
    for (let i = 0; i < startOffset; i++) {
      cells.push(<div key={`empty-${i}`} className="h-9 w-9" />);
    }

    // Actual day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentMonth &&
        selectedDate.getFullYear() === currentYear;

      const isToday =
        new Date().getDate() === day &&
        new Date().getMonth() === currentMonth &&
        new Date().getFullYear() === currentYear;

      cells.push(
        <button
          key={`day-${day}`}
          type="button"
          onClick={() => handleSelectDay(day)}
          className={`h-9 w-9 flex items-center justify-center text-xs font-bold rounded-xl btn-animate cursor-pointer transition-all ${
            isSelected
              ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
              : isToday
              ? 'border border-amber-500/50 text-amber-400 bg-amber-500/5'
              : 'text-slate-300 hover:bg-white/5 hover:text-white'
          }`}
        >
          {day}
        </button>
      );
    }

    return cells;
  };

  return (
    <div className="relative font-sans" ref={containerRef}>
      {label && <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 bg-[#0f172a]/45 border border-white/10 rounded-xl text-slate-200 text-xs py-2 px-3 h-9 text-left focus:outline-none cursor-pointer"
      >
        <CalendarIcon className="h-4 w-4 text-slate-500 shrink-0" />
        <span className={`flex-1 font-semibold truncate ${value ? 'text-slate-200' : 'text-slate-400'}`}>
          {value ? formatDisplayDate(selectedDate) : (placeholder || 'Select Date')}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-[290px] glass-panel bg-slate-950/95 border border-white/10 rounded-2xl p-4 shadow-2xl card-animate">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <h4 className="font-extrabold text-sm text-amber-400 tracking-wide">
              {monthNames[currentMonth]} {currentYear}
            </h4>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {daysOfWeek.map((day) => (
              <div key={day} className="h-6 w-9 flex items-center justify-center">
                {day}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderDays()}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
