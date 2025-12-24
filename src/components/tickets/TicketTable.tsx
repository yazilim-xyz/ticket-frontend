import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket } from '../../types';
import TicketActionsMenu from './TicketActionsMenu';

interface TicketTableProps {
  tickets: Ticket[];
  loading: boolean;
  isDarkMode: boolean;
  onDelete: (ticketId: string | number) => void;
  onUpdateStatus: (ticketId: string | number) => void; 
  onUpdateAssignment?: (ticketId: string | number) => void; // For admin to reassign tickets
  userRole: 'user' | 'admin';
  canDelete?: boolean;
}

const TicketTable: React.FC<TicketTableProps> = ({ 
  tickets, 
  loading, 
  isDarkMode, 
  onDelete, 
  onUpdateStatus,
  onUpdateAssignment, 
  userRole = 'user',
  canDelete = true, // default true
}) => {
  const navigate = useNavigate();

  const getInitials = (fullName: string): string => {
    const names = fullName.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPriorityStyle = (priority: string): string => {
    const baseStyle = "px-2.5 py-0.5 rounded-full text-xs font-medium border";
    switch (priority.toLowerCase()) {
      case 'high':
        return `${baseStyle} bg-red-50 text-red-700 border-red-200`;
      case 'medium':
        return `${baseStyle} bg-amber-50 text-amber-700 border-amber-200`;
      case 'low':
        return `${baseStyle} bg-emerald-50 text-emerald-700 border-emerald-200`;
      case 'critical':
        return `${baseStyle} bg-purple-50 text-purple-700 border-purple-200`;
      default:
        return `${baseStyle} bg-gray-50 text-gray-700 border-gray-200`;
    }
  };

  // Get status badge style
  const getStatusStyle = (status: string): string => {
    const baseStyle = "px-2.5 py-0.5 rounded-full text-xs font-medium border";
    switch (status.toLowerCase()) {
      case 'new':
        return `${baseStyle} bg-blue-50 text-blue-700 border-blue-200`;
      case 'in_progress':
        return `${baseStyle} bg-cyan-50 text-cyan-700 border-cyan-200`;
      case 'blocked':
        return `${baseStyle} bg-red-50 text-red-700 border-red-200`;
      case 'completed':
        return `${baseStyle} bg-emerald-50 text-emerald-700 border-emerald-200`;
      default:
        return `${baseStyle} bg-gray-50 text-gray-700 border-gray-200`;
    }
  };

  // Format status display text
  const formatStatus = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'Not Started';
      case 'in_progress':
        return 'In Progress';
      case 'blocked':
        return 'Blocked';
      case 'completed':
        return 'Done';
      default:
        return status;
    }
  };
  
  // initials için email'den de çalışsın
  const getInitialsFromEmailOrName = (text: string) => {
    if (!text || text === '-') return '-';
    if (text.includes('@')) return text[0].toUpperCase(); // email ise tek harf
    return getInitials(text);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No tickets found
        </p>
        <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border overflow-hidden ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Ticket ID
              </th>
              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Title
              </th>
              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Status
              </th>
              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Priority
              </th>
              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Date
              </th>
              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Assignee
              </th>
              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {tickets.map((ticket) => {
              // ✅ Assignee artık normalize edilmiş ticket.assignee'den geliyor
              const assigneeText = ticket.assignee
                ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}`.trim()
                : '-';

              return (
                <tr
                  key={ticket.id}
                  className={`transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                >
                  {/* Ticket ID */}
                  <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span className="text-sm font-medium">{`TCK-${ticket.id}`}</span>
                  </td>

                  {/* Title */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/ticket/${ticket.id}`)}
                      className={`text-sm font-medium hover:underline text-left ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}
                    >
                      {ticket.title}
                    </button>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusStyle(ticket.status)}>{formatStatus(ticket.status)}</span>
                  </td>

                  {/* Priority */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getPriorityStyle(ticket.priority)}>
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                    </span>
                  </td>

                  {/* Date */}
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatDate(ticket.createdAt)}
                  </td>

                  {/* Assignee */}
                  <td className="px-8 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {assigneeText !== '-' ? (
                        <>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {getInitialsFromEmailOrName(assigneeText)}
                          </div>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {assigneeText}
                          </span>
                        </>
                      ) : (
                        <span className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Unassigned</span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-8 py-4 whitespace-nowrap text-right">
                    <TicketActionsMenu
                      ticketId={ticket.id}
                      onView={() => navigate(`/ticket/${ticket.id}`)}
                      onEdit={() => onUpdateStatus(ticket.id)}
                      onUpdateAssignment={onUpdateAssignment ? () => onUpdateAssignment(ticket.id) : undefined}
                      onDelete={() => onDelete(ticket.id)}
                      isDarkMode={isDarkMode}
                      userRole={userRole}
                      canDelete={canDelete}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketTable;