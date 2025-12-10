import React from 'react';
import { CalendarEvent } from '../../types';

interface TicketDetailPanelProps {
  event: CalendarEvent | null;
  isDarkMode?: boolean;
  onMarkAsDone: () => void;
}

const TicketDetailPanel: React.FC<TicketDetailPanelProps> = ({
  event,
  isDarkMode = false,
  onMarkAsDone,
}) => {
  if (!event) {
    return (
      <div className={`rounded-lg border h-full min-h-[600px] flex flex-col items-center justify-center p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}`}>
        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Select an event to view details
        </p>
      </div>
    );
  }

  // Priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Low':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Open':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className={`rounded-lg border h-full flex flex-col ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'}`}>
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Ticket Details
        </h3>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto">
        {/* Ticket ID */}
        <div>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
            {event.ticketId}
          </p>
        </div>

        {/* Title */}
        <div>
          <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            {event.title}
          </h4>
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Priority & Status */}
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded border text-xs font-medium ${getPriorityColor(event.priority)}`}>
            {event.priority}
          </span>
          <span className={`px-3 py-1 rounded border text-xs font-medium ${getStatusColor(event.status)}`}>
            {event.status}
          </span>
        </div>

        {/* Description */}
        <div>
          <h5 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Description
          </h5>
          <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {event.description}
          </p>
        </div>

        {/* Due Date */}
        <div>
          <h5 className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Due Date
          </h5>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
              {formatDate(event.date)}
            </p>
          </div>
        </div>

        {/* Assigned To */}
        {event.assignedTo && (
          <div>
            <h5 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Assigned To
            </h5>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br bg-cyan-600 flex items-center justify-center text-white text-xs font-semibold">
                {event.assignedTo.split(' ').map(n => n[0]).join('')}
              </div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {event.assignedTo}
              </p>
            </div>
          </div>
        )}

        {/* Days Left (if not done) */}
        {event.status !== 'Done' && (
          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
              Time remaining
            </p>
            <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              2 days left
            </p>
          </div>
        )}
      </div>

      {/* Footer - Mark as Done Button */}
      {event.status !== 'Done' && (
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={onMarkAsDone}
            className="w-full h-10 px-4 bg-emerald-500 rounded-lg text-white text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Mark as Done
          </button>
        </div>
      )}

      {/* Done Status */}
      {event.status === 'Done' && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-emerald-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-semibold">Completed</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetailPanel;