import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface UserActionsDropdownProps {
  userId: string;
  userName: string;
  userEmail: string;
  userStatus: 'active' | 'waitlisted';
  onEdit: (userId: string) => void;
  onChangeRole: (userId: string) => void;
  onToggleStatus: (userId: string) => void;
  onDelete: (userId: string) => void;
}

const UserActionsDropdown: React.FC<UserActionsDropdownProps> = ({
  userId,
  userName,
  userEmail,
  userStatus,
  onEdit,
  onChangeRole,
  onToggleStatus,
  onDelete,
}) => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (action: string) => {
    setIsOpen(false);
    
    switch (action) {
      case 'edit':
        onEdit(userId);
        break;
      case 'changeRole':
        onChangeRole(userId);
        break;
      case 'toggleStatus':
        onToggleStatus(userId);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
          onDelete(userId);
        }
        break;
      case 'sendEmail':
        window.location.href = `mailto:${userEmail}`;
        break;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="py-1">
            {/* Edit User */}
            <button
              onClick={() => handleAction('edit')}
              className={`w-full px-4 py-2 text-sm text-left flex items-center gap-2 transition-colors ${
                isDarkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit User Info
            </button>

            {/* Change Role */}
            <button
              onClick={() => handleAction('changeRole')}
              className={`w-full px-4 py-2 text-sm text-left flex items-center gap-2 transition-colors ${
                isDarkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Change Role
            </button>

            <div className={`my-1 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />

            {/* Send Email */}
            <button
              onClick={() => handleAction('sendEmail')}
              className={`w-full px-4 py-2 text-sm text-left flex items-center gap-2 transition-colors ${
                isDarkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Send Email
            </button>

            <div className={`my-1 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />

            {/* Toggle Status */}
            <button
              onClick={() => handleAction('toggleStatus')}
              className={`w-full px-4 py-2 text-sm text-left flex items-center gap-2 transition-colors ${
                isDarkMode
                  ? 'text-yellow-400 hover:bg-gray-700'
                  : 'text-yellow-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              {userStatus === 'active' ? 'Set to Waitlisted' : 'Approve User'}
            </button>

            {/* Delete User */}
            <button
              onClick={() => handleAction('delete')}
              className={`w-full px-4 py-2 text-sm text-left flex items-center gap-2 transition-colors ${
                isDarkMode
                  ? 'text-red-400 hover:bg-gray-700'
                  : 'text-red-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete User
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserActionsDropdown;