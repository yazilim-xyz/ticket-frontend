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
  title: string;
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