import { CalendarEvent } from '../types';

class CalendarService {
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // GET CALENDAR EVENTS
  async getEvents(year: number, month: number): Promise<CalendarEvent[]> {
    await this.delay(600);
    
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/calendar/events?year=${year}&month=${month}`);
    
    // Mock events for January 2025
    if (year === 2025 && month === 12) { // month = 1 (January because we pass month + 1)
        return [
        {
            id: 'event_1',
            ticketId: 'TCK-116',
            title: 'Fix checkout bug',
            description: 'During the final step of the checkout process, the "Complete Purchase" button occasionally becomes unresponsive. This issue occurs when users have multiple items in their cart and try to apply a discount code simultaneously.',
            date: '2025-12-17',
            type: 'ticket',
            priority: 'High',
            status: 'In Progress',
            assignedTo: 'Melek Çetin',
            color: '#06b6d4',
            tags: ['Ecommerce'],
        },
        {
            id: 'event_2',
            ticketId: 'TCK-118',
            title: 'Optimized deal',
            description: 'Improve ticket resolution',
            date: '2025-12-16',
            type: 'task',
            priority: 'Medium',
            status: 'Open',
            assignedTo: 'Ezgi Yücel',
            color: '#8b5cf6',
            tags: ['DevOps'],
        },
        {
            id: 'event_3',
            ticketId: 'TCK-120',
            title: 'Design report',
            description: 'Add file option',
            date: '2025-12-24',
            type: 'task',
            priority: 'Low',
            status: 'Open',
            color: '#10b981',
            assignedTo: 'Özge Nur Kök',
            tags: ['UI/UX'],
        },
        {
            id: 'event_4',
            ticketId: 'TCK-125',
            title: 'Fix user permission',
            description: 'Implement QA',
            date: '2025-12-30',
            type: 'deadline',
            priority: 'High',
            status: 'Open',
            color: '#f59e0b',
            assignedTo: 'Türker Kıvılcım',
            tags: ['Backend'],
        },
      ];
    }
    // Return empty for other months
    return [];
  }

  // MARK EVENT AS DONE
  async markAsDone(eventId: string): Promise<void> {
    await this.delay(500);
    console.log(`Event ${eventId} marked as done`);
    // TODO: API call
  }

  // ADD NEW EVENT
  async addEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    await this.delay(500);
    const newEvent: CalendarEvent = {
      ...event,
      id: `event_${Date.now()}`,
    };
    console.log('New event added:', newEvent);
    return newEvent;
  }
}

export const calendarService = new CalendarService();