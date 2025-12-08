import React, { useState } from 'react';
import { CalendarTask } from '../../types';

interface CalendarWidgetProps {
  isDarkMode?: boolean;
  tasks?: CalendarTask[];
  loading?: boolean;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ 
  isDarkMode = false,
  tasks = [],
  loading = false,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'Month' | 'Year'>('Month');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date().getDate();
  const isCurrentMonth = 
    new Date().getFullYear() === year && 
    new Date().getMonth() === month;

  // Generate calendar days
  const calendarDays: (number | null)[] = [];
  
  // Previous month days
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Task color mapping
  const getColorClass = (color: string) => {
    const colors = {
      purple: 'bg-purple-500',
      blue: 'bg-blue-500',
      emerald: 'bg-emerald-500',
      amber: 'bg-amber-500',
    };
    return colors[color as keyof typeof colors] || 'bg-gray-500';
  };

  // Loading state
  if (loading) {
    return (
      <div className={`
        rounded-lg border h-[375px] flex items-center justify-center
        ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}
      `}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-2"></div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      rounded-lg border 
      ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}
    `}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'}`}>
        <h3 className={`text-lg font-semibold font-['Inter'] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Calendar
        </h3>
      </div>

      {/* Calendar Controls */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          {/* Year Dropdown */}
          <select
            value={year}
            onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), month, 1))}
            className={`px-3 py-1 rounded border text-sm font-medium ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {Array.from({ length: 11 }, (_, i) => year - 5 + i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* Month Dropdown */}
          <select
            value={month}
            onChange={(e) => setCurrentDate(new Date(year, parseInt(e.target.value), 1))}
            className={`px-2 py-1 rounded border text-sm font-medium ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {monthNames.map((name, index) => (
              <option key={index} value={index}>{name}</option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex gap-1 border rounded overflow-hidden">
            <button
              onClick={() => setViewMode('Month')}
              className={`px-2 py-1 text-xs font-medium ${
                viewMode === 'Month'
                  ? 'bg-cyan-500 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-white text-gray-600'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('Year')}
              className={`px-3 py-1 text-xs font-medium ${
                viewMode === 'Year'
                  ? 'bg-cyan-500 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-white text-gray-600'
              }`}
            >
              Year
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="mb-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div
                key={day}
                className={`text-center text-xs font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={index} className="aspect-square" />;
              }

              const isToday = isCurrentMonth && day === today;
              const isSelected = day === selectedDay;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDay(day)}
                  className={`
                    aspect-square rounded flex items-center justify-center text-sm font-medium
                    transition-colors
                    ${isSelected 
                      ? 'bg-cyan-500 text-white' 
                      : isToday
                      ? `border-2 border-cyan-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`
                      : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'}`}>
        <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Upcoming Tasks
        </h4>
        
        {tasks.length === 0 ? (
          <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            No upcoming tasks
          </p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getColorClass(task.color)}`} />
                <div className="flex-1">
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {task.title}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {task.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarWidget;