import React, { useState } from 'react';
import Sidebar from '../components/layouts/Sidebar';
import { useTheme } from '../context/ThemeContext';
import StatCard from '../components/dashboard/StatCard';
import AgentLeaderboard from '../components/admin/AgentLeaderboard';
import DepartmentPerformance from '../components/admin/DepartmentPerformance';
import TicketDistributionChart from '../components/admin/TicketDistributionChart';
import TeamActivityTrend from '../components/admin/TeamActivityTrend';
import TeamChat from '../components/dashboard/TeamChat'; 
import { useChatMessages } from '../hooks/useDashboard';
import OverdueTicketsWidget from '../components/admin/OverdueTicketsWidget';
import { useOverdueTickets } from '../hooks/useAdminDashboard';

import {
  useAdminDashboardStats,
  useAgentPerformance,
  useDepartmentStats,
  useTicketDistribution,
  useTeamActivityTrend,
} from '../hooks/useAdminDashboard';

const AdminDashboardPage: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [activityPeriod, setActivityPeriod] = useState<'week' | 'month' | 'year'>('week');

  // Fetch all admin dashboard data
  const { stats, loading: statsLoading, error: statsError } = useAdminDashboardStats();
  const { agents, loading: agentsLoading } = useAgentPerformance();
  const { departments, loading: departmentsLoading } = useDepartmentStats();
  const { distribution, loading: distributionLoading } = useTicketDistribution();
  const { activityData, loading: activityLoading } = useTeamActivityTrend(activityPeriod);
  const { messages, sendMessage, loading: chatLoading, sending } = useChatMessages();
  const { overdueTickets, loading: overdueLoading } = useOverdueTickets();

  const handleActivityPeriodChange = (period: 'week' | 'month' | 'year') => {
    setActivityPeriod(period);
  };

  const handleSendMessage = async (recipientId: string, text: string) => {
    try {
      await sendMessage(recipientId, text);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Main loading state
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
          {/* Dark/Light Mode Toggle */}
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
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                  isDarkMode ? 'translate-x-7' : 'translate-x-0'
                }`}
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
            Admin Dashboard
          </h1>

          {/* Subtitle */}
          <div className={`h-10 px-3 py-2 rounded-lg border flex items-center ${
            isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-neutral-200 text-black'
          }`}>
            <span className="text-base font-normal font-['Inter'] leading-6">
              Team performance and analytics overview
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Team Tickets"
              value={stats?.totalTeamTickets ?? 0}
              change={stats?.totalTeamTicketsChange ?? '+0%'}
              changeType={stats?.totalTeamTicketsChange?.startsWith('+') ? 'positive' : 'negative'}
              iconColor="text-white"
              iconBgColor="bg-cyan-600"
              isDarkMode={isDarkMode}
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />

            <StatCard
              title="Active Agents"
              value={stats?.activeAgents ?? 0}
              change={stats?.activeAgentsChange ?? '+0'}
              changeType="positive"
              iconColor="text-white"
              iconBgColor="bg-emerald-600"
              isDarkMode={isDarkMode}
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />

            <StatCard
              title="Resolved This Week"
              value={stats?.resolvedThisWeek ?? 0}
              change={stats?.resolvedThisWeekChange ?? '+0%'}
              changeType={stats?.resolvedThisWeekChange?.startsWith('+') ? 'positive' : 'negative'}
              iconColor="text-white"
              iconBgColor="bg-blue-600"
              isDarkMode={isDarkMode}
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <StatCard
              title="Avg Team Resolution Time"
              value={stats?.avgTeamResolutionTime ?? '0h'}
              change={stats?.avgTeamResolutionTimeChange ?? '0%'}
              changeType={stats?.avgTeamResolutionTimeChange?.startsWith('-') ? 'positive' : 'negative'}
              iconColor="text-white"
              iconBgColor="bg-purple-600"
              isDarkMode={isDarkMode}
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>

          {/* Dashboard Grid - 3:2 layout*/}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Left Column (3 units - 60%) */}
            <div className="xl:col-span-3 space-y-6">
              <TeamActivityTrend
                isDarkMode={isDarkMode}
                data={activityData}
                loading={activityLoading}
                onPeriodChange={handleActivityPeriodChange}
              />
              <DepartmentPerformance
                isDarkMode={isDarkMode}
                departments={departments}
                loading={departmentsLoading}
              />
              <AgentLeaderboard
                isDarkMode={isDarkMode}
                agents={agents}
                loading={agentsLoading}
              />
            </div>

            {/* Right Column (2 unit - 40%) */}
            <div className="xl:col-span-2 space-y-6">
              <TicketDistributionChart
                isDarkMode={isDarkMode}
                distribution={distribution}
                loading={distributionLoading}
              />
              <OverdueTicketsWidget
                isDarkMode={isDarkMode}
                tickets={overdueTickets}
                loading={overdueLoading}
              />
              <TeamChat
                isDarkMode={isDarkMode}
                messages={messages}
                onSendMessage={handleSendMessage}
                loading={chatLoading}
                sending={sending}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;