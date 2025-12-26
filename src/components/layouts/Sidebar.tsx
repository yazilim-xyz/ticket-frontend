import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import { Notification } from '../../types';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import Toast from '../ui/Toast';
import logo from '../../assets/logo.png';

interface SidebarProps {
  isDarkMode?: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  userOnly?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isDarkMode = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState<{
    message: string;
    description?: string;
    type: 'success' | 'error' | 'warning' | 'info';
    onClick?: () => void;
    actionButton?: {
      label: string;
      onClick: () => void;
    };
  } | null>(null);

  // Role'ü normalize et (backend ADMIN/USER, frontend admin/user kullanıyor)
  const userRole = user?.role?.toLowerCase() || 'user';

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: userRole === 'admin' ? '/admin-dashboard' : '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
        </svg>
      )
    },
    {
      id: 'user-management',
      label: 'User Control',
      path: '/user-management',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      adminOnly: true
    },
    {
      id: 'active-tickets',
      label: 'Active Tickets',
      path: '/active-tickets',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      userOnly: true
    },
    {
      id: 'all-tickets',
      label: 'All Tickets',
      path: '/all-tickets',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      adminOnly: true
    },
    {
      id: 'create-ticket',
      label: 'Create Ticket',
      path: '/create-ticket',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
      adminOnly: true
    },
    {
      id: 'statistics',
      label: 'Statistics',
      path: '/statistics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      userOnly: true
    },
    {
      id: 'performance',
      label: 'Performance',
      path: '/performance',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      adminOnly: true
    },
    {
      id: 'chat',
      label: 'Chat',
      path: '/chat',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      id: 'excel-reports',
      label: 'Excel Reports',
      path: '/excel-reports',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'ai-bot',
      label: 'AI Bot',
      path: '/ai-chat-bot',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'calendar',
      label: 'Calendar',
      path: '/calendar',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'settings',
      label: 'Settings',
      path: '/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'logout',
      label: 'Logout',
      path: '/logout',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      )
    }
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.adminOnly && userRole !== 'admin') return false;
    if (item.userOnly && userRole !== 'user') return false;
    return true;
  });

  const handleMenuClick = async (path: string) => {
    if (path === '/logout') {
      await logout();
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  // Sidebar.tsx içinde
  const isActive = (path: string) => {
    const current = location.pathname;

    // Ticket detail route'larını All Tickets menüsüne bağla
    if (path === "/all-tickets") {
      return current.startsWith("/all-tickets") || current.startsWith("/ticket/");
    }

    if (path === "/active-tickets") {
      return current.startsWith("/active-tickets") || current.startsWith("/ticket/");
    }

    return current.startsWith(path);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Bildirimleri yükle ve WebSocket bağlan
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const [notifs, count] = await Promise.all([
          notificationService.getNotifications(),
          notificationService.getUnreadCount()
        ]);
        setNotifications(notifs.slice(0, 5)); // İlk 5 bildirim
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    if (!user) return;

    // İlk yükleme
    loadNotifications();

    // WebSocket bağlantısı
    const token = sessionStorage.getItem('accessToken');
    if (!token) return;

    const socket = new SockJS(process.env.REACT_APP_API_URL || 'http://localhost:8081' + '/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket as any,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      onConnect: () => {
        console.log('✅ WebSocket bağlantısı kuruldu');

        // Bildirimleri dinle
        stompClient.subscribe('/user/queue/notifications', (message) => {
          const notification: Notification = JSON.parse(message.body);
          console.log('🔔 Yeni bildirim:', notification);

          // Listeye ekle
          setNotifications(prev => [notification, ...prev.slice(0, 4)]);

          // Okunmamış sayısını artır
          if (!notification.isRead) {
            setUnreadCount(prev => prev + 1);
          }

          // Toast bildirim göster
          const ticketIdMatch = notification.message.match(/#(\d+)|ID[:\s]+(\d+)/i);
          const ticketId = ticketIdMatch ? (ticketIdMatch[1] || ticketIdMatch[2]) : null;

          setToast({
            message: notification.title,
            description: notification.message,
            type: 'info',
            actionButton: ticketId
              ? {
                label: 'Görüntüle',
                onClick: () => navigate(`/ticket/${ticketId}`)
              }
              : undefined,
            onClick: ticketId ? () => {
              navigate(`/ticket/${ticketId}`);
              setToast(null);
            } : undefined
          });
        });
      },
      onStompError: (frame) => {
        console.error('❌ WebSocket hatası:', frame);
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [user]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
    setShowNotifications(false);
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Şimdi';
    if (minutes < 60) return `${minutes}dk önce`;
    if (hours < 24) return `${hours}sa önce`;
    return `${days}g önce`;
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <div
      className={`
        h-screen border-r flex flex-col transition-all duration-300 relative
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isDarkMode ? 'bg-gray-800 border-gray-500' : 'bg-zinc-100 border-zinc-300'}
      `}>
      {/* Hamburger Menu - Sağ Üst Köşe */}
      <button
        onClick={toggleSidebar}
        className={`
          absolute w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded transition-colors z-10
          ${isCollapsed ? 'top-2 right-6' : 'top-4 right-4'}
        `}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg
          className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-cyan-800'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Logo Section */}
      <div className={`flex flex-col items-center px-4 ${isCollapsed ? 'pt-10 pb-3' : 'pt-4 pb-6'}`}>
        {/* Bildirim İkonu - Sağ Üst */}
        {!isCollapsed && (
          <div className="absolute top-4 left-4">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Bildirim Dropdown */}
            {showNotifications && (
              <div className={`absolute left-0 top-14 w-80 rounded-lg shadow-lg border z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                <div className={`p-3 border-b flex justify-between items-center ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className="font-semibold">Bildirimler</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className={`text-xs px-2 py-1 rounded transition-colors ${isDarkMode
                        ? 'text-blue-400 hover:bg-gray-700'
                        : 'text-blue-600 hover:bg-blue-50'
                        }`}
                    >
                      Tümünü okundu işaretle
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <p className="text-sm">Bildirim yok</p>
                    </div>
                  ) : (
                    notifications.map(notif => {
                      const ticketIdMatch = notif.message.match(/#(\d+)|ID[:\s]+(\d+)/i);
                      const ticketId = ticketIdMatch ? (ticketIdMatch[1] || ticketIdMatch[2]) : null;

                      return (
                        <div
                          key={notif.id}
                          className={`p-3 border-b cursor-pointer transition-colors group ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'
                            } ${!notif.isRead ? (isDarkMode ? 'bg-gray-700' : 'bg-blue-50') : ''}`}
                        >
                          <div className="flex items-start gap-2">
                            <div
                              className="flex-1 min-w-0"
                              onClick={() => handleNotificationClick(notif)}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                  {notif.title}
                                  {!notif.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                                </h4>
                                <span className="text-xs text-gray-500">{formatTimeAgo(notif.createdAt)}</span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{notif.message}</p>
                            </div>
                            {ticketId && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/ticket/${ticketId}`);
                                  setShowNotifications(false);
                                }}
                                className={`flex-shrink-0 p-1.5 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-600 text-cyan-400' : 'hover:bg-gray-200 text-cyan-600'}`}
                                title="Ticket'i görüntüle"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {!isCollapsed && (
          <>
            <img
              src={logo}
              alt="Enterprise Ticket System Logo"
              className="w-20 h-20 mb-3"
            />
            <h2 className={`text-2xl font-[Inter] leading-7 text-center ${isDarkMode ? 'text-teal-600' : 'text-cyan-800'
              }`}>
              Enterprise<br />Ticket System
            </h2>
          </>
        )}
        {isCollapsed && (
          <img
            src={logo}
            alt="Logo"
            className="w-12 h-12"
          />
        )}
      </div>

      {/* Divider */}
      <div className={`w-full h-px mb-4 ${isDarkMode ? 'bg-gray-500' : 'bg-zinc-300'}`} />

      {/* Menu Items */}
      <nav className="flex-1 px-5 overflow-y-auto">
        <div className="flex flex-col gap-1">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.path)}
              className={`
                w-full h-10 px-4 rounded-lg flex items-center gap-4 transition-colors
                ${isActive(item.path)
                  ? isDarkMode ? 'bg-teal-700 text-white' : 'bg-cyan-800 text-white'
                  : isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-white text-black hover:bg-gray-50'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <span className={isActive(item.path) ? 'text-white' : isDarkMode ? 'text-teal-600' : 'text-cyan-800'}>
                {item.icon}
              </span>

              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left text-base font-[Inter] leading-6">
                    {item.label}
                  </span>
                  <svg
                    className={`w-3 h-6 ${isActive(item.path) ? 'text-white' : isDarkMode ? 'text-white-400' : 'text-cyan-800'}`}
                    viewBox="0 0 12 24"
                    fill="currentColor"
                  >
                    <path
                      d="M3.09 5.64L8.45 12L3.09 18.36"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast
            message={toast.message}
            description={toast.description}
            type={toast.type}
            onClose={() => setToast(null)}
            duration={5000}
            actionButton={toast.actionButton}
            onClick={toast.onClick}
          />
        </div>
      )}
    </div>
  );
};

export default Sidebar;