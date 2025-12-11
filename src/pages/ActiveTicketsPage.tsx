import React, { useState } from 'react';
import Sidebar from '../components/layouts/Sidebar';
import { useTheme } from '../context/ThemeContext';
import { useTickets } from '../hooks/useTickets';
import TicketTable from '../components/tickets/TicketTable';
import UpdateStatusModal from '../components/tickets/UpdateStatusModal';
import { ticketService } from '../services/ticketService';
import { Ticket } from '../types';

const ActiveTicketsPage: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showPriorityFilter, setShowPriorityFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  // Modal states
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  // Mock current user ID - Replace with actual auth
  const currentUserId = 'user_1';
  
  const { tickets, loading, deleteTicket, refetch } = useTickets(currentUserId);


  const handleDelete = async (ticketId: string) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await deleteTicket(ticketId);
      } catch (error) {
        console.error('Failed to delete ticket:', error);
      }
    }
  };

   const handleUpdateStatus = (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      setSelectedTicket(ticket);
      setIsStatusModalOpen(true);
    }
  };

  const handleStatusUpdate = async (ticketId: string, newStatus: string) => {
    try {
      await ticketService.updateTicket(ticketId, { status: newStatus as any });
      await refetch(); // Refresh ticket list
      setIsStatusModalOpen(false);
      setSelectedTicket(null);
    } catch (error) {
      console.error('Failed to update ticket status:', error);
      throw error;
    }
  };

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    // Search filter
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.project.toLowerCase().includes(searchQuery.toLowerCase());

    // Priority filter
    const matchesPriority = 
      filterPriority === 'all' || 
      ticket.priority.toLowerCase() === filterPriority.toLowerCase();

    // Status filter
    const matchesStatus = 
      filterStatus === 'all' || 
      ticket.status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Sidebar */}
      <Sidebar userRole="user" isDarkMode = {isDarkMode} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className={`h-32 px-8 py-5 border-b ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'} relative`}>
          {/* Dark/Light Mode Toggle */}
          <div className="absolute top-8 right-8 flex items-center gap-2">
            <div className="relative">
              <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-600' : 'text-yellow-500'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
              {!isDarkMode && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            
            <button onClick={toggleTheme} className="relative w-14 h-7 rounded-full transition-colors duration-300 bg-cyan-500" aria-label="Toggle theme">
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
            
            <div className="relative">
              <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-blue-400' : 'text-gray-800'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
              {isDarkMode && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Page Title */}
          <h1 className="text-cyan-800 text-2xl font-semibold font-['Inter'] leading-9 mb-3">
            Active Tickets
          </h1>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className={`flex-1 h-10 px-3 py-2 rounded-lg border flex items-center gap-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-neutral-200'}`}>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 bg-transparent text-base font-normal font-['Inter'] focus:outline-none ${isDarkMode ? 'text-gray-200 placeholder-gray-500' : 'text-black placeholder-slate-400'}`}
              />
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowPriorityFilter(!showPriorityFilter);
                  setShowStatusFilter(false);
                }}
                className={`h-10 px-4 rounded-lg border flex items-center gap-2 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-neutral-200 text-black'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="text-sm font-medium">Priority</span>
              </button>
              
              {showPriorityFilter && (
                <div className={`absolute right-0 top-12 w-48 rounded-lg border shadow-lg z-10 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="p-2">
                    {['all', 'high', 'medium', 'low'].map((priority) => (
                      <button
                        key={priority}
                        onClick={() => {
                          setFilterPriority(priority);
                          setShowPriorityFilter(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          filterPriority === priority
                            ? 'bg-cyan-100 text-cyan-700'
                            : isDarkMode
                              ? 'text-gray-200 hover:bg-gray-700'
                              : 'text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        {priority === 'all' ? '🗃️ All Priorities' : 
                         priority === 'high' ? '🔴 High Priority' :
                         priority === 'medium' ? '🟡 Medium Priority' :
                         '🟢 Low Priority'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowStatusFilter(!showStatusFilter);
                  setShowPriorityFilter(false);
                }}
                className={`h-10 px-4 rounded-lg border flex items-center gap-2 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-neutral-200 text-black'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-sm font-medium">Status</span>
              </button>
              
              {showStatusFilter && (
                <div className={`absolute right-0 top-12 w-48 rounded-lg border shadow-lg z-10 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="p-2">
                    {['all', 'new', 'in_progress', 'completed', 'blocked'].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setFilterStatus(status);
                          setShowStatusFilter(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          filterStatus === status
                            ? 'bg-cyan-100 text-cyan-700'
                            : isDarkMode
                              ? 'text-gray-200 hover:bg-gray-700'
                              : 'text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        {status === 'all' ? 'All Status' :
                         status === 'new' ? 'New' :
                         status === 'in_progress' ? 'In Progress' :
                         status === 'completed' ? 'Completed' :
                         'Blocked'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-8 py-6">
          <TicketTable
            tickets={filteredTickets}
            loading={loading}
            isDarkMode={isDarkMode}
            onDelete={handleDelete}
            onUpdateStatus={handleUpdateStatus}
            userRole="user"
          />
        </div>
      </div>

      {/* Update Status Modal */}
      {selectedTicket && (
        <UpdateStatusModal
          isOpen={isStatusModalOpen}
          onClose={() => {
            setIsStatusModalOpen(false);
            setSelectedTicket(null);
          }}
          ticket={selectedTicket}
          onUpdate={handleStatusUpdate}
          isDarkMode={isDarkMode}
        />
      )}
    </div>  
  );
};

export default ActiveTicketsPage;