import React, { useState } from 'react';
import { Ticket } from '../../types';

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  onUpdate: (ticketId: string, newStatus: string) => Promise<void>;
  isDarkMode: boolean;
}

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onUpdate,
  isDarkMode
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>(ticket?.status || 'OPEN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Backend'deki gerçek status değerleri (Swagger'dan)
  const statusOptions = [
    { value: 'OPEN', label: 'Open', color: 'blue', icon: '🔵' },
    { value: 'WAITING', label: 'Waiting', color: 'amber', icon: '🟡' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'cyan', icon: '🔄' },
    { value: 'RESOLVED', label: 'Resolved', color: 'emerald', icon: '✅' },
    { value: 'CLOSED', label: 'Closed', color: 'gray', icon: '⚫' }
  ];

  const handleSubmit = async () => {
    if (!ticket?.id) {
      setError('Ticket ID not found');
      return;
    }

    if (selectedStatus === ticket.status) {
      onClose();
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onUpdate(String(ticket.id), selectedStatus);
      onClose();
    } catch (err: any) {
      console.error('Failed to update status:', err);
      setError(err?.message || 'Failed to update status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!isOpen || !ticket) return null;

  const getStatusColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700',
      amber: 'bg-amber-100 text-amber-700',
      cyan: 'bg-cyan-100 text-cyan-700',
      emerald: 'bg-emerald-100 text-emerald-700',
      gray: 'bg-gray-100 text-gray-700',
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div 
        className={`w-full max-w-md rounded-lg shadow-xl ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              Update Status
            </h2>
            <button
              onClick={handleClose}
              className={`p-1 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Ticket Info */}
          <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              TCK-{ticket.id}
            </p>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {ticket.title || 'Untitled Ticket'}
            </p>
            {ticket.description && (
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {ticket.description.length > 100 
                  ? `${ticket.description.substring(0, 100)}...` 
                  : ticket.description}
              </p>
            )}
          </div>

          {/* Status Options */}
          <div className="space-y-3">
            <label className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Select Status
            </label>
            
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedStatus(option.value);
                    setError(null);
                  }}
                  className={`
                    w-full px-4 py-3 rounded-lg border-2 transition-all text-left flex items-center gap-3
                    ${selectedStatus === option.value
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                      : isDarkMode
                        ? 'border-gray-700 bg-gray-700/30 hover:border-gray-600'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                  `}
                >
                  <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${selectedStatus === option.value
                      ? 'border-cyan-500 bg-cyan-500'
                      : isDarkMode
                        ? 'border-gray-600'
                        : 'border-gray-300'
                    }
                  `}>
                    {selectedStatus === option.value && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-base">{option.icon}</span>
                    <span className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      {option.label}
                    </span>
                  </div>

                  {/* Status Badge Preview */}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(option.color)}`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-100 border border-red-300">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-end gap-3`}>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedStatus === ticket.status}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
              bg-cyan-600 text-white hover:bg-cyan-700
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating...
              </>
            ) : (
              'Update Status'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateStatusModal;