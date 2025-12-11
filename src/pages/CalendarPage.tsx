import React, { useState } from 'react';
import Sidebar from '../components/layouts/Sidebar';
import { useTheme } from '../context/ThemeContext';
import { useCalendarEvents } from '../hooks/useCalendar';
import CalendarGrid from '../components/calendar/CalendarGrid';
import TicketDetailPanel from '../components/calendar/TicketDetailPanel';
import { CalendarEvent } from '../types';
import CalendarYearView from '../components/calendar/CalendarYearView';

const CalendarPage: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(11); // 0 = January 11 = December
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');

  const { events, loading, markAsDone } = useCalendarEvents(selectedYear, selectedMonth + 1);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleMarkAsDone = async () => {
    if (selectedEvent) {
      await markAsDone(selectedEvent.id);
      setSelectedEvent({ ...selectedEvent, status: 'Done' });
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Filter events by search and type
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.ticketId.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesPriority = true;
    if (filterType !== 'all') {
      // Normalize both to lowercase for comparison
      matchesPriority = event.priority.toLowerCase() === filterType.toLowerCase();
    }
    return matchesSearch && matchesPriority;
  }); 

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Sidebar */}
      <Sidebar userRole="user" isDarkMode = {isDarkMode}/>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className={`h-32 px-8 py-5 border-b ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'} relative`}>
          {/* Dark/Light Mode Toggle */}
          <div className="absolute top-8 right-8 flex items-center gap-2">
            <div className="relative">
              <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-600' : 'text-yellow-500'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
              {!isDarkMode && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            
            <button onClick={toggleTheme} className="relative w-14 h-7 rounded-full transition-colors duration-300 bg-cyan-500" aria-label="Toggle theme">
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
            
            <div className="relative">
              <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-blue-400' : 'text-gray-800'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
              {isDarkMode && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Page Title */}
          <h1 className="text-cyan-800 text-2xl font-semibold font-['Inter'] leading-9 mb-3">
            Calendar
          </h1>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className={`flex-1 h-10 px-3 py-2 rounded-lg border flex items-center gap-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-neutral-200'}`}>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 bg-transparent text-base font-normal font-['Inter'] focus:outline-none ${isDarkMode ? 'text-gray-200 placeholder-gray-500' : 'text-black placeholder-slate-400'}`}
              />
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button 
                onClick={() => setShowFilter(!showFilter)}
                className={`h-10 px-4 rounded-lg border flex items-center gap-2 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-neutral-200 text-black'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="text-sm font-medium">Filter</span>   
              </button>
              
              {/* Filter Dropdown */}
              {showFilter && (
                <div className={`absolute right-0 top-12 w-48 rounded-lg border shadow-lg z-10 ${isDarkMode ? 'bg-gray-800 border-gray-700  text-gray-200' : 'bg-white border-gray-200 text-black'}`}>
                  <div className="p-2">
                    <button
                      onClick={() => { setFilterType('all'); setShowFilter(false); }}
                      className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 ${filterType === 'all' ? 'bg-cyan-100 text-cyan-700' : ''}`}
                    >
                      🗃️ All Tickets
                    </button>
                    <button
                      onClick={() => { setFilterType('high'); setShowFilter(false); }}
                      className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 ${filterType === 'ticket' ? 'bg-cyan-100 text-cyan-700' : ''}`}
                    >
                      🔴 High Priority
                    </button>
                    <button
                      onClick={() => { setFilterType('medium'); setShowFilter(false); }}
                      className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 ${filterType === 'task' ? 'bg-cyan-100 text-cyan-700' : ''}`}
                    >
                      🟡 Medium Priority
                    </button>
                    <button
                      onClick={() => { setFilterType('low'); setShowFilter(false); }}
                      className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 ${filterType === 'deadline' ? 'bg-cyan-100 text-cyan-700' : ''}`}
                    >
                      🟢 Low Priority
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-8 py-6">
          <div className="flex gap-6">
            {/* Ticket Detail Panel - Left Side */}
            <div className="w-80 flex-shrink-0">
              <TicketDetailPanel
                event={selectedEvent}
                isDarkMode={isDarkMode}
                onMarkAsDone={handleMarkAsDone}
              />
            </div>

            {/* Calendar Grid - Right Side */}
            <div className="flex-1">
              {/* Month/Year Selector */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {/* Year Dropdown */}
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className={`h-10 px-3 rounded-lg border text-sm font-semibold ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-neutral-200 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer`}
                  >
                    {Array.from({ length: 11 }, (_, i) => selectedYear - 5 + i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>

                  {/* Month Dropdown - Only show in Month view */}
                  {viewMode === 'month' && (
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className={`h-10 px-3 rounded-lg border text-sm font-semibold ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-neutral-200 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer`}
                    >
                      {monthNames.map((name, index) => (
                        <option key={index} value={index}>{name}</option>
                      ))}
                    </select>
                  )}

                  {/* View Toggle Buttons */}
                  <div className={`flex border rounded-lg overflow-hidden ${isDarkMode ? 'border-gray-700' : 'border-neutral-200'}`}>
                    <button 
                      onClick={() => setViewMode('month')}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        viewMode === 'month' 
                          ? 'bg-cyan-600 text-white' 
                          : isDarkMode 
                            ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' 
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Month
                    </button>
                    <button 
                      onClick={() => setViewMode('year')}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        viewMode === 'year' 
                          ? 'bg-cyan-600 text-white' 
                          : isDarkMode 
                            ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' 
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Year
                    </button>
                  </div>
                </div>
              </div>

              {/* Calendar Grid or Year View */}
              {viewMode === 'month' ? (
                <CalendarGrid
                  year={selectedYear}
                  month={selectedMonth}
                  events={filteredEvents}
                  onEventClick={handleEventClick}
                  isDarkMode={isDarkMode}
                  loading={loading}
                />
              ) : (
                <CalendarYearView
                  year={selectedYear}
                  events={filteredEvents}
                  onDayClick={(month: number, day: number) => {
                    setSelectedMonth(month);
                    setViewMode('month');
                    // Optional: Auto-select event on that day
                    const dateStr = `${selectedYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayEvent = filteredEvents.find(event => event.date === dateStr);
                    if (dayEvent) {
                      setSelectedEvent(dayEvent);
                    }
                  }}
                  isDarkMode={isDarkMode}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;