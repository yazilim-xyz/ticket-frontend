import React from 'react';
import { OverdueTicket } from '../../types';

interface OverdueTicketsWidgetProps {
  isDarkMode?: boolean;
  tickets?: OverdueTicket[];
  loading?: boolean;
}

const OverdueTicketsWidget: React.FC<OverdueTicketsWidgetProps> = ({
  isDarkMode = false,
  tickets = [],
  loading = false,
}) => {
  // Priority badge colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Days overdue color
  const getOverdueColor = (days: number) => {
    if (days >= 7) return 'text-red-600';
    if (days >= 3) return 'text-amber-600';
    return 'text-orange-600';
  };

  // Loading state
  if (loading) {
    return (
      <div className={`
        rounded-lg border h-[500px] flex items-center justify-center
        ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}
      `}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-2"></div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading overdue tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      rounded-lg border h-[485px] flex flex-col
      ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}
    `}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'} flex items-center justify-between flex-shrink-0`}>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className={`text-lg font-semibold font-['Inter'] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Overdue Tickets
            </h3>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Requires immediate attention
            </p>
          </div>
        </div>
        
        {tickets.length > 0 && (
          <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            {tickets.length}
          </div>
        )}
      </div>

      {/* Tickets List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <svg className="w-16 h-16 text-emerald-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
              All caught up!
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
              No overdue tickets at the moment
            </p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 hover:border-red-500' 
                  : 'bg-white border-gray-200 hover:border-red-400'
              }`}
            >
              {/* Ticket Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
                    {ticket.ticketId}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
                
                {/* Days Overdue Badge */}
                <div className={`flex items-center gap-1 ${getOverdueColor(ticket.daysOverdue)}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-bold">
                    {ticket.daysOverdue}d overdue
                  </span>
                </div>
              </div>

              {/* Ticket Title */}
              <h4 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {ticket.title}
              </h4>

              {/* Assigned To */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br bg-cyan-600 flex items-center justify-center text-white text-xs font-semibold">
                  {ticket.assignedToAvatar}
                </div>
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Assigned to <span className="font-medium">{ticket.assignedTo}</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OverdueTicketsWidget;