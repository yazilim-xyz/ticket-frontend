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
  const [selectedTask, setSelectedTask] = useState<CalendarTask | null>(null);

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

  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

  // Check if day has tasks
  const getTasksForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(task => task.date === dateStr);
  };

  // Handle day click
  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    const dayTasks = getTasksForDay(day);
    if (dayTasks.length > 0) {
      setSelectedTask(dayTasks[0]); // Show first task in popup
    }
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

          {/* Month Dropdown - Only show in Month view */}
          {viewMode === 'Month' && (
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
          )}

          {/* View Toggle */}
          <div className={`flex gap-1 border rounded overflow-hidden ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
            <button
              onClick={() => setViewMode('Month')}
              className={`px-2 py-1 text-xs font-medium transition-colors ${
                viewMode === 'Month'
                  ? 'bg-cyan-500 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('Year')}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                viewMode === 'Year'
                  ? 'bg-cyan-500 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Year
            </button>
          </div>
        </div>

        {/* Month View */}
        {viewMode === 'Month' && (
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
                const dayTasks = getTasksForDay(day);
                const hasTasks = dayTasks.length > 0;

                return (
                  <button
                    key={index}
                    onClick={() => handleDayClick(day)}
                    className={`
                      aspect-square rounded flex flex-col items-center justify-center text-sm font-medium
                      transition-colors relative
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
                    {hasTasks && (
                      <div className="flex gap-0.5 absolute bottom-1">
                        {dayTasks.slice(0, 3).map((task, i) => (
                          <div
                            key={i}
                            className={`w-1 h-1 rounded-full ${getColorClass(task.color)}`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Year View */}
        {viewMode === 'Year' && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            {Array.from({ length: 12 }, (_, i) => {
              const monthFirstDay = getFirstDayOfMonth(year, i);
              const monthDays = getDaysInMonth(year, i);
              const isCurrentMonthInYear = new Date().getFullYear() === year && new Date().getMonth() === i;
              
              return (
                <div key={i} className={`rounded border p-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className={`text-xs font-semibold mb-2 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {monthNamesShort[i]}
                  </div>
                  <div className="grid grid-cols-7 gap-0.5">
                    {Array.from({ length: monthFirstDay }, (_, j) => (
                      <div key={`empty-${j}`} className="aspect-square" />
                    ))}
                    {Array.from({ length: monthDays }, (_, day) => {
                      const dayNum = day + 1;
                      const isToday = isCurrentMonthInYear && dayNum === today;
                      const dateStr = `${year}-${String(i + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      const hasTasks = tasks.some(task => task.date === dateStr);
                      
                      return (
                        <button
                          key={day}
                          onClick={() => {
                            setCurrentDate(new Date(year, i, dayNum));
                            setViewMode('Month');
                            handleDayClick(dayNum);
                          }}
                          className={`
                            aspect-square rounded flex items-center justify-center text-[10px]
                            transition-colors relative
                            ${isToday
                              ? 'bg-cyan-500 text-white font-bold'
                              : isDarkMode
                              ? 'text-gray-400 hover:bg-gray-700'
                              : 'text-gray-600 hover:bg-gray-100'
                            }
                          `}
                        >
                          {dayNum}
                          {hasTasks && (
                            <div className="absolute bottom-0 w-1 h-1 rounded-full bg-cyan-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
            {tasks.slice(0, 3).map((task) => (
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

      {/* Task Detail Popup */}
      {selectedTask && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedTask(null)}
        >
          <div 
            className={`rounded-lg p-6 max-w-md w-full mx-4 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedTask.title}
              </h3>
              <button
                onClick={() => setSelectedTask(null)}
                className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Ticket ID
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedTask.ticketId}
                </p>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Time
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedTask.time}
                </p>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Priority
                </p>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  selectedTask.priority.toLowerCase() === 'high' 
                    ? 'bg-red-100 text-red-700'
                    : selectedTask.priority.toLowerCase() === 'medium'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {selectedTask.priority}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;