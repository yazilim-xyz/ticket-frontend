import {
  DashboardStats,
  PersonalStatsData,
  ActivityTrendData,
  TeamChatMessage,
  ChatUser,
  CalendarTask,
  DashboardNotification,
} from '../types';

// Mock API delay simülasyonu
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock current user ID (gerçek uygulamada localStorage'dan gelecek)
const getCurrentUserId = (): string => {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    return userData.id;
  }
  return 'user_mock_123';
};

class DashboardService {
  // 1. DASHBOARD STATS (Ana Kartlar)
  async getStats(): Promise<DashboardStats> {
    await delay(800);
    
    // TODO: Backend'den gerçek veri gelecek
    // GET /api/dashboard/stats
    
    return {
      activeTickets: 9,
      pendingTickets: 12,
      resolvedTickets: 153,
      overdueTickets: 4,
      activeTicketsChange: '+12%',
      pendingTicketsChange: '+5%',
      resolvedTicketsChange: '+23%',
      overdueTicketsChange: '-2%',
    };
  }

  // 2. PERSONAL STATS
  async getPersonalStats(): Promise<PersonalStatsData> {
    await delay(600);
    
    // TODO: Backend'den kullanıcıya özel veri gelecek
    // GET /api/dashboard/personal-stats
    
    return {
      ticketsSolved: 28,
      ticketsSolvedPercentage: 70,
      avgResolutionTime: '3h',
      avgResolutionTimePercentage: 60,
      successRate: 74,
    };
  }

  // 3. ACTIVITY TREND (Grafik)
  async getActivityTrend(period: 'week' | 'month' | 'year' = 'week'): Promise<ActivityTrendData> {
    await delay(700);
    
    // TODO: Backend'den period'a göre veri gelecek
    // GET /api/dashboard/activity-trend?period=week
    
    const mockData = {
      week: {
        labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        completedData: [30, 45, 35, 55, 40, 60, 50, 65, 55, 70],
        inProgressData: [35, 50, 40, 60, 45, 65, 55, 70, 60, 75],
        blockedData: [20, 35, 25, 45, 30, 50, 40, 55, 45, 60],
        period: 'week' as const,
      },
      month: {
        labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        completedData: [25, 40, 30, 50, 35, 55, 45, 60, 50, 65],
        inProgressData: [30, 45, 35, 55, 40, 60, 50, 65, 55, 70],
        blockedData: [15, 30, 20, 40, 25, 45, 35, 50, 40, 55],
        period: 'month' as const,
      },
      year: {
        labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        completedData: [40, 55, 45, 65, 50, 70, 60, 75, 65, 80],
        inProgressData: [45, 60, 50, 70, 55, 75, 65, 80, 70, 85],
        blockedData: [25, 40, 30, 50, 35, 55, 45, 60, 50, 65],
        period: 'year' as const,
      },
    };

    return mockData[period];
  }

  // 4. TEAM CHAT MESSAGES
  async getChatMessages(userId?: string): Promise<TeamChatMessage[]> {
    await delay(500);
    
    // TODO: Backend'den chat mesajları gelecek
    // GET /api/chat/messages?userId=xxx
    
    const currentUserId = getCurrentUserId();
    
    return [
      {
        id: '1',
        text: 'Hey There!',
        senderId: 'user_456',
        senderName: 'Ezgi Yücel',
        senderAvatar: 'EY',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isOwn: false,
      },
      {
        id: '2',
        text: 'How are you?',
        senderId: 'user_456',
        senderName: 'Ezgi Yücel',
        senderAvatar: 'EY',
        timestamp: new Date(Date.now() - 3500000).toISOString(),
        isOwn: false,
      },
      {
        id: '3',
        text: 'Hello!',
        senderId: currentUserId,
        senderName: 'Me',
        timestamp: new Date(Date.now() - 3400000).toISOString(),
        isOwn: true,
      },
      {
        id: '4',
        text: 'I am fine and how are you?',
        senderId: currentUserId,
        senderName: 'Me',
        timestamp: new Date(Date.now() - 3300000).toISOString(),
        isOwn: true,
      },
      {
        id: '5',
        text: 'I am doing well, Can we meet tomorrow?',
        senderId: 'user_456',
        senderName: 'Ezgi Yücel',
        senderAvatar: 'EY',
        timestamp: new Date(Date.now() - 3200000).toISOString(),
        isOwn: false,
      },
      {
        id: '6',
        text: 'Yes Sure!',
        senderId: currentUserId,
        senderName: 'Me',
        timestamp: new Date(Date.now() - 3100000).toISOString(),
        isOwn: true,
      },
    ];
  }

  async sendChatMessage(recipientId: string, text: string): Promise<TeamChatMessage> {
    await delay(400);
    
    // TODO: Backend'e mesaj gönder
    // POST /api/chat/send
    
    const currentUserId = getCurrentUserId();
    
    const newMessage: TeamChatMessage = {
      id: `msg_${Date.now()}`,
      text,
      senderId: currentUserId,
      senderName: 'Me',
      timestamp: new Date().toISOString(),
      isOwn: true,
    };

    return newMessage;
  }

  async getOnlineUsers(): Promise<ChatUser[]> {
    await delay(400);
    
    // TODO: Backend'den online kullanıcılar
    // GET /api/chat/online-users
    
    return [
      {
        id: 'user_456',
        name: 'Ezgi Yücel',
        avatar: 'EY',
        online: true,
        lastSeen: 'Online - Last seen, 2:02pm',
      },
      {
        id: 'user_789',
        name: 'Nisa Öztürk',
        avatar: 'NO',
        online: true,
      },
      {
        id: 'user_101',
        name: 'Beyzanur Aslan',
        avatar: 'BA',
        online: false,
        lastSeen: '10 minutes ago',
      },
    ];
  }

  // 5. UPCOMING TASKS (Calendar)
  async getUpcomingTasks(): Promise<CalendarTask[]> {
    await delay(600);
    
    // TODO: Backend'den kullanıcıya özel görevler
    // GET /api/dashboard/upcoming-tasks
    
    return [
      {
        id: '1',
        ticketId: 'TCK-122',
        title: 'Review ticket #TCK122',
        time: '10:00 AM',
        date: '2025-10-17',
        color: 'purple',
        priority: 'high',
      },
      {
        id: '2',
        ticketId: 'TCK-134',
        title: 'Review ticket #TCK134',
        time: '12:00 AM',
        date: '2025-10-17',
        color: 'blue',
        priority: 'medium',
      },
      {
        id: '3',
        ticketId: 'TCK-156',
        title: 'Review ticket #TCK156',
        time: '2:00 PM',
        date: '2025-10-17',
        color: 'emerald',
        priority: 'low',
      },
    ];
  }

  // 6. NOTIFICATIONS
  async getNotifications(limit: number = 5): Promise<DashboardNotification[]> {
    await delay(500);
    
    // TODO: Backend'den bildirimler
    // GET /api/dashboard/notifications?limit=5
    
    const allNotifications: DashboardNotification[] = [
      {
        id: '1',
        type: 'success',
        title: 'Ticket Resolved',
        description: 'You successfully resolved ticket #TCK-111',
        time: '5 minutes ago',
        read: false,
      },
      {
        id: '2',
        type: 'info',
        title: 'New Comment Added to Your Ticket',
        description: 'Check the latest update on TCK-145',
        time: '1 hours ago',
        read: false,
      },
      {
        id: '3',
        type: 'warning',
        title: 'Upcoming Deadline',
        description: '4 ticket due by end of day',
        time: '3 hours ago',
        read: false,
      },
      {
        id: '4',
        type: 'error',
        title: 'Ticket Overdue',
        description: 'TCK-098 is overdue by 2 days',
        time: '5 hours ago',
        read: false,
      },
      {
        id: '5',
        type: 'info',
        title: 'New Ticket Assigned',
        description: 'You have been assigned to TCK-200',
        time: '1 day ago',
        read: true,
      },
    ];

    return allNotifications.slice(0, limit);
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await delay(300);
    
    // TODO: Backend'e bildirim okundu işaretle
    // PUT /api/dashboard/notifications/:id/read
    
    console.log(`Notification ${notificationId} marked as read`);
  }

  // 7. REFRESH ALL DASHBOARD DATA
  async refreshDashboard() {
    // Tüm dashboard verilerini paralel olarak çek
    const [stats, personalStats, activityTrend, chatMessages, tasks, notifications] = await Promise.all([
      this.getStats(),
      this.getPersonalStats(),
      this.getActivityTrend('week'),
      this.getChatMessages(),
      this.getUpcomingTasks(),
      this.getNotifications(),
    ]);

    return {
      stats,
      personalStats,
      activityTrend,
      chatMessages,
      tasks,
      notifications,
    };
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();