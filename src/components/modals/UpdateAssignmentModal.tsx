import React, { useState } from 'react';
import { Ticket } from '../../types';

interface UpdateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  onUpdate: (ticketId: string, newAssignee: string) => Promise<void>;
  isDarkMode?: boolean;
  availableUsers?: { id: string; name: string }[];
}

const UpdateAssignmentModal: React.FC<UpdateAssignmentModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onUpdate,
  isDarkMode = false,
  availableUsers = [],
}) => {
  const [selectedUser, setSelectedUser] = useState<string>(ticket.assignedTo || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock users if none provided
  const users = availableUsers.length > 0 ? availableUsers : [
    { id: 'user_1', name: 'Ezgi Yücel' },
    { id: 'user_2', name: 'Nisa Öztürk' },
    { id: 'user_3', name: 'Beyzanur Aslan' },
    { id: 'user_4', name: 'Türker Kıvılcım' },
    { id: 'user_5', name: 'Beyda Ertek' },
    { id: 'user_6', name: 'Ahmet Yılmaz' },
    { id: 'user_7', name: 'Ayşe Demir' },
    { id: 'user_8', name: 'Mehmet Kaya' },
    { id: 'user_9', name: 'Fatma Çelik' },
    { id: 'user_10', name: 'Ali Öztürk' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) {
      setError('Please select a user');
      return;
    }

    if (selectedUser === ticket.assignedTo) {
      setError('Please select a different user');
      return;
    }

    try {
      setIsUpdating(true);
      setError(null);
      await onUpdate(ticket.id, selectedUser);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update assignment');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
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
              onClick={onClose}
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
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Ticket:
              </p>
              <p className={`text-base font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {ticket.title}
              </p>
            </div>

            {/* Current Assignment */}
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Currently Assigned To:
              </p>
              <p className={`text-base font-medium ${
                isDarkMode ? 'text-cyan-400' : 'text-cyan-600'
              }`}>
                {ticket.owner?.fullName || 'Unassigned'}
              </p>
            </div>

            {/* User Selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Reassign To <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedUser}
                onChange={(e) => {
                  setSelectedUser(e.target.value);
                  setError(null);
                }}
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
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
                    disabled={user.id === ticket.assignedTo}
                  >
                    {user.name} {user.id === ticket.assignedTo ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-100 border border-red-300">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`px-6 py-4 border-t flex items-center justify-end gap-3 ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              type="button"
              onClick={onClose}
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
              className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                isUpdating
                  ? 'bg-cyan-400 cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-700'
              }`}
              disabled={isUpdating || !selectedUser}
            >
              {isUpdating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Updating...
                </span>
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