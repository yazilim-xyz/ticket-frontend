import React from 'react';
import { CalendarEvent } from '../../types';

interface CalendarGridProps {
  year: number;
  month: number;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  isDarkMode?: boolean;
  loading?: boolean;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  year,
  month,
  events,
  onEventClick,
  isDarkMode = false,
  loading = false,
}) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  // Create calendar grid
  const calendarDays: (number | null)[] = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Get events for a specific day
  const getEventsForDay = (day: number): CalendarEvent[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  // Check if date is today
  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  if (loading) {
    return (
      <div className={`rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'} h-[600px] flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'} overflow-hidden`}>
      {/* Week Day Headers */}
      <div className={`grid grid-cols-7 border-b ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-zinc-200 bg-gray-50'}`}>
        {weekDays.map((day) => (
          <div
            key={day}
            className={`py-3 text-center text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const dayEvents = day ? getEventsForDay(day) : [];
          const isTodayDate = day ? isToday(day) : false;

          return (
            <div
              key={index}
              className={`
                min-h-[100px] border-b border-r p-2 relative transition-colors
                ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'}
                ${day ? 'cursor-pointer hover:bg-cyan-50/20' : 'bg-gray-50/50'}
                ${index % 7 === 6 ? 'border-r-0' : ''}
              `}
            >
              {day && (
                <>
                  {/* Day Number */}
                  <div
                    className={`
                      w-7 h-7 flex items-center justify-center text-sm font-medium rounded-full mb-1
                      ${isTodayDate 
                        ? 'bg-cyan-600 text-white' 
                        : isDarkMode 
                        ? 'text-gray-300' 
                        : 'text-gray-700'
                      }
                    `}
                  >
                    {day}
                  </div>

                  {/* Events */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <button
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className={`
                          w-full text-left px-2 py-1 rounded text-xs font-medium truncate
                          transition-all hover:shadow-sm
                          ${isDarkMode ? 'hover:brightness-110' : 'hover:brightness-95'}
                        `}
                        style={{
                          backgroundColor: event.color + '20',
                          color: event.color,
                          borderLeft: `3px solid ${event.color}`,
                        }}
                      >
                        {event.ticketId}
                      </button>
                    ))}
                    
                    {/* Show +more if there are more than 3 events */}
                    {dayEvents.length > 3 && (
                      <div className={`text-xs font-medium px-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;