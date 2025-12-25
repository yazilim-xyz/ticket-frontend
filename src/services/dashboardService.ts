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

// Get current user from sessionStorage
const getCurrentUser = (): { id: number; name: string; surname: string; email: string; role: string } | null => {
  const user = sessionStorage.getItem('user');
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
        // USER için: /api/tickets/my-assigned endpoint'ini kullan
        // Bu endpoint TicketController.java'da mevcut
        try {
          const response = await apiClient.get('/api/tickets/my-assigned');
          tickets = response.data || [];
        } catch (err) {
          console.warn('Could not fetch assigned tickets:', err);
          tickets = [];
        }
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

      // Change yüzdeleri hesaplama (şimdilik statik, ileride geliştirilebilir)
      return {
        activeTickets,
        pendingTickets,
        resolvedTickets,
        overdueTickets,
        activeTicketsChange: activeTickets > 0 ? '+12%' : '+0%',
        pendingTicketsChange: pendingTickets > 0 ? '+5%' : '+0%',
        resolvedTicketsChange: resolvedTickets > 0 ? '+23%' : '+0%',
        overdueTicketsChange: overdueTickets > 0 ? '-2%' : '+0%',
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
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

      const isAdmin = currentUser.role === 'ADMIN';

      // Direkt my-assigned'dan hesapla (statistics endpoint 500 veriyor)
      try {
        const endpoint = isAdmin ? '/api/admin/tickets' : '/api/tickets/my-assigned';
        const response = await apiClient.get(endpoint, isAdmin ? { params: { page: 0, size: 1000 } } : undefined);
        
        let tickets = isAdmin ? (response.data.content || response.data || []) : (response.data || []);
        
        // Admin ise sadece kendisine atanan ticket'ları filtrele
        if (isAdmin) {
          tickets = tickets.filter((t: any) => 
            t.assignedToId === currentUser.id || t.ownerId === currentUser.id
          );
        }
        
        const resolvedTickets = tickets.filter((t: any) => 
          t.status === 'RESOLVED' || t.status === 'CLOSED'
        ).length;
        
        const cancelledTickets = tickets.filter((t: any) => 
          t.status === 'CANCELLED'
        ).length;
        
        const totalTickets = tickets.length || 1;
        const ticketsSolvedPercentage = Math.round((resolvedTickets / totalTickets) * 100);
        
        // Success rate: çözülen / (çözülen + iptal edilen)
        const successDenominator = resolvedTickets + cancelledTickets || 1;
        const successRate = Math.round((resolvedTickets / successDenominator) * 100);
        
        // Avg resolution time tahmini
        let avgResolutionTime = '0h';
        let avgResolutionTimePercentage = 0;
        
        if (resolvedTickets > 0) {
          const avgHours = Math.max(1, Math.min(8, Math.round(totalTickets / resolvedTickets * 2)));
          avgResolutionTime = `${avgHours}h`;
          avgResolutionTimePercentage = Math.min(100, Math.round((8 - avgHours) / 8 * 100));
        }

        return {
          ticketsSolved: resolvedTickets,
          ticketsSolvedPercentage: Math.min(ticketsSolvedPercentage, 100),
          avgResolutionTime,
          avgResolutionTimePercentage,
          successRate: Math.min(successRate, 100),
        };
      } catch (err) {
        console.warn('Could not calculate personal stats from tickets:', err);
      }

      // Hata durumunda boş stats dön
      return {
        ticketsSolved: 0,
        ticketsSolvedPercentage: 0,
        avgResolutionTime: '0h',
        avgResolutionTimePercentage: 0,
        successRate: 0,
      };
    } catch (error) {
      console.error('Error fetching personal stats:', error);
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

      const isAdmin = currentUser.role === 'ADMIN';
      let userTickets: any[] = [];

      if (isAdmin) {
        // Admin için: tüm ticket'ları çekip filtrele
        try {
          const response = await apiClient.get('/api/admin/tickets', {
            params: { page: 0, size: 1000 },
          });
          const allTickets = response.data.content || [];
          userTickets = allTickets.filter((t: any) => 
            t.ownerId === currentUser.id || t.assignedToId === currentUser.id
          );
        } catch (err) {
          console.warn('Could not fetch admin tickets for activity trend:', err);
        }
      } else {
        // USER için: my-assigned endpoint'ini kullan
        try {
          const response = await apiClient.get('/api/tickets/my-assigned');
          userTickets = response.data || [];
        } catch (err) {
          console.warn('Could not fetch user tickets for activity trend:', err);
        }
      }

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
        const updatedAt = new Date(ticket.updatedAt || ticket.createdAt);
        if (updatedAt < startDate) return;

        let index = -1;

        if (period === 'week') {
          const dayOfWeek = updatedAt.getDay();
          index = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        } else if (period === 'month') {
          const diffTime = now.getTime() - updatedAt.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          index = Math.min(3, Math.floor(diffDays / 7));
          index = 3 - index;
        } else {
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
      const emptyData: Record<string, ActivityTrendData> = {
        week: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          completedData: [0, 0, 0, 0, 0, 0, 0],
          inProgressData: [0, 0, 0, 0, 0, 0, 0],
          blockedData: [0, 0, 0, 0, 0, 0, 0],
          period: 'week',
        },
        month: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          completedData: [0, 0, 0, 0],
          inProgressData: [0, 0, 0, 0],
          blockedData: [0, 0, 0, 0],
          period: 'month',
        },
        year: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          completedData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          inProgressData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          blockedData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          period: 'year',
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
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return [];
      }

      // Mock data - backend chat API implement edildiğinde güncellenecek
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
      // Backend: GET /api/users (active users) - UserController.java'da mevcut
      const response = await apiClient.get('/api/users');
      const users = response.data || [];

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

  // 5. UPCOMING TASKS (Calendar Widget için)
  async getUpcomingTasks(): Promise<CalendarTask[]> {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const isAdmin = currentUser.role === 'ADMIN';
      let tickets: any[] = [];

      if (isAdmin) {
        // Admin için: tüm ticket'ları çek ve filtrele
        try {
          const response = await apiClient.get('/api/admin/tickets', {
            params: { page: 0, size: 50 },
          });
          const allTickets = response.data.content || response.data || [];
          tickets = allTickets.filter((t: any) => 
            t.assignedToId === currentUser.id && 
            (t.dueDate || t.createdAt) &&
            (t.status === 'OPEN' || t.status === 'IN_PROGRESS')
          );
        } catch (err) {
          console.warn('Could not fetch admin tickets for tasks:', err);
        }
      } else {
        // USER için: my-assigned endpoint'ini kullan
        try {
          const response = await apiClient.get('/api/tickets/my-assigned');
          const allTickets = response.data || [];
          // dueDate veya createdAt'i olan ve açık/devam eden ticket'ları filtrele
          tickets = allTickets.filter((t: any) => 
            (t.dueDate || t.createdAt) &&
            (t.status === 'OPEN' || t.status === 'IN_PROGRESS')
          );
        } catch (err) {
          console.warn('Could not fetch user tickets for tasks:', err);
        }
      }

      // Calendar task formatına çevir (calendarService mantığıyla uyumlu)
      return tickets.map((ticket: any) => this.mapTicketToCalendarTask(ticket));
    } catch (error) {
      console.error('Error fetching upcoming tasks:', error);
      return [];
    }
  }

  /**
   * Ticket'ı CalendarTask formatına çevir
   * CalendarTask tipi: color: 'purple' | 'blue' | 'emerald' | 'amber'
   *                    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
   */
  private mapTicketToCalendarTask(ticket: any): CalendarTask {
    // dueDate yoksa createdAt kullan
    const dateField = ticket.dueDate || ticket.createdAt;
    const taskDate = new Date(dateField);
    
    // Priority normalizasyonu (TicketPriority tipine uygun)
    const priority = this.normalizeTicketPriority(ticket.priority);
    
    // Priority'ye göre renk (CalendarTask tipine uygun)
    const color = this.getTaskColor(ticket.priority);

    return {
      id: ticket.id.toString(),
      ticketId: `TCK-${ticket.id}`,
      title: ticket.title || `Review ticket #TCK-${ticket.id}`,
      time: taskDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: taskDate.toISOString().split('T')[0],
      color,
      priority,
    };
  }

  /**
   * Priority'yi TicketPriority tipine normalize et
   * Return: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
   */
  private normalizeTicketPriority(priority: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const normalized = priority?.toUpperCase();
    
    if (normalized === 'CRITICAL' || normalized === 'URGENT') {
      return 'CRITICAL';
    }
    if (normalized === 'HIGH') {
      return 'HIGH';
    }
    if (normalized === 'LOW' || normalized === 'MINOR') {
      return 'LOW';
    }
    return 'MEDIUM';
  }

  /**
   * Priority'ye göre renk döndür
   * Return: 'purple' | 'blue' | 'emerald' | 'amber' (CalendarTask tipine uygun)
   */
  private getTaskColor(priority: string): 'purple' | 'blue' | 'emerald' | 'amber' {
    const normalized = priority?.toUpperCase();
    
    switch (normalized) {
      case 'CRITICAL':
      case 'URGENT':
        return 'purple';
      case 'HIGH':
        return 'amber';
      case 'LOW':
      case 'MINOR':
        return 'emerald';
      case 'MEDIUM':
      default:
        return 'blue';
    }
  }

  // 6. NOTIFICATIONS
  async getNotifications(limit: number = 5): Promise<DashboardNotification[]> {
    try {
      // Backend: GET /api/notifications
      // Eğer bu endpoint yoksa boş array dön
      try {
        const response = await apiClient.get('/api/notifications', {
          params: {
            page: 0,
            size: limit,
          },
        });

        const notifications = response.data.content || response.data || [];

        return notifications.map((notif: any) => {
          let type: 'success' | 'info' | 'warning' | 'error' = 'info';
          if (notif.type === 'SUCCESS') type = 'success';
          else if (notif.type === 'WARNING') type = 'warning';
          else if (notif.type === 'ERROR') type = 'error';

          const createdAt = new Date(notif.createdAt);
          const now = new Date();
          const diffMs = now.getTime() - createdAt.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          
          let timeAgo = '';
          if (diffMins < 1) {
            timeAgo = 'Just now';
          } else if (diffMins < 60) {
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
      } catch (err: any) {
        // 404 veya 403 hatası alırsak boş array dön
        if (err.response?.status === 404 || err.response?.status === 403) {
          console.warn('Notifications endpoint not available');
          return [];
        }
        throw err;
      }
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