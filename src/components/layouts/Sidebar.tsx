import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
      id: 'activity-log',
      label: 'Activity Log',
      path: '/activity-log',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      adminOnly: true
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

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
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
        {!isCollapsed && (
          <>
            <img 
              src={logo} 
              alt="Enterprise Ticket System Logo" 
              className="w-20 h-20 mb-3"
            />
            <h2 className={`text-2xl font-[Inter] leading-7 text-center ${
              isDarkMode ? 'text-teal-600' : 'text-cyan-800'
            }`}>
              Enterprise<br/>Ticket System
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
    </div>
  );
};

export default Sidebar;