// User Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  department: string;
  role: 'admin' | 'user';
  profilePhoto?: string;
  phoneNumber?: string;
  createdAt: string;
}

// Ticket Types
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'new' | 'in_progress' | 'completed' | 'cancelled' | 'blocked';

export interface Ticket {
  id: string;
  title: string; // TCK-123
  description: string;
  project: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string; // User ID
  createdBy: string; // User ID
  createdAt: string;
  dueDate: string;
  updatedAt: string;
  owner?: User;
  assignee?: User;
}

// Statistics Types
export interface TicketStats {
  total: number;
  active: number;
  completed: number;
  pending: number;
  overdue: number;
}

export interface PerformanceStats {
  totalTickets: number;
  completedTickets: number;
  averageCompletionTime: number;
  successRate: number;
}

// Chat Types
export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  department: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Dashboard Stats (Ana kartlar için)
export interface DashboardStats {
  activeTickets: number;
  pendingTickets: number;
  resolvedTickets: number;
  overdueTickets: number;
  activeTicketsChange: string;      // "+12%"
  pendingTicketsChange: string;     // "+5%"
  resolvedTicketsChange: string;    // "+23%"
  overdueTicketsChange: string;     // "-2%"
}

// Personal Stats (PersonalStats component için)
export interface PersonalStatsData {
  ticketsSolved: number;
  ticketsSolvedPercentage: number;  // 0-100
  avgResolutionTime: string;        // "3h"
  avgResolutionTimePercentage: number; // 0-100
  successRate: number;              // 0-100
}

// Activity Trend (Grafik için)
export interface ActivityTrendData {
  labels: string[];                 // ["0", "1", "2", ...]
  completedData: number[];          // Green line - Tamamlanan
  inProgressData: number[];         // Cyan line - Devam eden
  blockedData: number[];            // Red line - Engellenmiş
  period?: 'week' | 'month' | 'year';
}

// Chat User (Dashboard TeamChat için)
export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  online: boolean;
  lastSeen?: string;
}

// Team Chat Message (Dashboard TeamChat için)
export interface TeamChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  isOwn: boolean;
}

// Calendar Task (Upcoming Tasks için)
export interface CalendarTask {
  id: string;
  ticketId: string;
  title: string;
  time: string;
  date: string;
  color: 'purple' | 'blue' | 'emerald' | 'amber';
  priority: TicketPriority;
}

// Dashboard Notification (NotificationsPanel için)
export interface DashboardNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

// ADMIN DASHBOARD TYPES
export interface AdminDashboardStats {
  totalTeamTickets: number;
  totalTeamTicketsChange: string;
  activeAgents: number;
  activeAgentsChange: string;
  resolvedThisWeek: number;
  resolvedThisWeekChange: string;
  avgTeamResolutionTime: string;
  avgTeamResolutionTimeChange: string;
}

export interface AgentPerformance {
  id: string;
  name: string;
  avatar: string;
  email: string;
  ticketsSolved: number;
  activeTickets: number;
  avgResolutionTime: string;
  successRate: number;
  status: 'online' | 'offline' | 'busy';
}

export interface DepartmentStats {
  id: string;
  name: string;
  totalTickets: number;
  resolvedTickets: number;
  pendingTickets: number;
  overdueTickets: number;
  avgResolutionTime: string;
}

export interface TicketDistribution {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TeamActivityData {
  labels: string[];
  createdData: number[];
  resolvedData: number[];
  period: 'week' | 'month' | 'year';
}

// OVERDUE TICKETS TYPE
export interface OverdueTicket {
  id: string;
  ticketId: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  assignedTo: string;
  assignedToAvatar: string;
  daysOverdue: number;
  createdAt: string;
  dueDate: string;
}

// CALENDAR TYPES
export interface CalendarEvent {
  id: string;
  ticketId: string;
  title: string;
  description: string;
  date: string; // ISO format: "2025-01-17"
  type: 'ticket' | 'meeting' | 'task' | 'deadline';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Done';
  assignedTo?: string;
  color: string;
  tags?: string[];
}

export interface CalendarData {
  events: CalendarEvent[];
  month: number;
  year: number;
}