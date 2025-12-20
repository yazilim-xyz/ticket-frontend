import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface RecentTicket {
  id: string;
  ticketId: string;
  title: string;
  status: 'new' | 'in_progress' | 'blocked' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  updatedAt: string; // ISO date string
  project?: string;
}

interface RecentTicketsWidgetProps {
  isDarkMode?: boolean;
  tickets?: RecentTicket[];
  loading?: boolean;
}

const RecentTicketsWidget: React.FC<RecentTicketsWidgetProps> = ({
  isDarkMode = false,
  tickets = [],
  loading = false,
}) => {
  const navigate = useNavigate();

  // Status colors and labels
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'new':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'New' };
      case 'in_progress':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'In Progress' };
      case 'blocked':
        return { color: 'bg-red-100 text-red-800 border-red-200', label: 'Blocked' };
      case 'done':
        return { color: 'bg-green-100 text-green-800 border-green-200', label: 'Done' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Unknown' };
    }
  };

  const getStatusConfigDark = (status: string) => {
    switch (status) {
      case 'new':
        return { color: 'bg-blue-900/50 text-blue-300 border-blue-700', label: 'New' };
      case 'in_progress':
        return { color: 'bg-yellow-900/50 text-yellow-300 border-yellow-700', label: 'In Progress' };
      case 'blocked':
        return { color: 'bg-red-900/50 text-red-300 border-red-700', label: 'Blocked' };
      case 'done':
        return { color: 'bg-green-900/50 text-green-300 border-green-700', label: 'Done' };
      default:
        return { color: 'bg-gray-700 text-gray-300 border-gray-600', label: 'Unknown' };
    }
  };

  // Priority colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return isDarkMode ? 'text-red-400' : 'text-red-600';
      case 'medium':
        return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
      case 'low':
        return isDarkMode ? 'text-green-400' : 'text-green-600';
      default:
        return isDarkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Navigate to ticket detail
  const handleTicketClick = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className={`
        rounded-lg border h-[515px] flex items-center justify-center
        ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}
      `}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-2"></div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading recent tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      rounded-lg border flex flex-col h-[550px]
      ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}
    `}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'} flex items-center justify-between flex-shrink-0`}>
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Recent Updates
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Last 10 updated tickets
          </p>
        </div>
      </div>

      {/* Tickets List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2">
        {tickets.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              No recent ticket updates
            </p>
          </div>
        ) : (
          tickets.map((ticket) => {
            const statusConfig = isDarkMode 
              ? getStatusConfigDark(ticket.status)
              : getStatusConfig(ticket.status);

            return (
              <div
                key={ticket.id}
                onClick={() => handleTicketClick(ticket.id)}
                className={`
                  p-4 rounded-lg border cursor-pointer transition-all
                  ${isDarkMode 
                    ? 'border-gray-700 hover:border-cyan-500 hover:bg-gray-700/50' 
                    : 'border-gray-200 hover:border-cyan-500 hover:bg-gray-50'
                  }
                `}
              >
                {/* Ticket ID & Time */}
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-semibold ${
                    isDarkMode ? 'text-cyan-400' : 'text-cyan-600'
                  }`}>
                    {ticket.ticketId}
                  </span>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {formatTimeAgo(ticket.updatedAt)}
                  </span>
                </div>

                {/* Title */}
                <h4 className={`text-sm font-semibold mb-1 line-clamp-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {ticket.title}
                </h4>

                {/* Status, Priority, Assigned */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Badge */}
                  <span className={`
                    px-2 py-0.5 rounded text-xs font-medium border
                    ${statusConfig.color}
                  `}>
                    {statusConfig.label}
                  </span>

                  {/* Priority Icon */}
                  <div className="flex items-center gap-1">
                    <svg
                      className={`w-3.5 h-3.5 ${getPriorityColor(ticket.priority)}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 2a.75.75 0 01.75.75v12.5a.75.75 0 01-1.5 0V2.75A.75.75 0 0110 2z" />
                      {ticket.priority === 'high' && (
                        <>
                          <path d="M6 6a.75.75 0 01.75.75v8.5a.75.75 0 01-1.5 0v-8.5A.75.75 0 016 6z" />
                          <path d="M14 6a.75.75 0 01.75.75v8.5a.75.75 0 01-1.5 0v-8.5A.75.75 0 0114 6z" />
                        </>
                      )}
                      {ticket.priority === 'medium' && (
                        <path d="M14 10a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0114 10z" />
                      )}
                    </svg>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                    </span>
                  </div>

                  {/* Divider */}
                  <span className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>•</span>

                  {/* Assigned To */}
                  <div className="flex items-center gap-1">
                    <svg
                      className={`w-3.5 h-3.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {ticket.assignedTo}
                    </span>
                  </div>

                  {/* Project (if exists) */}
                  {ticket.project && (
                    <>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {ticket.project}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentTicketsWidget;