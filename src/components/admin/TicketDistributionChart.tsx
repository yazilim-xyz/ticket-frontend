import React from 'react';
import { TicketDistribution } from '../../types';

interface TicketDistributionChartProps {
  isDarkMode?: boolean;
  distribution?: TicketDistribution[];
  loading?: boolean;
}

const TicketDistributionChart: React.FC<TicketDistributionChartProps> = ({
  isDarkMode = false,
  distribution = [],
  loading = false,
}) => {
  // Calculate total
  const total = distribution.reduce((sum, item) => sum + item.count, 0);

  // Loading state
  if (loading) {
    return (
      <div className={`
        rounded-lg border h-[400px] flex items-center justify-center
        ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}
      `}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-2"></div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading distribution...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      rounded-lg border flex flex-col h-[470px]
      ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}
    `}>
      {/* Header */}
      <div className={`px-6 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'}`}>
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Ticket Distribution
        </h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Current ticket status breakdown
        </p>
      </div>

      {/* Chart Area */}
      <div className="p-6">
        {distribution.length === 0 ? (
          <div className="text-center py-8">
            <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              No distribution data available
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Donut Chart (Simple) */}
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                {/* Simple circle representation */}
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {distribution.map((item, index) => {
                    const prevSum = distribution
                      .slice(0, index)
                      .reduce((sum, d) => sum + d.percentage, 0);
                    const radius = 40;
                    const circumference = 2 * Math.PI * radius;
                    const offset = (prevSum / 100) * circumference;
                    const strokeLength = (item.percentage / 100) * circumference;

                    return (
                      <circle
                        key={item.status}
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke={item.color}
                        strokeWidth="20"
                        strokeDasharray={`${strokeLength} ${circumference}`}
                        strokeDashoffset={-offset}
                        className="transition-all duration-500"
                      />
                    );
                  })}
                </svg>
                
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {total}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Tickets
                  </p>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-3">
              {distribution.map((item) => (
                <div key={item.status} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.status}
                      </span>
                      <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.count}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`flex-1 h-1.5 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${item.percentage}%`,
                            backgroundColor: item.color
                          }}
                        />
                      </div>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDistributionChart;