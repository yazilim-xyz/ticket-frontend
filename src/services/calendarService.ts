import { CalendarEvent } from '../types';
import apiClient from '../utils/apiClient';

/**
 * Calendar Service - Backend Integration
 * 
 * Admin: Tüm ticket'ları görür
 * User: Sadece kendisine atanan ticket'ları görür
 */

// Get current user from sessionStorage
const getCurrentUser = (): { id: number; name: string; surname: string; email: string; role: string } | null => {
  const user = sessionStorage.getItem('user');
  if (user) {
    return JSON.parse(user);
  }
  return null;
};

class CalendarService {
  /**
   * Belirtilen yıl ve ay için calendar event'lerini getir
   * 
   * Admin: Tüm ticket'ları getirir
   * User: Sadece kendisine atanan ticket'ları getirir
   */
  async getEvents(year: number, month: number): Promise<CalendarEvent[]> {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const isAdmin = currentUser.role === 'ADMIN';
      let tickets: any[] = [];

      console.log(`📅 Fetching calendar events for ${year}-${month} (${isAdmin ? 'ADMIN' : 'USER'})`);

      if (isAdmin) {
        // ADMIN: Tüm ticket'ları getir
        try {
          const response = await apiClient.get('/api/admin/tickets', {
            params: {
              page: 0,
              size: 1000,
              sort: 'createdAt,asc'
            }
          });
          tickets = response.data.content || response.data || [];
          console.log(`📥 Admin: Received ${tickets.length} total tickets`);
        } catch (err) {
          console.error('❌ Error fetching admin tickets:', err);
          tickets = [];
        }
      } else {
        // USER: Sadece kendisine atanan ticket'ları getir
        try {
          const response = await apiClient.get('/api/tickets/my-assigned');
          tickets = response.data || [];
          console.log(`📥 User: Received ${tickets.length} assigned tickets`);
        } catch (err) {
          console.error('❌ Error fetching user tickets:', err);
          tickets = [];
        }
      }

      // Ay ve yıla göre filtrele - dueDate yoksa createdAt kullan
      const filteredEvents = tickets
        .filter((ticket: any) => {
          const dateField = ticket.dueDate || ticket.createdAt;
          if (!dateField) {
            return false;
          }
          
          const eventDate = new Date(dateField);
          const ticketYear = eventDate.getFullYear();
          const ticketMonth = eventDate.getMonth() + 1;
          
          return ticketYear === year && ticketMonth === month;
        })
        .map((ticket: any) => this.mapTicketToEvent(ticket));

      console.log(`✅ Filtered ${filteredEvents.length} events for ${year}-${month}`);
      
      return filteredEvents;
    } catch (error: any) {
      console.error('❌ Error fetching calendar events:', error);
      return []; // Hata durumunda boş array dön, UI crash olmasın
    }
  }

  /**
   * Backend ticket'ını frontend CalendarEvent'e map et
   */
  private mapTicketToEvent(ticket: any): CalendarEvent {
    return {
      id: ticket.id.toString(),
      ticketId: `TCK-${ticket.id}`,
      title: ticket.title || 'Untitled',
      description: ticket.description || '',
      date: ticket.dueDate || ticket.createdAt,
      type: 'ticket',
      priority: this.normalizePriority(ticket.priority),
      status: this.mapStatus(ticket.status),
      assignedTo: this.formatAssignedTo(ticket),
      color: this.getPriorityColor(ticket.priority),
      tags: [ticket.category || 'General'],
    };
  }

  /**
   * Priority'yi normalize et (HIGH → High)
   */
  private normalizePriority(priority: string): 'High' | 'Medium' | 'Low' {
    const normalized = priority?.toLowerCase();
    if (normalized === 'high' || normalized === 'critical' || normalized === 'urgent') {
      return 'High';
    }
    if (normalized === 'low' || normalized === 'minor') {
      return 'Low';
    }
    return 'Medium';
  }

  /**
   * Backend status'ü frontend status'e map et
   */
  private mapStatus(status: string): 'Open' | 'In Progress' | 'Done' {
    const statusMap: Record<string, 'Open' | 'In Progress' | 'Done'> = {
      'OPEN': 'Open',
      'IN_PROGRESS': 'In Progress',
      'RESOLVED': 'Done',
      'CLOSED': 'Done',
      'CANCELLED': 'Open'
    };
    
    return statusMap[status] || 'Open';
  }

  /**
   * Priority'ye göre renk döndür
   */
  private getPriorityColor(priority: string): string {
    const normalized = priority?.toUpperCase();
    
    const colorMap: Record<string, string> = {
      'CRITICAL': '#8b5cf6',  // Mor
      'HIGH': '#ef4444',      // Kırmızı
      'MEDIUM': '#f97316',    // Turuncu
      'LOW': '#10b981'        // Yeşil
    };
    
    return colorMap[normalized] || '#06b6d4'; // Default: Cyan
  }

  /**
   * assignedTo bilgisini formatla
   */
  private formatAssignedTo(ticket: any): string {
    if (ticket.assignedToEmail) {
      return ticket.assignedToEmail;
    }
    
    if (ticket.assignedTo) {
      if (typeof ticket.assignedTo === 'object') {
        const name = ticket.assignedTo.name || '';
        const surname = ticket.assignedTo.surname || '';
        return `${name} ${surname}`.trim() || 'Unassigned';
      }
      return ticket.assignedTo;
    }
    
    return 'Unassigned';
  }

  /**
   * Event'i "Done" olarak işaretle
   * Admin ve User için farklı endpoint kullanır
   */
  async markAsDone(eventId: string): Promise<void> {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const isAdmin = currentUser.role === 'ADMIN';
      
      console.log(`✅ Marking ticket ${eventId} as RESOLVED (${isAdmin ? 'ADMIN' : 'USER'})`);

      if (isAdmin) {
        // Admin endpoint
        await apiClient.patch(`/api/admin/tickets/${eventId}/status`, {
          status: 'RESOLVED'
        });
      } else {
        // User endpoint (TicketController.java'da mevcut)
        await apiClient.patch(`/api/tickets/${eventId}/status`, {
          status: 'RESOLVED'
        });
      }
      
      console.log(`✅ Ticket ${eventId} marked as RESOLVED successfully`);
    } catch (error: any) {
      console.error(`❌ Error marking ticket ${eventId} as done:`, error);
      throw new Error('Failed to mark ticket as done');
    }
  }

  /**
   * Yeni event/ticket ekle
   * Admin ve User için farklı endpoint kullanır
   */
  async addEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const isAdmin = currentUser.role === 'ADMIN';
      
      console.log(`➕ Creating new ticket (${isAdmin ? 'ADMIN' : 'USER'}):`, event);

      const ticketData = {
        title: event.title,
        description: event.description,
        priority: (event.priority || 'MEDIUM').toUpperCase(),
        category: (event.tags && event.tags[0]) ? event.tags[0].toUpperCase() : 'GENERAL',
        dueDate: event.date,
      };

      let response;

      if (isAdmin) {
        // Admin endpoint
        response = await apiClient.post('/api/admin/tickets', ticketData);
      } else {
        // User endpoint (TicketController.java'da mevcut)
        response = await apiClient.post('/api/tickets', {
          ...ticketData,
          createdById: currentUser.id
        });
      }

      const newTicket = response.data;
      const newEvent = this.mapTicketToEvent(newTicket);
      
      console.log('✅ New ticket created:', newEvent);
      
      return newEvent;
    } catch (error: any) {
      console.error('❌ Error creating ticket:', error);
      throw new Error('Failed to create calendar event');
    }
  }
}

export const calendarService = new CalendarService();