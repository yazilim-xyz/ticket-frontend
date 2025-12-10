import React, { useState } from 'react';
import { TeamActivityData } from '../../types';

interface TeamActivityTrendProps {
  isDarkMode?: boolean;
  data?: TeamActivityData | null;
  loading?: boolean;
  onPeriodChange?: (period: 'week' | 'month' | 'year') => void;
}

const TeamActivityTrend: React.FC<TeamActivityTrendProps> = ({
  isDarkMode = false,
  data,
  loading = false,
  onPeriodChange,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  const handlePeriodChange = (period: 'week' | 'month' | 'year') => {
    setSelectedPeriod(period);
    onPeriodChange?.(period);
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
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading activity...</p>
        </div>
      </div>
    );
  }

  // Use data from props or fallback
  const createdData = data?.createdData ?? [];
  const resolvedData = data?.resolvedData ?? [];
  const labels = data?.labels ?? [];

  // SVG dimensions
  const width = 700;
  const height = 250;
  const paddingTop = 20;
  const paddingBottom = 40;
  const chartHeight = height - paddingTop - paddingBottom;

  // Scales
  const maxValue = Math.max(...createdData, ...resolvedData, 0);
  const xScale = width / (labels.length - 1 || 1);
  const yScale = maxValue > 0 ? chartHeight / maxValue : 0;

  // Create line points
  const createLine = (dataArray: number[]) => {
    return dataArray.map((value, index) => {
      const x = index * xScale;
      const y = height - paddingBottom - value * yScale;
      return { x, y };
    });
  };

  // Create path string
  const createPath = (points: { x: number; y: number }[]) => {
    return points.map((point, i) =>
      `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');
  };

  const createdPoints = createLine(createdData);
  const resolvedPoints = createLine(resolvedData);

  return (
    <div className={`
      rounded-lg border
      ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}
    `}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-lg font-semibold font-['Inter'] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Team Activity Trend
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Tickets created vs resolved
            </p>
          </div>

          {/* Period Selector */}
          <div className={`flex gap-2 border rounded-lg overflow-hidden ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
            <button
              onClick={() => handlePeriodChange('week')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                selectedPeriod === 'week'
                  ? 'bg-cyan-600 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => handlePeriodChange('month')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                selectedPeriod === 'month'
                  ? 'bg-cyan-600 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => handlePeriodChange('year')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                selectedPeriod === 'year'
                  ? 'bg-cyan-600 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Year
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Created
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Resolved
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-6 py-6">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          style={{ height: '280px' }}
        >
          {/* Horizontal grid lines */}
          <g>
            {[0, 25, 50, 75, 100].map((value) => {
              const scaledValue = (maxValue * value) / 100;
              const y = height - paddingBottom - scaledValue * yScale;
              return (
                <g key={`grid-${value}`}>
                  <line
                    x1={0}
                    y1={y}
                    x2={width}
                    y2={y}
                    stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                    strokeWidth="1"
                    strokeDasharray="5,5"
                  />
                  <text
                    x={-10}
                    y={y + 4}
                    textAnchor="end"
                    className={`text-xs ${isDarkMode ? 'fill-gray-400' : 'fill-gray-600'}`}
                  >
                    {Math.round(scaledValue)}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Vertical grid lines */}
          <g>
            {labels.map((_, index) => {
              const x = index * xScale;
              return (
                <line
                  key={`grid-v-${index}`}
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={height - paddingBottom}
                  stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                  strokeWidth="1"
                  strokeDasharray="5,5"
                  opacity="0.4"
                />
              );
            })}
          </g>

          {/* Created line (Cyan) */}
          <path
            d={createPath(createdPoints)}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {createdPoints.map((point, i) => (
            <circle
              key={`created-${i}`}
              cx={point.x}
              cy={point.y}
              r="5"
              fill="#06b6d4"
            />
          ))}

          {/* Resolved line (Green) */}
          <path
            d={createPath(resolvedPoints)}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {resolvedPoints.map((point, i) => (
            <circle
              key={`resolved-${i}`}
              cx={point.x}
              cy={point.y}
              r="5"
              fill="#10b981"
            />
          ))}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2">
          {labels.map((label, i) => (
            <div
              key={i}
              className={`text-xs font-medium text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
              style={{
                width: `${xScale}px`,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamActivityTrend;