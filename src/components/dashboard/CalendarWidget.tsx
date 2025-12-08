import React, { useState } from 'react';

interface CalendarWidgetProps {
  isDarkMode?: boolean;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ isDarkMode = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 17)); // October 2025
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(9); // October = 9
  const [selectedDay, setSelectedDay] = useState<number | null>(17); // Seçili gün
  
  // TODO: Backend'den gelecek görevler
  const upcomingTasks = [
    { id: 1, title: 'Review ticket #TCK122', time: '10:00 AM', color: 'bg-purple-500' },
    { id: 2, title: 'Review ticket #TCK134', time: '12:00 AM', color: 'bg-blue-500' },
    { id: 3, title: 'Review ticket #TCK156', time: '2:00 PM', color: 'bg-emerald-500' }
  ];

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(selectedYear, selectedMonth);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === selectedYear && today.getMonth() === selectedMonth;
  const todayDate = today.getDate();

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    setCurrentDate(new Date(year, selectedMonth, 1));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = parseInt(e.target.value);
    setSelectedMonth(month);
    setCurrentDate(new Date(selectedYear, month, 1));
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  // Yıl listesi oluştur (2020-2030)
  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

  return (
    <div className={`
      rounded-lg border
      ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}
    `}>
      {/* Header with Title */}
      <div className={`px-6 pt-6 pb-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'}`}>
        <h3 className={`text-lg font-semibold font-['Inter'] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Calendar
        </h3>
      </div>

      {/* Controls Section */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-2">
          {/* Date Selectors */}
          <div className="flex items-center gap-2">
            {/* Year Selector */}
            <select 
              value={selectedYear}
              onChange={handleYearChange}
              className={`
                text-sm px-3 py-1.5 rounded border focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium
                ${isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
                }
              `}
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            {/* Month Selector */}
            <select 
              value={selectedMonth}
              onChange={handleMonthChange}
              className={`
                text-sm px-3 py-1.5 rounded border focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium
                ${isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
                }
              `}
            >
              {monthNames.map((month, i) => (
                <option key={i} value={i}>{month.slice(0, 3)}</option>
              ))}
            </select>
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-sm rounded transition-colors font-medium ${
                viewMode === 'month' 
                  ? 'bg-cyan-500 text-white' 
                  : isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:text-white' 
                    : 'bg-gray-100 text-gray-700 hover:text-gray-900'
              }`}
            >
              Month
            </button>
            <button 
              onClick={() => setViewMode('year')}
              className={`px-3 py-1.5 text-sm rounded transition-colors font-medium ${
                viewMode === 'year' 
                  ? 'bg-cyan-500 text-white' 
                  : isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:text-white' 
                    : 'bg-gray-100 text-gray-700 hover:text-gray-900'
              }`}
            >
              Year
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="px-6 pb-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div 
              key={day} 
              className={`text-center text-sm font-semibold ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = isCurrentMonth && day === todayDate;
            const isSelected = day === selectedDay;
            
            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`
                  aspect-square flex items-center justify-center text-base rounded-lg transition-colors font-medium
                  ${isSelected
                    ? 'bg-cyan-500 text-white font-bold' 
                    : isToday 
                      ? 'border-2 border-cyan-600 text-cyan-600 font-semibold'
                      : isDarkMode
                        ? 'text-gray-200 hover:bg-gray-700'
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

      {/* Upcoming Tasks */}
      <div className={`px-6 pb-6 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'}`}>
        <h4 className={`text-base font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Upcoming Tasks
        </h4>
        <div className="space-y-3">
          {upcomingTasks.map((task) => (
            <div key={task.id} className="flex items-start gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${task.color} mt-1.5 flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {task.title}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {task.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;

