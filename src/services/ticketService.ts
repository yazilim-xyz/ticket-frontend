import { Ticket } from '../types';

class TicketService {
  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Mock tickets data
  private mockTickets: Ticket[] = [
    {
      id: 'ticket_1',
      title: 'TCK-123',
      description: 'Fix user login issue - Users are experiencing authentication errors when trying to log in with their company email addresses.',
      project: 'Authentication',
      priority: 'high',
      status: 'in_progress',
      assignedTo: 'user_1',
      createdBy: 'admin_1',
      createdAt: '2025-12-15T10:00:00Z',
      dueDate: '2025-12-20T10:00:00Z',
      updatedAt: '2025-12-16T14:30:00Z',
      owner: {
        id: 'user_1',
        fullName: 'Ezgi Yücel',
        email: 'ezgi.yucel@company.com',
        department: 'Development',
        role: 'user',
        createdAt: '2024-01-01T00:00:00Z'
      }
    },
    {
      id: 'ticket_2',
      title: 'TCK-122',
      description: 'Optimize dashboard performance - Dashboard is loading slowly when displaying large datasets.',
      project: 'Acme GTM',
      priority: 'medium',
      status: 'in_progress',
      assignedTo: 'user_2',
      createdBy: 'admin_1',
      createdAt: '2025-12-14T09:00:00Z',
      dueDate: '2025-12-25T10:00:00Z',
      updatedAt: '2025-12-16T11:20:00Z',
      owner: {
        id: 'user_2',
        fullName: 'Nisa Öztürk',
        email: 'nisa.ozturk@company.com',
        department: 'Development',
        role: 'user',
        createdAt: '2024-01-01T00:00:00Z'
      }
    },
    {
      id: 'ticket_3',
      title: 'TCK-121',
      description: 'Add file upload option to ticket creation form',
      project: 'Luminex',
      priority: 'low',
      status: 'new',
      assignedTo: 'user_1',
      createdBy: 'admin_1',
      createdAt: '2025-12-13T14:00:00Z',
      dueDate: '2025-12-01T10:00:00Z',
      updatedAt: '2025-12-13T14:00:00Z',
      owner: {
        id: 'user_1',
        fullName: 'Ezgi Yücel',
        email: 'ezgi.yucel@company.com',
        department: 'Development',
        role: 'user',
        createdAt: '2024-01-01T00:00:00Z'
      }
    },
    {
      id: 'ticket_4',
      title: 'TCK-120',
      description: 'Implement SMTP error handling for email notifications',
      project: 'Notification Service',
      priority: 'low',
      status: 'completed',
      assignedTo: 'user_3',
      createdBy: 'admin_1',
      createdAt: '2025-12-10T10:00:00Z',
      dueDate: '2025-12-18T10:00:00Z',
      updatedAt: '2025-12-17T16:45:00Z',
      owner: {
        id: 'user_3',
        fullName: 'Beyzanur Aslan',
        email: 'beyzanur.aslan@company.com',
        department: 'Backend',
        role: 'user',
        createdAt: '2024-01-01T00:00:00Z'
      }
    },
    {
      id: 'ticket_5',
      title: 'TCK-119',
      description: 'Design reporting dashboard for project managers',
      project: 'Analytics & Reports',
      priority: 'medium',
      status: 'in_progress',
      assignedTo: 'user_2',
      createdBy: 'admin_1',
      createdAt: '2025-12-12T08:00:00Z',
      dueDate: '2025-12-22T10:00:00Z',
      updatedAt: '2025-12-15T13:00:00Z',
      owner: {
        id: 'user_2',
        fullName: 'Nisa Öztürk',
        email: 'nisa.ozturk@company.com',
        department: 'Development',
        role: 'user',
        createdAt: '2024-01-01T00:00:00Z'
      }
    },
    {
      id: 'ticket_6',
      title: 'TCK-118',
      description: 'Fix user permission update bug in admin panel',
      project: 'Admin Module',
      priority: 'medium',
      status: 'blocked',
      assignedTo: 'user_4',
      createdBy: 'admin_1',
      createdAt: '2025-12-11T11:00:00Z',
      dueDate: '2025-12-19T10:00:00Z',
      updatedAt: '2025-12-16T09:30:00Z',
      owner: {
        id: 'user_4',
        fullName: 'Türker Kıvılcım',
        email: 'turker.kivilcim@company.com',
        department: 'Backend',
        role: 'user',
        createdAt: '2024-01-01T00:00:00Z'
      }
    },
    {
      id: 'ticket_7',
      title: 'TCK-117',
      description: 'Optimize JWT validation time for API requests',
      project: 'Project Orion',
      priority: 'medium',
      status: 'in_progress',
      assignedTo: 'user_1',
      createdBy: 'admin_1',
      createdAt: '2025-12-09T15:00:00Z',
      dueDate: '2025-12-23T10:00:00Z',
      updatedAt: '2025-12-16T10:15:00Z',
      owner: {
        id: 'user_1',
        fullName: 'Ezgi Yücel',
        email: 'ezgi.yucel@company.com',
        department: 'Development',
        role: 'user',
        createdAt: '2024-01-01T00:00:00Z'
      }
    },
    {
      id: 'ticket_8',
      title: 'TCK-116',
      description: 'Improve ticket status history view',
      project: 'DataVista',
      priority: 'low',
      status: 'new',
      assignedTo: 'user_3',
      createdBy: 'admin_1',
      createdAt: '2025-12-08T12:00:00Z',
      dueDate: '2025-12-30T10:00:00Z',
      updatedAt: '2025-12-08T12:00:00Z',
      owner: {
        id: 'user_3',
        fullName: 'Beyzanur Aslan',
        email: 'beyzanur.aslan@company.com',
        department: 'Backend',
        role: 'user',
        createdAt: '2024-01-01T00:00:00Z'
      }
    },
    {
      id: 'ticket_9',
      title: 'TCK-115',
      description: 'Integrate chatbot assistant into support panel',
      project: 'EchoMind',
      priority: 'low',
      status: 'completed',
      assignedTo: 'user_2',
      createdBy: 'admin_1',
      createdAt: '2025-12-07T09:00:00Z',
      dueDate: '2025-12-15T10:00:00Z',
      updatedAt: '2025-12-14T17:00:00Z',
      owner: {
        id: 'user_2',
        fullName: 'Nisa Öztürk',
        email: 'nisa.ozturk@company.com',
        department: 'Development',
        role: 'user',
        createdAt: '2024-01-01T00:00:00Z'
      }
    },
    {
      id: 'ticket_10',
      title: 'TCK-114',
      description: 'Replace Recharts with ApexCharts in analytics module',
      project: 'InsightHub',
      priority: 'high',
      status: 'in_progress',
      assignedTo: 'user_4',
      createdBy: 'admin_1',
      createdAt: '2025-12-06T13:00:00Z',
      dueDate: '2025-12-17T10:00:00Z',
      updatedAt: '2025-12-16T15:20:00Z',
      owner: {
        id: 'user_4',
        fullName: 'Türker Kıvılcım',
        email: 'turker.kivilcim@company.com',
        department: 'Backend',
        role: 'user',
        createdAt: '2024-01-01T00:00:00Z'
      }
    },
    {
      id: 'ticket_11',
      title: 'TCK-113',
      description: 'Update UI color palette to match corporate branding',
      project: 'Aegis',
      priority: 'high',
      status: 'new',
      assignedTo: 'user_1',
      createdBy: 'admin_1',
      createdAt: '2025-12-05T10:00:00Z',
      dueDate: '2025-12-16T10:00:00Z',
      updatedAt: '2025-12-05T10:00:00Z',
      owner: {
        id: 'user_1',
        fullName: 'Ezgi Yücel',
        email: 'ezgi.yucel@company.com',
        department: 'Development',
        role: 'user',
        createdAt: '2024-01-01T00:00:00Z'
      }
    },
    {
      id: 'ticket_12',
      title: 'TCK-112',
      description: 'Add comment system to ticket details page',
      project: 'Ticket Lifecycle',
      priority: 'medium',
      status: 'in_progress',
      assignedTo: 'user_3',
      createdBy: 'admin_1',
      createdAt: '2025-12-04T14:00:00Z',
      dueDate: '2025-12-21T10:00:00Z',
      updatedAt: '2025-12-16T12:00:00Z',
      owner: {
        id: 'user_3',
        fullName: 'Beyzanur Aslan',
        email: 'beyzanur.aslan@company.com',
        department: 'Backend',
        role: 'user',
        createdAt: '2024-01-01T00:00:00Z'
      }
    },
    {
      id: 'ticket_13',
      title: 'TCK-111',
      description: 'Add real-time notifications via Socket.io',
      project: 'PulseWave',
      priority: 'high',
      status: 'cancelled',
      assignedTo: 'user_2',
      createdBy: 'admin_1',
      createdAt: '2025-12-03T11:00:00Z',
      dueDate: '2025-12-14T10:00:00Z',
      updatedAt: '2025-12-13T10:00:00Z',
      owner: {
        id: 'user_2',
        fullName: 'Nisa Öztürk',
        email: 'nisa.ozturk@company.com',
        department: 'Development',
        role: 'user',
        createdAt: '2024-01-01T00:00:00Z'
      }
    },
  ];

  async getTickets(userId?: string): Promise<Ticket[]> {
    await this.delay(800);
    
    if (userId) {
      // Filter tickets for specific user (Active Tickets)
      return this.mockTickets.filter(ticket => ticket.assignedTo === userId);
    }
    
    // Return all tickets (All Tickets - Admin)
    return this.mockTickets;
  }

  async getTicketById(id: string): Promise<Ticket | null> {
    await this.delay(500);
    
    const ticket = this.mockTickets.find(t => t.id === id);
    return ticket || null;
  }

  async updateTicket(id: string, data: Partial<Ticket>): Promise<Ticket | null> {
    await this.delay(600);
    
    const index = this.mockTickets.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    this.mockTickets[index] = {
      ...this.mockTickets[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return this.mockTickets[index];
  }

  async deleteTicket(id: string): Promise<boolean> {
    await this.delay(500);
    
    const index = this.mockTickets.findIndex(t => t.id === id);
    if (index === -1) return false;
    
    this.mockTickets.splice(index, 1);
    return true;
  }
}

export const ticketService = new TicketService();
export default ticketService;