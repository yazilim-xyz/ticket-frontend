import React from 'react';
import { PersonalStatsData } from '../../types';
import { useNavigate } from 'react-router-dom';

interface PersonalStatsProps {
  isDarkMode?: boolean;
  stats?: PersonalStatsData | null;
  loading?: boolean;
}

const PersonalStats: React.FC<PersonalStatsProps> = ({ 
  isDarkMode = false, 
  stats,
  loading = false 
}) => {
  const navigate = useNavigate();
  
  // Loading state
  if (loading) {
    return (
      <div className={`
        rounded-lg border h-[400px] flex items-center justify-center
        ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}
      `}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-2"></div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  // Default values if no stats
  const ticketsSolved = stats?.ticketsSolved ?? 0;
  const ticketsSolvedPercentage = stats?.ticketsSolvedPercentage ?? 0;
  const avgResolutionTime = stats?.avgResolutionTime ?? '0h';
  const avgResolutionTimePercentage = stats?.avgResolutionTimePercentage ?? 0;
  const successRate = stats?.successRate ?? 0;

  // Navigate to Statistics Page
  const handleNavigateToStats = () => {
    navigate('/statistics');
  };

  return (
    <div className={`
      rounded-lg border
      ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}
    `}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'} flex items-center justify-between`}>
        <h3 className={`text-lg font-semibold font-['Inter'] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Personal Stats
        </h3>
        {/* More Button - Navigate to Statistics Page */}
        <button 
          onClick={handleNavigateToStats}
          className={`text-sm font-medium ${isDarkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'}`}
        > 
          More
        </button>
      </div>

      {/* Stats */}
      <div className="p-6 space-y-6">
        {/* Tickets Solved */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Tickets Solved
            </span>
            <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {ticketsSolved}
            </span>
          </div>
          <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div 
              className="h-full bg-cyan-600 transition-all duration-500"
              style={{ width: `${ticketsSolvedPercentage}%` }}
            />
          </div>
        </div>

        {/* Avg. Resolution Time */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Avg. Resolution Time
            </span>
            <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {avgResolutionTime}
            </span>
          </div>
          <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div 
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${avgResolutionTimePercentage}%` }}
            />
          </div>
        </div>

        {/* Success Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Success Rate
            </span>
            <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {successRate}%
            </span>
          </div>
          <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div 
              className="h-full bg-sky-500 transition-all duration-500"
              style={{ width: `${successRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalStats;