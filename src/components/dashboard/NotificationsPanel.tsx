import React from 'react';

interface Notification {
  id: number;
  type: 'success' | 'info' | 'warning';
  title: string;
  description: string;
  time: string;
}

interface NotificationsPanelProps {
  isDarkMode?: boolean;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isDarkMode = false }) => {
  const notifications: Notification[] = [
    {
      id: 1,
      type: 'success',
      title: 'Ticket Resolved',
      description: 'You successfully resolved ticket #TCK 111',
      time: '5 minutes ago'
    },
    {
      id: 2,
      type: 'info',
      title: 'New Comment Added to Your Ticket',
      description: '',
      time: '1 hours ago'
    },
    {
      id: 3,
      type: 'warning',
      title: 'Upcoming Deadline',
      description: '4 ticket due by end of day',
      time: '3 hours ago'
    }
  ];

  const getIconAndBg = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: isDarkMode ? 'bg-emerald-900/30' : 'bg-emerald-50',
          iconBg: 'bg-emerald-100',
          icon: (
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )
        };
      case 'info':
        return {
          bg: isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50',
          iconBg: 'bg-blue-100',
          icon: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'warning':
        return {
          bg: isDarkMode ? 'bg-amber-900/30' : 'bg-amber-50',
          iconBg: 'bg-amber-100',
          icon: (
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )
        };
    }
  };

  return (
    <div className={`
      rounded-lg border
      ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}
    `}>
      {/* Header */}
      <div className={`flex items-center justify-between p-6 pb-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'}`}>
        <h3 className={`text-lg font-semibold font-['Inter'] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Notifications
        </h3>
        <button className="text-cyan-600 text-sm font-medium hover:text-cyan-700">
          More
        </button>
      </div>

      {/* Notifications List */}
      <div className="p-6 pt-4 space-y-4">
        {notifications.map((notification) => {
          const { bg, iconBg, icon } = getIconAndBg(notification.type);
          
          return (
            <div key={notification.id} className={`flex gap-4 p-4 rounded-lg ${bg}`}>
              <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {notification.title}
                </h4>
                {notification.description && (
                  <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {notification.description}
                  </p>
                )}
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {notification.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationsPanel;