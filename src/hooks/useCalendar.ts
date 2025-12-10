import { useState, useEffect, useCallback } from 'react';
import { calendarService } from '../services/calendarService';
import { CalendarEvent } from '../types';

export const useCalendarEvents = (year: number, month: number) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await calendarService.getEvents(year, month);
      setEvents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const markAsDone = async (eventId: string) => {
    try {
      await calendarService.markAsDone(eventId);
      // Update local state
      setEvents(prev =>
        prev.map(event =>
          event.id === eventId ? { ...event, status: 'Done' as const } : event
        )
      );
    } catch (err: any) {
      console.error('Error marking as done:', err);
    }
  };

  return { events, loading, error, refetch: fetchEvents, markAsDone };
};