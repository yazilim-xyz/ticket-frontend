import React from 'react';
import { AgentPerformance } from '../../types';

interface AgentLeaderboardProps {
  isDarkMode?: boolean;
  agents?: AgentPerformance[];
  loading?: boolean;
}

const AgentLeaderboard: React.FC<AgentLeaderboardProps> = ({
  isDarkMode = false,
  agents = [],
  loading = false,
}) => {
  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-500';
      case 'busy':
        return 'bg-amber-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={`
        rounded-lg border h-[400px] flex items-center justify-center
        ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}
      `}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-2"></div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      rounded-lg border h-[515px] flex flex-col
      ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}
    `}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'} flex items-center justify-between`}>
        <div>
          <h3 className={`text-lg font-semibold font-['Inter'] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Top Performers
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Based on tickets resolved this week
          </p>
        </div>
      </div>

      {/* Agents List */}
      <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
        {agents.length === 0 ? (
          <div className="text-center py-8">
            <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              No agent data available
            </p>
          </div>
        ) : (
          agents.map((agent, index) => (
            <div
              key={agent.id}
              className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-8 text-center">
                <span className={`text-2xl font-bold ${
                  index === 0 
                    ? 'text-yellow-500' 
                    : index === 1 
                    ? 'text-gray-400' 
                    : index === 2 
                    ? 'text-amber-600'
                    : isDarkMode ? 'text-coolGray-600' : 'text-gray-400'
                }`}>
                  {index + 1}
                </span>
              </div>

              {/* Avatar with Status */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br bg-cyan-600 flex items-center justify-center text-white font-semibold text-sm">
                  {agent.avatar}
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${
                  isDarkMode ? 'border-gray-800' : 'border-white'
                } ${getStatusColor(agent.status)}`} />
              </div>

              {/* Agent Info */}
              <div className="flex-1 min-w-[180px]">
                <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {agent.name}
                </h4>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                  {agent.email}
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-8 flex-shrink-0">
                {/* Tickets Solved */}
                <div className="text-center min-w-[50px]">
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {agent.ticketsSolved}
                  </p>
                  <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Solved
                  </p>
                </div>

                {/* Avg Time */}
                <div className="text-center min-w-[50px]">
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {agent.avgResolutionTime}
                  </p>
                  <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Avg Time
                  </p>
                </div>

                {/* Success Rate */}
                <div className="text-center min-w-[50px]">
                  <p className={`text-lg font-bold text-emerald-600`}>
                    {agent.successRate}%
                  </p>
                  <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Success
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AgentLeaderboard;