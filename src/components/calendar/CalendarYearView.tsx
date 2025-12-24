import React from 'react';
import { CalendarEvent } from '../../types';

interface CalendarYearViewProps {
  year: number;
  events: CalendarEvent[];
  onDayClick: (month: number, day: number) => void;
  isDarkMode?: boolean;
}

const CalendarYearView: React.FC<CalendarYearViewProps> = ({
  year,
  events,
  onDayClick,
  isDarkMode = false,
}) => {
  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Check if date has events
  const hasEventsOnDate = (month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    // FIX: startsWith kullan - backend datetime döndürüyor (2025-12-24T10:30:00)
    return events.some(event => event.date && event.date.startsWith(dateStr));
  };

  return (
    <div className="grid grid-cols-4 gap-6">
      {Array.from({ length: 12 }, (_, monthIndex) => {
        const monthFirstDay = getFirstDayOfMonth(year, monthIndex);
        const monthDays = getDaysInMonth(year, monthIndex);
        const isCurrentMonthInYear = currentYear === year && currentMonth === monthIndex;

        return (
          <div 
            key={monthIndex} 
            className={`rounded-lg border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}
          >
            {/* Month Name */}
            <div className={`text-sm font-semibold mb-3 text-center ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              {monthNamesShort[monthIndex]}
            </div>
            
            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: monthFirstDay }, (_, j) => (
                <div key={`empty-${j}`} className="aspect-square" />
              ))}
              
              {/* Month days */}
              {Array.from({ length: monthDays }, (_, dayIndex) => {
                const dayNum = dayIndex + 1;
                const isToday = isCurrentMonthInYear && dayNum === currentDay;
                const hasEvents = hasEventsOnDate(monthIndex, dayNum);
                
                return (
                  <button
                    key={dayIndex}
                    onClick={() => onDayClick(monthIndex, dayNum)}
                    className={`
                      aspect-square rounded flex items-center justify-center text-[11px] font-medium
                      transition-all relative
                      ${isToday
                        ? 'bg-cyan-500 text-white font-bold'
                        : isDarkMode
                        ? 'text-gray-400 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    {dayNum}
                    {hasEvents && (
                      <div className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-cyan-500'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CalendarYearView;