import {
  DashboardStats,
  PersonalStatsData,
  ActivityTrendData,
  TeamChatMessage,
  ChatUser,
  CalendarTask,
  DashboardNotification,
} from '../types';
import apiClient from '../utils/apiClient';

// Get current user from localStorage
const getCurrentUser = (): { id: number; name: string; surname: string; email: string; role: string } | null => {
  const user = localStorage.getItem('user');
  if (user) {
    return JSON.parse(user);
  }
  return null;
};

class DashboardService {
  // 1. DASHBOARD STATS (Ana Kartlar)
  async getStats(): Promise<DashboardStats> {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Admin ise admin endpoint, user ise kendi ticket'larını başka şekilde çekeceğiz
      const isAdmin = currentUser.role === 'ADMIN';
      
      let tickets: any[] = [];
      
      if (isAdmin) {
        // Admin için: tüm ticket'ları çek
        const response = await apiClient.get('/api/admin/tickets', {
          params: {
            page: 0,
            size: 1000,
          },
        });
        tickets = response.data.content || [];
        
        // Sadece kullanıcıya ait ticket'ları filtrele
        tickets = tickets.filter((t: any) => 
          t.ownerId === currentUser.id || t.assignedToId === currentUser.id
        );
      } else {
        // User için: backend'de user ticket list endpoint'i yok
        // Şimdilik boş array dönüyoruz, backend'e bu endpoint eklenmeli
        // TODO: Backend'e GET /api/tickets/my endpoint'i eklenecek
        console.warn('User ticket list endpoint not available in backend');
        tickets = [];
      }

      const now = new Date();

      // Active tickets (OPEN, IN_PROGRESS durumunda olanlar)
      const activeTickets = tickets.filter((t: any) => 
        t.status === 'OPEN' || t.status === 'IN_PROGRESS'
      ).length;

      // Pending tickets (OPEN durumunda olanlar)
      const pendingTickets = tickets.filter((t: any) => t.status === 'OPEN').length;

      // Resolved tickets (RESOLVED durumunda olanlar)
      const resolvedTickets = tickets.filter((t: any) => t.status === 'RESOLVED').length;

      // Overdue tickets (dueDate geçmiş olanlar)
      const overdueTickets = tickets.filter((t: any) => {
        if (!t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        return dueDate < now && (t.status !== 'RESOLVED' && t.status !== 'CLOSED');
      }).length;

      // TODO: Change percentages gerçek hesaplama yapılmalı
      return {
        activeTickets,
        pendingTickets,
        resolvedTickets,
        overdueTickets,
        activeTicketsChange: '+12%',
        pendingTicketsChange: '+5%',
        resolvedTicketsChange: '+23%',
        overdueTicketsChange: '-2%',
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Hata durumunda boş stats dön (403 hatası için)
      return {
        activeTickets: 0,
        pendingTickets: 0,
        resolvedTickets: 0,
        overdueTickets: 0,
        activeTicketsChange: '+0%',
        pendingTicketsChange: '+0%',
        resolvedTicketsChange: '+0%',
        overdueTicketsChange: '+0%',
      };
    }
  }

  // 2. PERSONAL STATS
  async getPersonalStats(): Promise<PersonalStatsData> {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Backend: GET /api/admin/users/{id}/stats
      const response = await apiClient.get(`/api/admin/users/${currentUser.id}/stats`);
      const stats = response.data;

      // Backend response mapping
      // UserStatsDto: { createdCount, assignedCount, openCount, inProgressCount, 
      //                 resolvedCount, closedCount, cancelledCount }
      
      const ticketsSolved = stats.resolvedCount + stats.closedCount;
      const totalTickets = stats.assignedCount || 1; // 0 bölme hatasından kaçın
      const ticketsSolvedPercentage = Math.round((ticketsSolved / totalTickets) * 100);

      // Avg resolution time ve success rate backend'den gelmiyorsa mock değer
      // TODO: Backend'e bu metrikler eklenirse güncellenecek
      const avgResolutionTime = '3h';
      const avgResolutionTimePercentage = 60;
      const successRate = Math.round(
        (stats.resolvedCount / (stats.resolvedCount + stats.cancelledCount || 1)) * 100
      );

      return {
        ticketsSolved,
        ticketsSolvedPercentage,
        avgResolutionTime,
        avgResolutionTimePercentage,
        successRate,
      };
    } catch (error) {
      console.error('Error fetching personal stats:', error);
      // Hata durumunda boş stats dön
      return {
        ticketsSolved: 0,
        ticketsSolvedPercentage: 0,
        avgResolutionTime: '0h',
        avgResolutionTimePercentage: 0,
        successRate: 0,
      };
    }
  }

  // 3. ACTIVITY TREND (Grafik)
  async getActivityTrend(period: 'week' | 'month' | 'year' = 'week'): Promise<ActivityTrendData> {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Backend'den kullanıcının ticket'larını çek
      const response = await apiClient.get('/api/admin/tickets', {
        params: {
          page: 0,
          size: 1000,
        },
      });

      const allTickets = response.data.content || [];
      
      // Sadece kullanıcının ticket'larını filtrele
      const userTickets = allTickets.filter((t: any) => 
        t.ownerId === currentUser.id || t.assignedToId === currentUser.id
      );

      // Period'a göre zaman aralığı ve label'ları belirle
      const now = new Date();
      let labels: string[] = [];
      let dataPoints: number;
      let startDate: Date;

      if (period === 'week') {
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        dataPoints = 7;
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (period === 'month') {
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        dataPoints = 4;
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else {
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        dataPoints = 12;
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      }

      // Her veri noktası için ticket'ları say
      const completedData: number[] = new Array(dataPoints).fill(0);
      const inProgressData: number[] = new Array(dataPoints).fill(0);
      const blockedData: number[] = new Array(dataPoints).fill(0);

      userTickets.forEach((ticket: any) => {
        const updatedAt = new Date(ticket.updatedAt);
        if (updatedAt < startDate) return;

        let index = -1;

        if (period === 'week') {
          // Haftanın günü (0 = Pazar, 1 = Pazartesi, ...)
          const dayOfWeek = updatedAt.getDay();
          index = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Pazartesi'den başlat
        } else if (period === 'month') {
          // Kaç hafta önce
          const diffTime = now.getTime() - updatedAt.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          index = Math.min(3, Math.floor(diffDays / 7));
          index = 3 - index; // Ters çevir (en yeni Week 4)
        } else {
          // Hangi ay
          index = updatedAt.getMonth();
        }

        if (index >= 0 && index < dataPoints) {
          if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
            completedData[index]++;
          } else if (ticket.status === 'IN_PROGRESS') {
            inProgressData[index]++;
          } else if (ticket.status === 'BLOCKED') {
            blockedData[index]++;
          }
        }
      });

      return {
        labels,
        completedData,
        inProgressData,
        blockedData,
        period,
      };
    } catch (error) {
      console.error('Error fetching activity trend:', error);
      // Hata durumunda boş data dön
      const emptyData = {
        week: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          completedData: [0, 0, 0, 0, 0, 0, 0],
          inProgressData: [0, 0, 0, 0, 0, 0, 0],
          blockedData: [0, 0, 0, 0, 0, 0, 0],
          period: 'week' as const,
        },
        month: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          completedData: [0, 0, 0, 0],
          inProgressData: [0, 0, 0, 0],
          blockedData: [0, 0, 0, 0],
          period: 'month' as const,
        },
        year: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          completedData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          inProgressData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          blockedData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          period: 'year' as const,
        },
      };
      return emptyData[period];
    }
  }

  // 4. TEAM CHAT MESSAGES
  async getChatMessages(userId?: string): Promise<TeamChatMessage[]> {
    try {
      // TODO: Backend'de chat API'si implement edilmemiş
      // Şimdilik mock data dön
      // GET /api/chat/messages?userId=xxx
      
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return [];
      }

      // Mock data
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
          text: 'Hello!',
          senderId: currentUser.id.toString(),
          senderName: 'Me',
          timestamp: new Date(Date.now() - 3400000).toISOString(),
          isOwn: true,
        },
      ];
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
  }

  async sendChatMessage(recipientId: string, text: string): Promise<TeamChatMessage> {
    try {
      // TODO: Backend'e chat API implement edilecek
      // POST /api/chat/send
      
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const newMessage: TeamChatMessage = {
        id: `msg_${Date.now()}`,
        text,
        senderId: currentUser.id.toString(),
        senderName: 'Me',
        timestamp: new Date().toISOString(),
        isOwn: true,
      };

      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      // Hata durumunda mock message dön
      const currentUser = getCurrentUser();
      return {
        id: `msg_${Date.now()}`,
        text: text,
        senderId: currentUser?.id.toString() || 'unknown',
        senderName: 'Me',
        timestamp: new Date().toISOString(),
        isOwn: true,
      };
    }
  }

  async getOnlineUsers(): Promise<ChatUser[]> {
    try {
      // Backend: GET /api/users (active users)
      const response = await apiClient.get('/api/users');
      const users = response.data || [];

      // Backend UserListItemDto: { id, name, surname, email, role }
      // Online status backend'de yok, şimdilik mock
      return users.map((user: any) => ({
        id: user.id.toString(),
        name: `${user.name} ${user.surname}`,
        avatar: `${user.name.charAt(0)}${user.surname.charAt(0)}`,
        online: true, // TODO: Backend'de online status implement edilecek
        lastSeen: 'Online',
      }));
    } catch (error) {
      console.error('Error fetching online users:', error);
      return [];
    }
  }

  // 5. UPCOMING TASKS (Calendar)
  async getUpcomingTasks(): Promise<CalendarTask[]> {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const isAdmin = currentUser.role === 'ADMIN';
      
      if (!isAdmin) {
        // USER için: backend endpoint yok
        console.warn('Upcoming tasks not available for regular users - backend endpoint needed');
        return [];
      }

      // Admin için: backend'den ticket'ları çek
      const response = await apiClient.get('/api/admin/tickets', {
        params: {
          page: 0,
          size: 50,
        },
      });

      const tickets = response.data.content || [];

      // Kullanıcıya assign edilmiş ve dueDate'i olan ticket'ları al
      const userTickets = tickets.filter((t: any) => 
        t.assignedToId === currentUser.id && 
        t.dueDate &&
        (t.status === 'OPEN' || t.status === 'IN_PROGRESS')
      );

      // Calendar task formatına çevir
      return userTickets.map((ticket: any) => {
        const dueDate = new Date(ticket.dueDate);
        const priority = ticket.priority ? ticket.priority.toLowerCase() : 'low';
        
        let color = 'blue';
        if (priority === 'high') color = 'purple';
        else if (priority === 'medium') color = 'blue';
        else color = 'emerald';

        return {
          id: ticket.id.toString(),
          ticketId: `TCK-${ticket.id}`,
          title: `Review ticket #TCK-${ticket.id}`,
          time: dueDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          date: dueDate.toISOString().split('T')[0],
          color,
          priority: priority as 'critical' | 'high' | 'medium' | 'low',
        };
      });
    } catch (error) {
      console.error('Error fetching upcoming tasks:', error);
      return [];
    }
  }

  // 6. NOTIFICATIONS
  async getNotifications(limit: number = 5): Promise<DashboardNotification[]> {
    try {
      // Backend: GET /api/notifications
      const response = await apiClient.get('/api/notifications', {
        params: {
          page: 0,
          size: limit,
        },
      });

      const notifications = response.data.content || response.data || [];

      // Backend NotificationDto mapping
      // { id, userId, title, message, type, isRead, createdAt }
      return notifications.map((notif: any) => {
        // Notification type mapping
        let type: 'success' | 'info' | 'warning' | 'error' = 'info';
        if (notif.type === 'SUCCESS') type = 'success';
        else if (notif.type === 'WARNING') type = 'warning';
        else if (notif.type === 'ERROR') type = 'error';

        // Calculate time ago
        const createdAt = new Date(notif.createdAt);
        const now = new Date();
        const diffMs = now.getTime() - createdAt.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        
        let timeAgo = '';
        if (diffMins < 60) {
          timeAgo = `${diffMins} minutes ago`;
        } else if (diffMins < 1440) {
          timeAgo = `${Math.floor(diffMins / 60)} hours ago`;
        } else {
          timeAgo = `${Math.floor(diffMins / 1440)} days ago`;
        }

        return {
          id: notif.id.toString(),
          type,
          title: notif.title,
          description: notif.message,
          time: timeAgo,
          read: notif.isRead,
        };
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      // Backend: PATCH /api/notifications/{id}/read
      await apiClient.patch(`/api/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Hata durumunda sessizce devam et
    }
  }

  // 7. REFRESH ALL DASHBOARD DATA
  async refreshDashboard() {
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