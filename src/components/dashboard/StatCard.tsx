import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: React.ReactNode;
  iconColor: string;
  iconBgColor: string;
  isDarkMode?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType,
  icon,
  iconColor,
  iconBgColor,
  isDarkMode = false
}) => {
  return (
    <div className={`
      flex-1 min-w-[240px] rounded-[10px] border p-4 relative
      ${isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-zinc-100'
      }
    `}>
      {/* Content Area */}
      <div className="flex flex-col gap-1 pr-12">
        {/* Title - Dark mode'da açık gri */}
        <div className={`text-base font-normal font-['Roboto'] leading-6 ${
          isDarkMode ? 'text-gray-400' : 'text-neutral-500'
        }`}>
          {title}
        </div>

        {/* Value - Dark mode'da beyaz */}
        <div className={`text-3xl font-medium font-['Roboto'] leading-10 ${
          isDarkMode ? 'text-white' : 'text-black'
        }`}>
          {value}
        </div>

        {/* Change Indicator */}
        <div className={`text-xs font-medium font-['Roboto'] leading-4 tracking-wide ${
          changeType === 'positive' ? 'text-emerald-500' : 'text-red-700'
        }`}>
          {change} from last week
        </div>
      </div>

      {/* Icon - Renkli arka plan (dark mode'da da), renkli ikon */}
      <div className={`absolute top-4 right-4 w-10 h-10 ${iconBgColor} rounded flex items-center justify-center ${iconColor}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;