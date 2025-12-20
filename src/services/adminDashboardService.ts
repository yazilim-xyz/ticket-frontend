import { 
  AdminDashboardStats, 
  AgentPerformance, 
  DepartmentStats, 
  TicketDistribution,
  TeamActivityData,
  OverdueTicket 
} from '../types';
import { RecentTicket } from '../components/admin/RecentTicketsWidget';

class AdminDashboardService {
  // Simulate API delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get admin stats
  async getAdminStats(): Promise<AdminDashboardStats> {
    await this.delay(800);
    
    // TODO: Replace with actual API call
    // const response = await fetch('/api/admin/dashboard/stats');
    
    return {
      totalTeamTickets: 156,
      totalTeamTicketsChange: '+18%',
      totalUsers: 24,
      totalUsersChange: '+3',
      resolvedThisWeek: 89,
      resolvedThisWeekChange: '+25%',
      totalOpenTickets: 67,
      totalOpenTicketsChange: '-12%',
    };
  }

  // GET AGENT PERFORMANCE (Top performers)
  async getAgentPerformance(): Promise<AgentPerformance[]> {
    await this.delay(600);
    
    // TODO: Replace with actual API call
    // const response = await fetch('/api/admin/agents/performance');
    
    return [
      {
        id: 'agent_1',
        name: 'Ahmet Yılmaz',
        avatar: 'AY',
        email: 'ahmet.yilmaz@company.com',
        ticketsSolved: 45,
        activeTickets: 8,
        avgResolutionTime: '2.5h',
        successRate: 98,
        status: 'online',
      },
      {
        id: 'agent_2',
        name: 'Ayşe Demir',
        avatar: 'AD',
        email: 'ayse.demir@company.com',
        ticketsSolved: 42,
        activeTickets: 12,
        avgResolutionTime: '3.1h',
        successRate: 96,
        status: 'online',
      },
      {
        id: 'agent_3',
        name: 'Mehmet Kaya',
        avatar: 'MK',
        email: 'mehmet.kaya@company.com',
        ticketsSolved: 38,
        activeTickets: 6,
        avgResolutionTime: '3.8h',
        successRate: 94,
        status: 'busy',
      },
      {
        id: 'agent_4',
        name: 'Fatma Çelik',
        avatar: 'FÇ',
        email: 'fatma.celik@company.com',
        ticketsSolved: 35,
        activeTickets: 9,
        avgResolutionTime: '4.2h',
        successRate: 92,
        status: 'online',
      },
      {
        id: 'agent_5',
        name: 'Ali Öztürk',
        avatar: 'AÖ',
        email: 'ali.ozturk@company.com',
        ticketsSolved: 31,
        activeTickets: 11,
        avgResolutionTime: '4.5h',
        successRate: 89,
        status: 'offline',
      },
    ];
  }

  // Get department stats
  async getDepartmentStats(): Promise<DepartmentStats[]> {
    await this.delay(700);
    
    // TODO: Replace with actual API call
    // const response = await fetch('/api/admin/departments/stats');
    
    return [
      {
        id: 'dept_1',
        name: 'Technical Support',
        totalTickets: 67,
        resolvedTickets: 45,
        pendingTickets: 18,
        overdueTickets: 4,
        avgResolutionTime: '3.5h',
      },
      {
        id: 'dept_2',
        name: 'Customer Service',
        totalTickets: 52,
        resolvedTickets: 38,
        pendingTickets: 12,
        overdueTickets: 2,
        avgResolutionTime: '2.8h',
      },
      {
        id: 'dept_3',
        name: 'Billing',
        totalTickets: 37,
        resolvedTickets: 29,
        pendingTickets: 7,
        overdueTickets: 1,
        avgResolutionTime: '4.1h',
      },
    ];
  }

  // Get Ticket Distribution
  async getTicketDistribution(): Promise<TicketDistribution[]> {
    await this.delay(500);
    
    // TODO: Replace with actual API call
    // const response = await fetch('/api/admin/tickets/distribution');
    
    return [
      { status: 'Open', count: 45, percentage: 28.8, color: '#06b6d4' },
      { status: 'In Progress', count: 38, percentage: 24.4, color: '#f59e0b' },
      { status: 'Pending', count: 32, percentage: 20.5, color: '#8b5cf6' },
      { status: 'Resolved', count: 28, percentage: 17.9, color: '#10b981' },
      { status: 'Closed', count: 13, percentage: 8.3, color: '#6b7280' },
    ];
  }

  // Get Team Activity Trend
  async getTeamActivityTrend(period: 'week' | 'month' | 'year' = 'week'): Promise<TeamActivityData> {
    await this.delay(700);
    
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/admin/activity/trend?period=${period}`);
    
    const mockData = {
      week: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        createdData: [12, 19, 15, 22, 18, 8, 5],
        resolvedData: [8, 14, 12, 18, 15, 6, 3],
      },
      month: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        createdData: [45, 52, 48, 55],
        resolvedData: [38, 45, 42, 48],
      },
      year: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        createdData: [120, 135, 142, 138, 145, 152, 148, 155, 150, 158, 162, 156],
        resolvedData: [98, 112, 118, 115, 122, 128, 125, 132, 128, 135, 138, 133],
      },
    };

    return {
      labels: mockData[period].labels,
      createdData: mockData[period].createdData,
      resolvedData: mockData[period].resolvedData,
      period,
    };
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
    await this.delay(600);
  
    // TODO: Replace with actual API call
    // const response = await fetch('/api/admin/tickets/overdue');
  
    return [
      {
        id: 'overdue_1',
        ticketId: 'TCK-198',
        title: 'Database connection timeout',
        priority: 'High',
        assignedTo: 'Mehmet Kaya',
        assignedToAvatar: 'MK',
        daysOverdue: 2,
        createdAt: '2024-12-06T10:30:00Z',
        dueDate: '2024-12-08T18:00:00Z',
      },
      {
        id: 'overdue_2',
        ticketId: 'TCK-176',
        title: 'Email delivery failure',
        priority: 'Medium',
        assignedTo: 'Ali Öztürk',
        assignedToAvatar: 'AÖ',
        daysOverdue: 5,
        createdAt: '2024-12-03T14:20:00Z',
        dueDate: '2024-12-05T12:00:00Z',
      },
      {
        id: 'overdue_3',
        ticketId: 'TCK-165',
        title: 'User permission issue',
        priority: 'High',
        assignedTo: 'Fatma Çelik',
        assignedToAvatar: 'FÇ',
        daysOverdue: 8,
        createdAt: '2024-11-30T09:15:00Z',
        dueDate: '2024-12-02T17:00:00Z',
      },
      {
        id: 'overdue_4',
        ticketId: 'TCK-152',
        title: 'API integration bug',
        priority: 'Low',
        assignedTo: 'Ahmet Yılmaz',
        assignedToAvatar: 'AY',
        daysOverdue: 3,
        createdAt: '2024-12-05T11:45:00Z',
        dueDate: '2024-12-07T16:00:00Z',
      },
    ];
  }
  // GET RECENT TICKETS (NEW!)
  async getRecentTickets(): Promise<RecentTicket[]> {
    await this.delay(500);
  
    // TODO: Replace with actual API call
    // const response = await fetch('/api/admin/tickets/recent');
  
    return [
      {
        id: 'recent_1',
        ticketId: 'TCK-248',
        title: 'Update API documentation for v2.0 release',
        status: 'done',
        priority: 'low',
        assignedTo: 'Ali Öztürk',
        updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        project: 'Documentation',
      },
      {
        id: 'recent_2',
        ticketId: 'TCK-247',
        title: 'Fix mobile responsive issues on dashboard',
        status: 'done',
        priority: 'medium',
        assignedTo: 'Ayşe Demir',
        updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        project: 'UI/UX',
      },
      {
        id: 'recent_3',
        ticketId: 'TCK-246',
        title: 'Add Excel export functionality to reports page',
        status: 'in_progress',
        priority: 'medium',
        assignedTo: 'Mehmet Kaya',
        updatedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(), // 35 minutes ago
        project: 'Analytics',
      },
      {
        id: 'recent_4',
        ticketId: 'TCK-245',
        title: 'Fix critical authentication bug in login flow',
        status: 'blocked',
        priority: 'high',
        assignedTo: 'Fatma Çelik',
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        project: 'Security',
      },
      {
        id: 'recent_5',
        ticketId: 'TCK-244',
        title: 'Implement real-time notification system for ticket updates',
        status: 'in_progress',
        priority: 'high',
        assignedTo: 'Ahmet Yılmaz',
        updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        project: 'Platform Core',
      },
      {
        id: 'recent_6',
        ticketId: 'TCK-243',
        title: 'Optimize database query performance for large datasets',
        status: 'in_progress',
        priority: 'high',
        assignedTo: 'Ahmet Yılmaz',
        updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        project: 'Backend',
      },
      {
        id: 'recent_7',
        ticketId: 'TCK-242',
        title: 'Design new user onboarding flow',
        status: 'new',
        priority: 'low',
        assignedTo: 'Ayşe Demir',
        updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        project: 'Product',
      },
      {
        id: 'recent_8',
        ticketId: 'TCK-241',
        title: 'Integrate third-party payment gateway',
        status: 'in_progress',
        priority: 'high',
        assignedTo: 'Mehmet Kaya',
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        project: 'E-commerce',
      },
      {
        id: 'recent_9',
        ticketId: 'TCK-240',
        title: 'Add multi-language support for European markets',
        status: 'done',
        priority: 'medium',
        assignedTo: 'Fatma Çelik',
        updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), // 20 hours ago
        project: 'Localization',
      },
      {
        id: 'recent_10',
        ticketId: 'TCK-239',
        title: 'Implement automated backup system',
        status: 'done',
        priority: 'high',
        assignedTo: 'Ali Öztürk',
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        project: 'Infrastructure',
      },
    ];
  }
}
export const adminDashboardService = new AdminDashboardService();