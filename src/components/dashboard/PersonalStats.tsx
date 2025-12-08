import React from 'react';

interface PersonalStatsProps {
  isDarkMode?: boolean;
}

const PersonalStats: React.FC<PersonalStatsProps> = ({ isDarkMode = false }) => {
  const stats = {
    ticketsSolved: 28,
    avgResolutionTime: '3h',
    successRate: 74
  };

  return (
    <div className={`
      rounded-lg border flex flex-col h-[300px]
      ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}
    `}>
      {/* Header */}
      <div className={`flex items-center justify-between p-6 pb-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'}`}>
        <h3 className={`text-lg font-semibold font-['Inter'] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Personal Stats
        </h3>
        <button className="text-cyan-600 text-sm font-medium hover:text-cyan-700">
          More
        </button>
      </div>

      {/* Stats Grid */}
      <div className="p-6 pt-4 space-y-4">
        {/* Tickets Solved */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Tickets Solved
            </span>
            <span className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.ticketsSolved}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-cyan-600 h-2 rounded-full" style={{ width: '70%' }} />
          </div>
        </div>

        {/* Avg Resolution Time */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Avg. Resolution Time
            </span>
            <span className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.avgResolutionTime}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '60%' }} />
          </div>
        </div>

        {/* Success Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Success Rate
            </span>
            <span className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.successRate}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-sky-500 h-2 rounded-full" style={{ width: `${stats.successRate}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalStats;