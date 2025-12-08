import React from 'react';
import { DashboardNotification } from '../../types';

interface NotificationsPanelProps {
  isDarkMode?: boolean;
  notifications?: DashboardNotification[];
  onMarkAsRead?: (notificationId: string) => void;
  loading?: boolean;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ 
  isDarkMode = false,
  notifications = [],
  onMarkAsRead,
  loading = false,
}) => {
  // Notification icon based on type
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Color classes based on type
  const getColorClasses = (type: string) => {
    const colors = {
      success: {
        iconBg: isDarkMode ? 'bg-emerald-900' : 'bg-emerald-100',
        iconText: 'text-emerald-600',
        cardBg: isDarkMode ? 'bg-emerald-900/30' : 'bg-emerald-50',
      },
      info: {
        iconBg: isDarkMode ? 'bg-blue-900' : 'bg-blue-100',
        iconText: 'text-blue-600',
        cardBg: isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50',
      },
      warning: {
        iconBg: isDarkMode ? 'bg-amber-900' : 'bg-amber-100',
        iconText: 'text-amber-600',
        cardBg: isDarkMode ? 'bg-amber-900/30' : 'bg-amber-50',
      },
      error: {
        iconBg: isDarkMode ? 'bg-red-900' : 'bg-red-100',
        iconText: 'text-red-600',
        cardBg: isDarkMode ? 'bg-red-900/30' : 'bg-red-50',
      },
    };
    return colors[type as keyof typeof colors] || colors.info;
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
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      rounded-lg border
      ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}
    `}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'} flex items-center justify-between`}>
        <h3 className={`text-lg font-semibold font-['Inter'] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Notifications
        </h3>
        <button className={`text-sm font-medium ${isDarkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'}`}>
          More
        </button>
      </div>

      {/* Notifications List */}
      <div className="p-6 space-y-3">
        {notifications.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              No notifications
            </p>
          </div>
        ) : (
          notifications.map((notification) => {
            const colors = getColorClasses(notification.type);
            
            return (
              <div
                key={notification.id}
                className={`p-4 rounded-lg ${colors.cardBg} flex items-start gap-3 group cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => onMarkAsRead?.(notification.id)}
              >
                {/* Icon */}
                <div className={`w-8 h-8 rounded-full ${colors.iconBg} ${colors.iconText} flex items-center justify-center flex-shrink-0`}>
                  {getIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {notification.title}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {notification.description}
                  </p>
                  <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {notification.time}
                  </p>
                </div>

                {/* Close button (shows on hover) */}
                {onMarkAsRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notification.id);
                    }}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                      isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;