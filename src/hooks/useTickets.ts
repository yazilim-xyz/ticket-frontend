import { useState, useEffect, useCallback } from 'react';
import { ticketService } from '../services/ticketService';
import type { Ticket } from '../types';

interface UseTicketsReturn {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
}

/**
 * Hook for fetching and managing tickets
 * 
 * Otomatik olarak role'e göre çalışır:
 * - Admin: Tüm ticket'ları getirir (/api/admin/tickets)
 * - User: Sadece kendisine atanan ticket'ları getirir (/api/tickets/my-assigned)
 */
export const useTickets = (): UseTicketsReturn => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ticketService otomatik olarak role'e göre doğru endpoint'i kullanır
      const data = await ticketService.getTickets();
      
      console.log('📋 Fetched tickets:', data.length);
      setTickets(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tickets';
      setError(errorMessage);
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const deleteTicket = async (id: string) => {
    try {
      await ticketService.deleteTicket(id);
      setTickets(prev => prev.filter(t => String(t.id) !== String(id)));
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

/**
 * Hook for fetching a single ticket by ID
 */
export const useTicketDetail = (ticketId: string | undefined) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await ticketService.getTicketById(ticketId);
      setTicket(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch ticket';
      setError(errorMessage);
      console.error('Error fetching ticket:', err);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  return {
    ticket,
    loading,
    error,
    refetch: fetchTicket
  };
};