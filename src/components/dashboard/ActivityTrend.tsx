import React from 'react';
import { ActivityTrendData } from '../../types';

interface ActivityTrendProps {
  isDarkMode?: boolean;
  data?: ActivityTrendData | null;
  loading?: boolean;
}

const ActivityTrend: React.FC<ActivityTrendProps> = ({ 
  isDarkMode = false, 
  data, 
  loading = false 
}) => {
  // Loading state
  if (loading) {
    return (
      <div className={`
        rounded-lg border h-[340px] flex items-center justify-center
        ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}
      `}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-2"></div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  // Use data from props or fallback to mock data
  const completedData = data?.completedData ?? [30, 45, 35, 55, 40, 60, 50, 65, 55, 70];
  const inProgressData = data?.inProgressData ?? [35, 50, 40, 60, 45, 65, 55, 70, 60, 75];
  const blockedData = data?.blockedData ?? [20, 35, 25, 45, 30, 50, 40, 55, 45, 60];
  const labels = data?.labels ?? ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  // SVG boyutları
  const width = 540;
  const height = 180;
  const paddingTop = 10;
  const paddingBottom = 10;
  const paddingLeft = 0;  // Space for Y-axis labels
  const paddingRight = 0;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Ölçekler
  const maxValue = Math.max(...completedData, ...inProgressData, ...blockedData, 10);
  const xScale = chartWidth / (labels.length - 1 || 1);
  const yScale = maxValue > 0 ? chartHeight / maxValue : 0;

  // Çizgi oluştur
  const createLine = (dataArray: number[]) => {
    return dataArray.map((value, index) => {
      const x = paddingLeft + index * xScale; 
      const y = paddingTop + chartHeight - value * yScale;
      return { x, y };
    });
  };

  // Path string oluştur
  const createPath = (points: { x: number; y: number }[]) => {
    return points.map((point, i) => 
      `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');
  };

  const completedPoints = createLine(completedData);
  const inProgressPoints = createLine(inProgressData);
  const blockedPoints = createLine(blockedData);

  return (
    <div className={`
      rounded-lg border
      ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}
    `}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'}`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold font-['Inter'] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Activity Trend
          </h3>
          
          {/* Legend */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Completed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                In Progress
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Blocked
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-6 py-6">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full"
          style={{ height: '200px' }}
        >
          {/* Yatay grid çizgileri */}
          <g>
            {[0, 25, 50, 75, 100].map((percentage) => {
              const value = (maxValue * percentage) / 100;
              const y = paddingTop + chartHeight - value * yScale;
              return (
                <g key={percentage}>
                  {/* Grid line */}
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                    strokeWidth="1"
                  />
                  {/* Y-axis label */}
                  <text
                    x={paddingLeft - 8}
                    y={y + 3}
                    textAnchor="end"
                    className={`text-[10px] ${isDarkMode ? 'fill-gray-400' : 'fill-gray-500'}`}
                  >
                  {Math.round(value)}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Dikey grid çizgileri */}
          <g>
            {labels.map((_, index) => {
              const x = paddingLeft + index * xScale;
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

          {/* Cyan çizgi (In Progress) */}
          <path
            d={createPath(inProgressPoints)}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {inProgressPoints.map((point, i) => (
            <circle
              key={`cyan-${i}`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#06b6d4"
            />
          ))}

          {/* Green çizgi (Completed) */}
          <path
            d={createPath(completedPoints)}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {completedPoints.map((point, i) => (
            <circle
              key={`green-${i}`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#10b981"
            />
          ))}

          {/* Red çizgi (Blocked) */}
          <path
            d={createPath(blockedPoints)}
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {blockedPoints.map((point, i) => (
            <circle
              key={`red-${i}`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#ef4444"
            />
          ))}
        </svg>

        {/* X ekseni etiketleri */}
        <div className="flex justify-between mt-2" style={{ paddingLeft: `${paddingLeft}px`, paddingRight: `${paddingRight}px` }}>
          {labels.map((label, i) => (
            <span
              key={i}
              className={`text-[15px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
              style={{ width: `${100 / labels.length}%`, textAlign: 'center' }}
            >
              {label}
            </span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityTrend;