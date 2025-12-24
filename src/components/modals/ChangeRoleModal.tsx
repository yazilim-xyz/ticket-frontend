import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { AdminUser } from '../../types';

interface ChangeRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userId: number, newRole: 'ADMIN' | 'USER') => void;
  user: AdminUser | null;
}

const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({ isOpen, onClose, onSubmit, user }) => {
  const { isDarkMode } = useTheme();
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'USER'>('USER');

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(user.id, selectedRole);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-md rounded-xl shadow-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              Change User Role
            </h2>
            <button
              onClick={onClose}
              className={`p-1 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Change role for <span className="font-semibold">{user.name} {user.surname}</span>
            </p>
            
            <div className="space-y-3">
              <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedRole === 'USER'
                  ? isDarkMode
                    ? 'border-teal-500 bg-teal-900/20'
                    : 'border-teal-500 bg-teal-50'
                  : isDarkMode
                  ? 'border-gray-700 hover:border-gray-600'
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="USER"
                  checked={selectedRole === 'USER'}
                  onChange={(e) => setSelectedRole(e.target.value as 'ADMIN' | 'USER')}
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                />
                <div className="ml-3">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    User
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Standard user with limited permissions
                  </p>
                </div>
              </label>

              <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedRole === 'ADMIN'
                  ? isDarkMode
                    ? 'border-teal-500 bg-teal-900/20'
                    : 'border-teal-500 bg-teal-50'
                  : isDarkMode
                  ? 'border-gray-700 hover:border-gray-600'
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="ADMIN"
                  checked={selectedRole === 'ADMIN'}
                  onChange={(e) => setSelectedRole(e.target.value as 'ADMIN' | 'USER')}
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                />
                <div className="ml-3">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    Admin
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Full access to system management
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Change Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeRoleModal;