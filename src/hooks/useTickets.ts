import { useState, useEffect, useCallback } from 'react';
import { ticketService } from '../services/ticketService';
import type { Ticket } from '../types';

const HIDDEN_KEY = 'hidden_ticket_ids_v1';

const getHiddenIds = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(HIDDEN_KEY) || '[]');
  } catch {
    return [];
  }
};

const addHiddenId = (id: string) => {
  const hidden = new Set(getHiddenIds());
  hidden.add(String(id));
  localStorage.setItem(HIDDEN_KEY, JSON.stringify(Array.from(hidden)));
};

const isHidden = (id: string) => {
  return getHiddenIds().includes(String(id));
};

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
      const hiddenIds = new Set(getHiddenIds());
      const visibleTickets = data.filter(t => !hiddenIds.has(String((t as any).id)));
      console.log('📋 Fetched:', data.length, 'tickets');

      // If userId is provided, filter tickets assigned to that user
      if (userId) {
        // FIX: localStorage yerine sessionStorage kullan
        const userStr = sessionStorage.getItem('user');
        let currentUserEmail = '';
        let currentUserName = '';
        
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            currentUserEmail = (user.email || '').toLowerCase();
            currentUserName = `${user.Name || ''} ${user.Surname || ''}`.trim().toLowerCase();
          } catch (e) {
            console.error('Error parsing user from sessionStorage:', e);
          }
        }
        
        const filteredTickets = data.filter((ticket: Ticket) => {
          // Check if ticket is assigned to this user
          const assignedTo = ((ticket as any).assignedTo || '').toLowerCase();
          const owner = ((ticket as any).owner || '').toLowerCase();
          
          return (
            (currentUserEmail && assignedTo.includes(currentUserEmail)) ||
            (currentUserName && assignedTo.includes(currentUserName)) ||
            (currentUserEmail && owner.includes(currentUserEmail))
          );
        });
        
        console.log(`🔍 Filtered tickets for user ${userId}:`, filteredTickets.length);
        setTickets(filteredTickets);
      } else {
        // Admin - show all tickets
        console.log('✅ All Tickets (admin):', data.length);
        setTickets(visibleTickets);
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