import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';
import {
  DashboardStats,
  PersonalStatsData,
  ActivityTrendData,
  TeamChatMessage,
  ChatUser,
  CalendarTask,
  DashboardNotification,
} from '../types';


// 1. DASHBOARD STATS HOOK
export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stats');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

// 2. PERSONAL STATS HOOK
export const usePersonalStats = () => {
  const [personalStats, setPersonalStats] = useState<PersonalStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPersonalStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getPersonalStats();
      setPersonalStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch personal stats');
      console.error('Error fetching personal stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPersonalStats();
  }, [fetchPersonalStats]);

  return { personalStats, loading, error, refetch: fetchPersonalStats };
};

// 3. ACTIVITY TREND HOOK
export const useActivityTrend = (period: 'week' | 'month' | 'year' = 'week') => {
  const [activityData, setActivityData] = useState<ActivityTrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivityTrend = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getActivityTrend(period);
      setActivityData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch activity trend');
      console.error('Error fetching activity trend:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchActivityTrend();
  }, [fetchActivityTrend]);

  return { activityData, loading, error, refetch: fetchActivityTrend };
};

// 4. CHAT MESSAGES HOOK
export const useChatMessages = (userId?: string) => {
  const [messages, setMessages] = useState<TeamChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getChatMessages(userId);
      setMessages(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const sendMessage = async (recipientId: string, text: string) => {
    try {
      setSending(true);
      setError(null);
      const newMessage = await dashboardService.sendChatMessage(recipientId, text);
      setMessages((prev) => [...prev, newMessage]);
      return newMessage;
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      console.error('Error sending message:', err);
      throw err;
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return { messages, loading, error, sending, sendMessage, refetch: fetchMessages };
};

// 5. ONLINE USERS HOOK
export const useOnlineUsers = () => {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOnlineUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getOnlineUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch online users');
      console.error('Error fetching online users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOnlineUsers();
  }, [fetchOnlineUsers]);

  return { users, loading, error, refetch: fetchOnlineUsers };
};

// 6. UPCOMING TASKS HOOK
export const useUpcomingTasks = () => {
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getUpcomingTasks();
      setTasks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, error, refetch: fetchTasks };
};

// 7. NOTIFICATIONS HOOK
export const useNotifications = (limit: number = 5) => {
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getNotifications(limit);
      setNotifications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const markAsRead = async (notificationId: string) => {
    try {
      await dashboardService.markNotificationAsRead(notificationId);
      
      // Bildirimi listeden kaldır veya read=true yap
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );
    } catch (err: any) {
      setError(err.message || 'Failed to mark notification as read');
      console.error('Error marking notification:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return { notifications, loading, error, markAsRead, refetch: fetchNotifications };
};

// 8. COMPLETE DASHBOARD HOOK (Tüm veriyi bir anda)
export const useDashboard = () => {
  const statsHook = useDashboardStats();
  const personalStatsHook = usePersonalStats();
  const activityTrendHook = useActivityTrend('week');
  const chatMessagesHook = useChatMessages();
  const onlineUsersHook = useOnlineUsers();
  const tasksHook = useUpcomingTasks();
  const notificationsHook = useNotifications();

  const loading = 
    statsHook.loading ||
    personalStatsHook.loading ||
    activityTrendHook.loading ||
    chatMessagesHook.loading ||
    onlineUsersHook.loading ||
    tasksHook.loading ||
    notificationsHook.loading;

  const error = 
    statsHook.error ||
    personalStatsHook.error ||
    activityTrendHook.error ||
    chatMessagesHook.error ||
    onlineUsersHook.error ||
    tasksHook.error ||
    notificationsHook.error;

  const refreshAll = async () => {
    await Promise.all([
      statsHook.refetch(),
      personalStatsHook.refetch(),
      activityTrendHook.refetch(),
      chatMessagesHook.refetch(),
      onlineUsersHook.refetch(),
      tasksHook.refetch(),
      notificationsHook.refetch(),
    ]);
  };

  return {
    // Data
    stats: statsHook.stats,
    personalStats: personalStatsHook.personalStats,
    activityData: activityTrendHook.activityData,
    messages: chatMessagesHook.messages,
    onlineUsers: onlineUsersHook.users,
    tasks: tasksHook.tasks,
    notifications: notificationsHook.notifications,
    
    // States
    loading,
    error,
    
    // Actions
    sendMessage: chatMessagesHook.sendMessage,
    markNotificationAsRead: notificationsHook.markAsRead,
    refreshAll,
  };
};