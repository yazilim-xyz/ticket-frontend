import React, { useState, useEffect } from 'react';
import { Ticket } from '../../types';
import { ticketService } from '../../services/ticketService';

interface UpdateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  onUpdate: (ticketId: string, newAssigneeId: string) => Promise<void>;
  isDarkMode?: boolean;
}

const UpdateAssignmentModal: React.FC<UpdateAssignmentModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onUpdate,
  isDarkMode = false,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [users, setUsers] = useState<{ id: number; fullName: string; email: string; role?: string }[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Backend'den kullanıcı listesini çek
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      setError(null);
      const userList = await ticketService.getUsers();
      setUsers(userList);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Mevcut atanan kişinin adını bul
  const getCurrentAssigneeName = (): string => {
    if (ticket.assignee) {
      return `${ticket.assignee.firstName} ${ticket.assignee.lastName}`.trim();
    }
    if (ticket.assignedTo) {
      return ticket.assignedTo;
    }
    return 'Unassigned';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }

    try {
      setIsUpdating(true);
      setError(null);
      await onUpdate(ticket.id, selectedUserId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update assignment');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setSelectedUserId('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-md mx-4 rounded-lg shadow-xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Update Assignment
            </h3>
            <button
              onClick={handleClose}
              className={`p-1 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {/* Ticket Info */}
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Ticket
              </p>
              <p className={`text-sm font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                TCK-{ticket.id}: {ticket.title}
              </p>
            </div>

            {/* Current Assignment */}
            <div>
              <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Currently Assigned To
              </p>
              <div className="flex items-center gap-2">
                {getCurrentAssigneeName() !== 'Unassigned' ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white text-xs font-semibold">
                      {getCurrentAssigneeName().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <span className={`text-sm font-medium ${
                      isDarkMode ? 'text-cyan-400' : 'text-cyan-600'
                    }`}>
                      {getCurrentAssigneeName()}
                    </span>
                  </>
                ) : (
                  <span className={`text-sm italic ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    Unassigned
                  </span>
                )}
              </div>
            </div>

            {/* User Selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Reassign To <span className="text-red-500">*</span>
              </label>
              
              {isLoadingUsers ? (
                <div className={`w-full px-4 py-3 rounded-lg border flex items-center justify-center ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
                }`}>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-600 mr-2"></div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Loading users...
                  </span>
                </div>
              ) : (
                <select
                  value={selectedUserId}
                  onChange={(e) => {
                    setSelectedUserId(e.target.value);
                    setError(null);
                  }}
                  className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                >
                  <option value="">Select a user...</option>
                  {users.map((user) => (
                    <option 
                      key={user.id} 
                      value={user.id}
                    >
                      {user.fullName || user.email} {user.role ? `(${user.role})` : ''}
                    </option>
                  ))}
                </select>
              )}
              
              {users.length === 0 && !isLoadingUsers && !error && (
                <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  No users available for assignment.
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-100 border border-red-300">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`px-6 py-4 border-t flex items-center justify-end gap-3 ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              type="button"
              onClick={handleClose}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg font-medium text-white transition-colors flex items-center gap-2 ${
                isUpdating || !selectedUserId || isLoadingUsers
                  ? 'bg-cyan-400 cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-700'
              }`}
              disabled={isUpdating || !selectedUserId || isLoadingUsers}
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                'Update Assignment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAssignmentModal;