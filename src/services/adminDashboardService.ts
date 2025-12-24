import { 
  AdminDashboardStats, 
  AgentPerformance, 
  DepartmentStats, 
  TicketDistribution,
  TeamActivityData,
  OverdueTicket 
} from '../types';
import { RecentTicket } from '../components/admin/RecentTicketsWidget';
import apiClient, { handleApiError } from '../utils/apiClient';

class AdminDashboardService {
  // Get admin stats
  async getAdminStats(): Promise<AdminDashboardStats> {
    try {
      // Backend'de admin stats endpoint'i yok, ticket ve user API'lerinden hesaplayacağız
      
      // 1. Tüm ticket'ları çek
      const ticketsResponse = await apiClient.get('/api/admin/tickets', {
        params: {
          page: 0,
          size: 1000,
        },
      });

      // 2. Tüm kullanıcıları çek
      const usersResponse = await apiClient.get('/api/admin/users', {
        params: {
          page: 0,
          size: 1000,
        },
      });

      const tickets = ticketsResponse.data.content || [];
      const users = usersResponse.data.content || [];

      // Total Team Tickets
      const totalTeamTickets = tickets.length;

      // Total Users
      const totalUsers = users.length;

      // Resolved This Week (son 7 gün içinde resolved olan ticket'lar)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const resolvedThisWeek = tickets.filter((t: any) => {
        if (t.status !== 'RESOLVED' && t.status !== 'CLOSED') return false;
        const updatedAt = new Date(t.updatedAt);
        return updatedAt >= oneWeekAgo;
      }).length;

      // Total Open Tickets (OPEN, IN_PROGRESS, BLOCKED durumunda olanlar)
      const totalOpenTickets = tickets.filter((t: any) => 
        t.status === 'OPEN' || t.status === 'IN_PROGRESS' || t.status === 'BLOCKED'
      ).length;

      // TODO: Change percentages gerçek hesaplama yapılmalı (önceki haftayla karşılaştırma)
      return {
        totalTeamTickets,
        totalTeamTicketsChange: '+18%',
        totalUsers,
        totalUsersChange: '+3',
        resolvedThisWeek,
        resolvedThisWeekChange: '+25%',
        totalOpenTickets,
        totalOpenTicketsChange: '-12%',
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw new Error(handleApiError(error));
    }
  }

  // GET AGENT PERFORMANCE (Top performers)
  async getAgentPerformance(): Promise<AgentPerformance[]> {
    try {
      // Backend: GET /api/tickets/analytics/top-resolvers
      const response = await apiClient.get('/api/tickets/analytics/top-resolvers');
      const topResolvers = response.data || [];

      // Backend TicketResolutionStatsDTO mapping
      // { userId, userName, userSurname, userEmail, resolvedCount, 
      //   unResolvedCount, successRate, averageResolutionTime }

      return topResolvers.map((resolver: any, index: number) => {
        // Avatar oluştur
        const avatar = `${resolver.userName.charAt(0)}${resolver.userSurname.charAt(0)}`;
        
        // Status belirleme (ilk 3 online, diğerleri busy/offline)
        let status: 'online' | 'offline' | 'busy' = 'online';
        if (index >= 3) {
          status = Math.random() > 0.5 ? 'busy' : 'offline';
        }

        return {
          id: resolver.userId.toString(),
          name: `${resolver.userName} ${resolver.userSurname}`,
          avatar,
          email: resolver.userEmail,
          ticketsSolved: resolver.resolvedCount,
          activeTickets: resolver.unResolvedCount,
          successRate: Math.round(resolver.successRate),
          status,
        };
      });
    } catch (error) {
      console.error('Error fetching agent performance:', error);
      return [];
    }
  }

  // Get department stats
  async getDepartmentStats(): Promise<DepartmentStats[]> {
    try {
      // Backend'de department stats endpoint'i yok
      // Kullanıcıları ve ticket'larını department'a göre grupla
      
      const usersResponse = await apiClient.get('/api/admin/users', {
        params: {
          page: 0,
          size: 1000,
        },
      });

      const ticketsResponse = await apiClient.get('/api/admin/tickets', {
        params: {
          page: 0,
          size: 1000,
        },
      });

      const users = usersResponse.data.content || [];
      const tickets = ticketsResponse.data.content || [];

      // Department'ları grupla
      const departmentMap = new Map<string, {
        users: any[];
        tickets: any[];
      }>();

      users.forEach((user: any) => {
        const dept = user.department || 'Unassigned';
        if (!departmentMap.has(dept)) {
          departmentMap.set(dept, { users: [], tickets: [] });
        }
        departmentMap.get(dept)!.users.push(user);
      });

      // Her kullanıcının ticket'larını department'a ekle
      tickets.forEach((ticket: any) => {
        const assignedUser = users.find((u: any) => u.id === ticket.assignedToId);
        if (assignedUser) {
          const dept = assignedUser.department || 'Unassigned';
          if (departmentMap.has(dept)) {
            departmentMap.get(dept)!.tickets.push(ticket);
          }
        }
      });

      // Department stats hesapla
      const departmentStats: DepartmentStats[] = [];
      departmentMap.forEach((data, deptName) => {
        const deptTickets = data.tickets;
        
        const totalTickets = deptTickets.length;
        const resolvedTickets = deptTickets.filter((t: any) => 
          t.status === 'RESOLVED' || t.status === 'CLOSED'
        ).length;
        const pendingTickets = deptTickets.filter((t: any) => 
          t.status === 'OPEN' || t.status === 'IN_PROGRESS'
        ).length;
        const overdueTickets = deptTickets.filter((t: any) => {
          if (!t.dueDate) return false;
          const dueDate = new Date(t.dueDate);
          const now = new Date();
          return dueDate < now && (t.status !== 'RESOLVED' && t.status !== 'CLOSED');
        }).length;

        departmentStats.push({
          id: `dept_${deptName.toLowerCase().replace(/\s+/g, '_')}`,
          name: deptName,
          totalTickets,
          resolvedTickets,
          pendingTickets,
          overdueTickets,
          avgResolutionTime: '3.5h', // TODO: Gerçek hesaplama
        });
      });

      return departmentStats;
    } catch (error) {
      console.error('Error fetching department stats:', error);
      return [];
    }
  }

  // Get Ticket Distribution
  async getTicketDistribution(): Promise<TicketDistribution[]> {
    try {
      // Backend'den tüm ticket'ları çek ve status'e göre grupla
      const response = await apiClient.get('/api/admin/tickets', {
        params: {
          page: 0,
          size: 1000,
        },
      });

      const tickets = response.data.content || [];
      const total = tickets.length || 1; // 0 bölme hatası önleme

      // Status'e göre grupla
      const statusMap = new Map<string, number>();
      tickets.forEach((ticket: any) => {
        const status = ticket.status || 'UNKNOWN';
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
      });

      // Distribution array'ine çevir
      const distribution: TicketDistribution[] = [];
      const statusColors: Record<string, string> = {
        'OPEN': '#06b6d4',
        'IN_PROGRESS': '#f59e0b',
        'BLOCKED': '#8b5cf6',
        'RESOLVED': '#10b981',
        'CLOSED': '#6b7280',
        'CANCELLED': '#ef4444',
      };

      statusMap.forEach((count, status) => {
        const percentage = (count / total) * 100;
        distribution.push({
          status: status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
          count,
          percentage: Math.round(percentage * 10) / 10,
          color: statusColors[status] || '#9ca3af',
        });
      });

      return distribution;
    } catch (error) {
      console.error('Error fetching ticket distribution:', error);
      return [];
    }
  }

  // Get Team Activity Trend
  async getTeamActivityTrend(period: 'week' | 'month' | 'year' = 'week'): Promise<TeamActivityData> {
    try {
      // Backend'den tüm ticket'ları çek
      const response = await apiClient.get('/api/admin/tickets', {
        params: {
          page: 0,
          size: 1000,
        },
      });

      const tickets = response.data.content || [];

      // Period'a göre zaman aralığı ve label'lar belirle
      let labels: string[] = [];
      let dataPoints: number;
      let startDate: Date;
      const now = new Date();

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
      const createdData: number[] = new Array(dataPoints).fill(0);
      const resolvedData: number[] = new Array(dataPoints).fill(0);

      tickets.forEach((ticket: any) => {
        // Created tickets
        const createdAt = new Date(ticket.createdAt);
        if (createdAt >= startDate) {
          let createIndex = -1;

          if (period === 'week') {
            const dayOfWeek = createdAt.getDay();
            createIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          } else if (period === 'month') {
            const diffTime = now.getTime() - createdAt.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            createIndex = Math.min(3, Math.floor(diffDays / 7));
            createIndex = 3 - createIndex;
          } else {
            createIndex = createdAt.getMonth();
          }

          if (createIndex >= 0 && createIndex < dataPoints) {
            createdData[createIndex]++;
          }
        }

        // Resolved tickets
        if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
          const updatedAt = new Date(ticket.updatedAt);
          if (updatedAt >= startDate) {
            let resolveIndex = -1;

            if (period === 'week') {
              const dayOfWeek = updatedAt.getDay();
              resolveIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            } else if (period === 'month') {
              const diffTime = now.getTime() - updatedAt.getTime();
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              resolveIndex = Math.min(3, Math.floor(diffDays / 7));
              resolveIndex = 3 - resolveIndex;
            } else {
              resolveIndex = updatedAt.getMonth();
            }

            if (resolveIndex >= 0 && resolveIndex < dataPoints) {
              resolvedData[resolveIndex]++;
            }
          }
        }
      });

      return {
        labels,
        createdData,
        resolvedData,
        period,
      };
    } catch (error) {
      console.error('Error fetching team activity trend:', error);
      // Hata durumunda boş data dön
      const emptyData = {
        week: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          createdData: [0, 0, 0, 0, 0, 0, 0],
          resolvedData: [0, 0, 0, 0, 0, 0, 0],
        },
        month: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          createdData: [0, 0, 0, 0],
          resolvedData: [0, 0, 0, 0],
        },
        year: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          createdData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          resolvedData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
      };
      return {
        labels: emptyData[period].labels,
        createdData: emptyData[period].createdData,
        resolvedData: emptyData[period].resolvedData,
        period,
      };
    }
  }

  // Refresh all admin data
  async refreshAdminDashboard() {
    const [stats, agents, departments, distribution, activity] = await Promise.all([
      this.getAdminStats(),
      this.getAgentPerformance(),
      this.getDepartmentStats(),
      this.getTicketDistribution(),
      this.getTeamActivityTrend(),
    ]);

    return { stats, agents, departments, distribution, activity };
  }

  // GET OVERDUE TICKETS
  async getOverdueTickets(): Promise<OverdueTicket[]> {
    try {
      // Backend'den ticket'ları çek ve overdue olanları filtrele
      const response = await apiClient.get('/api/admin/tickets', {
        params: {
          page: 0,
          size: 100,
        },
      });

      const tickets = response.data.content || [];
      const now = new Date();

      // Overdue ticket'ları filtrele
      const overdueTickets = tickets
        .filter((ticket: any) => {
          if (!ticket.dueDate) return false;
          const dueDate = new Date(ticket.dueDate);
          return dueDate < now && (ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED');
        })
        .map((ticket: any) => {
          const dueDate = new Date(ticket.dueDate);
          const diffMs = now.getTime() - dueDate.getTime();
          const daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24));

          // Priority mapping
          let priority = 'Medium';
          if (ticket.priority === 'HIGH') priority = 'High';
          else if (ticket.priority === 'LOW') priority = 'Low';

          // Assigned user bilgisi
          const assignedTo = ticket.assignedToEmail 
            ? ticket.assignedToEmail.split('@')[0]
            : 'Unassigned';
          
          const assignedToAvatar = assignedTo !== 'Unassigned'
            ? assignedTo.substring(0, 2).toUpperCase()
            : 'UN';

          return {
            id: `overdue_${ticket.id}`,
            ticketId: `TCK-${ticket.id}`,
            title: ticket.title,
            priority,
            assignedTo,
            assignedToAvatar,
            daysOverdue,
            createdAt: ticket.createdAt,
            dueDate: ticket.dueDate,
          };
        });

      return overdueTickets;
    } catch (error) {
      console.error('Error fetching overdue tickets:', error);
      return [];
    }
  }

  // GET RECENT TICKETS (NEW!)
  async getRecentTickets(): Promise<RecentTicket[]> {
    try {
      // Backend'den son güncellenmiş ticket'ları çek
      const response = await apiClient.get('/api/admin/tickets', {
        params: {
          page: 0,
          size: 20,
          sort: 'updatedAt,desc', // Son güncellenenler önce
        },
      });

      const tickets = response.data.content || [];

      return tickets.map((ticket: any) => {
        // Status mapping
        let status: 'new' | 'in_progress' | 'done' | 'blocked' = 'new';
        if (ticket.status === 'IN_PROGRESS') status = 'in_progress';
        else if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') status = 'done';
        else if (ticket.status === 'BLOCKED') status = 'blocked';
        else if (ticket.status === 'OPEN') status = 'new';

        // Priority mapping
        let priority: 'low' | 'medium' | 'high' = 'medium';
        if (ticket.priority === 'HIGH') priority = 'high';
        else if (ticket.priority === 'LOW') priority = 'low';

        // Assigned user
        const assignedTo = ticket.assignedToEmail 
          ? ticket.assignedToEmail.split('@')[0]
          : 'Unassigned';

        // Project/Category
        const project = ticket.category || 'General';

        return {
          id: `recent_${ticket.id}`,
          ticketId: `TCK-${ticket.id}`,
          title: ticket.title,
          status,
          priority,
          assignedTo,
          updatedAt: ticket.updatedAt,
          project,
        };
      });
    } catch (error) {
      console.error('Error fetching recent tickets:', error);
      return [];
    }
  }
}
export const adminDashboardService = new AdminDashboardService();