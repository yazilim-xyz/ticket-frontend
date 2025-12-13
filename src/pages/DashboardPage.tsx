import React from 'react';
import Sidebar from '../components/layouts/Sidebar';
import { useTheme } from '../context/ThemeContext';
import StatCard from '../components/dashboard/StatCard';
import PersonalStats from '../components/dashboard/PersonalStats';
import ActivityTrend from '../components/dashboard/ActivityTrend';
import TeamChat from '../components/dashboard/TeamChat';
import CalendarWidget from '../components/dashboard/CalendarWidget';
import NotificationsPanel from '../components/dashboard/NotificationsPanel';

// Custom hooks'ları import et
import {
  useDashboardStats,
  usePersonalStats,
  useActivityTrend,
  useChatMessages,
  useUpcomingTasks,
  useNotifications,
} from '../hooks/useDashboard';

const DashboardPage: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  // Custom hooks ile canlı veri çek
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats();
  const { personalStats, loading: personalLoading } = usePersonalStats();
  const { activityData, loading: activityLoading } = useActivityTrend('week');
  const { messages, sendMessage, loading: chatLoading, sending } = useChatMessages();
  const { tasks, loading: tasksLoading } = useUpcomingTasks();
  const { notifications, markAsRead, loading: notificationsLoading } = useNotifications(10);

  // Chat mesajı gönderme fonksiyonu
  const handleSendMessage = async (recipientId: string, text: string) => {
    try {
      await sendMessage(recipientId, text);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Ana loading state (sadece kritik veri için)
  if (statsLoading && !stats) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (statsError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold mb-2">Error loading dashboard</p>
          <p>{statsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Sidebar */}
      <Sidebar isDarkMode = {isDarkMode} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className={`h-32 px-8 py-5 border-b ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'} relative`}>
          {/* Dark/Light Mode Toggle - Sağ Üst */}
          <div className="absolute top-8 right-8 flex items-center gap-2">
            {/* Sun Icon with Tick */}
            <div className="relative">
              <svg 
                className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-600' : 'text-yellow-500'}`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" 
                  clipRule="evenodd" 
                />
              </svg>
              {!isDarkMode && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-2.5 h-2.5 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Switch Toggle */}
            <button 
              onClick={toggleTheme} 
              className="relative w-14 h-7 rounded-full transition-colors duration-300 bg-cyan-500" 
              aria-label="Toggle theme"
            >
              <span 
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}`} 
              />
            </button>
            
            {/* Moon Icon with Tick */}
            <div className="relative">
              <svg 
                className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-blue-400' : 'text-gray-800'}`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
              {isDarkMode && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-2.5 h-2.5 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Page Title */}
          <h1 className="text-cyan-800 text-2xl font-semibold font-['Inter'] leading-9 mb-3">
            Dashboard
          </h1>

          {/* Subtitle */}
          <div className={`h-10 px-3 py-2 rounded-lg border flex items-center ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-neutral-200 text-black'}`}>
            <span className="text-base font-normal font-['Inter'] leading-6">
              Welcome back! Here's your overview
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-8 py-6">
          {/* Top Stats Row : API'den gelen veri kullanılıyor */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Active Tickets"
              value={stats?.activeTickets ?? 0}
              change={stats?.activeTicketsChange ?? '+0%'}
              changeType={stats?.activeTicketsChange?.startsWith('+') ? 'positive' : 'negative'}
              iconColor="text-white"
              iconBgColor="bg-emerald-500"
              isDarkMode={isDarkMode}
              icon={
                <svg className="w-11 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 36 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 18L11 9l6 6a18 18 0 0110-7l4-1.5m0 0l-8-2.5m8 2.5l-2.5 8" />
                </svg>
              }
            />

            <StatCard
              title="Pending Tickets"
              value={stats?.pendingTickets ?? 0}
              change={stats?.pendingTicketsChange ?? '+0%'}
              changeType={stats?.pendingTicketsChange?.startsWith('+') ? 'positive' : 'negative'}
              iconColor="text-white"
              iconBgColor="bg-amber-500"
              isDarkMode={isDarkMode}
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <StatCard
              title="Resolved Tickets"
              value={stats?.resolvedTickets ?? 0}
              change={stats?.resolvedTicketsChange ?? '+0%'}
              changeType={stats?.resolvedTicketsChange?.startsWith('+') ? 'positive' : 'negative'}
              iconColor="text-white"
              iconBgColor="bg-sky-500"
              isDarkMode={isDarkMode}
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <StatCard
              title="Overdue Tickets"
              value={stats?.overdueTickets ?? 0}
              change={stats?.overdueTicketsChange ?? '-0%'}
              changeType={stats?.overdueTicketsChange?.startsWith('-') ? 'negative' : 'positive'}
              iconColor="text-white"
              iconBgColor="bg-red-700"
              isDarkMode={isDarkMode}
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              }
            />
          </div>

          {/* Dashboard Panels - 3:2 Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Left Column - 3 units (60%) */}
            <div className="xl:col-span-3 flex flex-col gap-6">
              <div className="flex-shrink-0">
                <TeamChat 
                  isDarkMode={isDarkMode}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  loading={chatLoading}
                  sending={sending}
                />
              </div>
              <PersonalStats 
                isDarkMode={isDarkMode}
                stats={personalStats}
                loading={personalLoading}
              />
              <ActivityTrend 
                isDarkMode={isDarkMode}
                data={activityData}
                loading={activityLoading}
              />
            </div>

            {/* Right Column - 2 units (40%) */}
            <div className="xl:col-span-2 flex flex-col gap-6">
              <CalendarWidget 
                isDarkMode={isDarkMode}
                tasks={tasks}
                loading={tasksLoading}
              />
              <NotificationsPanel 
                isDarkMode={isDarkMode}
                notifications={notifications}
                onMarkAsRead={markAsRead}
                loading={notificationsLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;