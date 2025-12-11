import { useState, useEffect, useCallback } from 'react';
import { Ticket } from '../types';
import ticketService from '../services/ticketService';

interface UseTicketsReturn {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  deleteTicket: (id: string) => Promise<void>;
}

export const useTickets = (userId?: string): UseTicketsReturn => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ticketService.getTickets(userId);
      setTickets(data);
    } catch (err) {
      setError('Failed to fetch tickets');
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const deleteTicket = async (id: string) => {
    try {
      const success = await ticketService.deleteTicket(id);
      if (success) {
        setTickets(prev => prev.filter(t => t.id !== id));
      }
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