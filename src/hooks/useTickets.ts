import { useState, useEffect, useCallback } from 'react';
import { Ticket, ticketService} from '../services/ticketService';

interface UseTicketsOptions {
  userId?: number; // If provided, filter tickets by assigned user
  autoFetch?: boolean; // Auto-fetch on mount (default: true)
}

interface UseTicketsReturn {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  deleteTicket: (id: string) => Promise<void>;
}

/**
 * Hook for fetching and managing tickets
 * 
 * Usage:
 * - Admin (All Tickets): useTickets() 
 * - User (Active Tickets): useTickets({ userId: currentUserId })
 */
export const useTickets = (options: UseTicketsOptions = {}): UseTicketsReturn => {
  const { userId, autoFetch = true } = options;
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all tickets from admin endpoint
      const data = await ticketService.getTickets();
       console.log('📋 Fetched:', data.length, 'tickets');

      // If userId is provided, filter tickets assigned to that user
      if (userId) {
        const currentUserEmail = (localStorage.getItem('userEmail') || '').toLowerCase();
        const currentUserName = `${localStorage.getItem('name') || ''} ${localStorage.getItem('surname') || ''}`.trim().toLowerCase();
        
        const filteredTickets = data.filter(ticket => {
          // Check if ticket is assigned to this user
          const assignedTo = (ticket.assignedTo || '').toLowerCase();
          const owner = (ticket.owner || '').toLowerCase();
          
          return (
            (currentUserEmail && assignedTo.includes(currentUserEmail)) ||
            (currentUserName && assignedTo.includes(currentUserName)) ||
            (currentUserEmail && owner.includes(currentUserEmail))
          );
        });
        
        console.log(` Filtered tickets for user ${userId}:`, filteredTickets.length);
        setTickets(filteredTickets);
      } else {
        // Admin - show all tickets
        console.log('✅ All Tickets (admin):', data.length);
        setTickets(data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tickets';
      setError(errorMessage);
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);


  useEffect(() => {
    if (autoFetch) {
      fetchTickets();
    }
  }, [autoFetch, fetchTickets]);

  const deleteTicket = async (id: string) => {
    try {
      await ticketService.deleteTicket(parseInt(id));
      setTickets(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting ticket:', err);
      throw err;
    }
  };

  return {
    tickets,
    loading,
    error,
    refetch: fetchTickets,
    deleteTicket
  };
};