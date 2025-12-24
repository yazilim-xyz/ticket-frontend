import { CalendarEvent } from '../types';
import apiClient from '../utils/apiClient';

/**
 * Calendar Service - Backend Integration
 * 
 * Bu servis ticket endpoint'lerini kullanarak calendar event'lerini yönetir.
 * Backend'de özel calendar endpoint'i olmadığı için ticket'ları tarih bazlı filtreler.
 */
class CalendarService {
  /**
   * Belirtilen yıl ve ay için calendar event'lerini getir
   * 
   * Parametreler: Yıl (örn: 2025) - Ay (1-12, 1 = Ocak)
   * Return: CalendarEvent array
   */
  async getEvents(year: number, month: number): Promise<CalendarEvent[]> {
    try {
      console.log(`📅 Fetching calendar events for ${year}-${month}`);
      
      const response = await apiClient.get('/api/admin/tickets', {
        params: {
          page: 0,
          size: 1000,
          sort: 'createdAt,asc'
        }
      });

      const tickets = response.data.content || response.data;
      
      console.log(`📥 Received ${tickets.length} tickets from backend`);
      
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
      throw new Error('Failed to fetch calendar events');
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
      date: ticket.dueDate || ticket.createdAt, // dueDate yoksa createdAt kullan
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
      'CANCELLED': 'Open' // Cancelled ticket'ları Open olarak göster
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
    
    return colorMap[normalized] || '#06b6d4'; // Cyan
  }

  /**
   * assignedTo bilgisini formatla
   */
  private formatAssignedTo(ticket: any): string {
    // Backend'den assignedToEmail veya assignedTo object gelebilir
    if (ticket.assignedToEmail) {
      return ticket.assignedToEmail;
    }
    
    if (ticket.assignedTo) {
      // Object ise name + surname birleştir
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
   */
  async markAsDone(eventId: string): Promise<void> {
    try {
      console.log(`✅ Marking ticket ${eventId} as RESOLVED`);
      
      // FIX: /admin/tickets -> /api/admin/tickets
      await apiClient.patch(`/api/admin/tickets/${eventId}/status`, {
        status: 'RESOLVED'
      });
      
      console.log(`✅ Ticket ${eventId} marked as RESOLVED successfully`);
    } catch (error: any) {
      console.error(`❌ Error marking ticket ${eventId} as done:`, error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error('Failed to mark ticket as done');
    }
  }

  /**
   * Yeni event ekle (gelecekte kullanılabilir)
   * Şu an için ticket oluşturma olarak çalışır
   */
  async addEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    try {
      console.log('➕ Creating new ticket:', event);
      
      // FIX: /admin/tickets -> /api/admin/tickets
      const response = await apiClient.post('/api/admin/tickets', {
        title: event.title,
        description: event.description,
        priority: (event.priority || 'MEDIUM').toUpperCase(), // high → HIGH
        category: (event.tags && event.tags[0]) ? event.tags[0] : 'GENERAL',
        dueDate: event.date,
        // assignedToId gerekirse eklenebilir
      });

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