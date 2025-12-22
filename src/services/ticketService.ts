// TICKET SERVICE - Backend API Integration
const API_BASE_URL = "http://localhost:8081";

// BACKEND ENUM TYPE DEFINITIONS (exact match from backend)
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketCategory = 'BUG' | 'FEATURE' | 'SUPPORT' | 'OTHER';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';

// INTERFACES (matching backend DTOs)

// User object in ticket responses
export interface TicketUser {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: string;
}

// Ticket response from backend (GET)
export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  createdBy: TicketUser;
  assignedTo?: TicketUser;
  dueDate?: string;
  resolutionSummary?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  comments?: TicketComment[];
}

// Create ticket request (POST /api/tickets)
export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
  createdById: number;  // REQUIRED by backend
}

// Update ticket status request (PATCH /api/tickets/{id}/status)
export interface UpdateTicketStatusRequest {
  status: TicketStatus;
}

// Assign ticket request (PATCH /api/tickets/{id}/assign)
export interface AssignTicketRequest {
  assignedToId: number;
}

// Ticket comment
export interface TicketComment {
  id: number;
  ticket: any;
  user: TicketUser;
  commentText: string;
  createdAt: string;
}

// Add comment request (POST /api/tickets/{id}/comments)
export interface AddCommentRequest {
  authorId: number;
  content: string;
}


// HELPER FUNCTIONS

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Get current user ID from localStorage
const getCurrentUserId = (): number => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    throw new Error("User not authenticated. Please login again.");
  }
  return parseInt(userId, 10);
};


// TICKET SERVICE

class TicketService {
  // Get all tickets (no userId filter for now - backend may support later)
  async getTickets(): Promise<Ticket[]> {
    const response = await fetch(`${API_BASE_URL}/api/tickets`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    if (response.status === 401) {
      throw new Error("Unauthorized. Please login again.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch tickets: ${response.status}`);
    }

    return await response.json();
  }

  // Get ticket by ID
  async getTicketById(id: number): Promise<Ticket> {
    const response = await fetch(`${API_BASE_URL}/api/tickets/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.status === 404) {
      throw new Error("Ticket not found");
    }

    if (response.status === 401) {
      throw new Error("Unauthorized. Please login again.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch ticket: ${response.status}`);
    }

    return await response.json();
  }

  // Create new ticket
  async createTicket(ticketData: Omit<CreateTicketRequest, 'createdById'>): Promise<Ticket> {
    // Get current user ID from localStorage
    const createdById = getCurrentUserId();

    // Prepare payload matching backend TicketCreateRequest schema
    const payload: CreateTicketRequest = {
      title: ticketData.title,
      description: ticketData.description,
      priority: ticketData.priority,
      category: ticketData.category,
      createdById,  // ✅ Add current user ID
    };

    console.log('Creating ticket with payload:', payload);

    const response = await fetch(`${API_BASE_URL}/api/tickets`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      throw new Error("Unauthorized. Please login again.");
    }

    if (response.status === 403) {
      throw new Error("You don't have permission to create tickets");
    }

    if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Invalid ticket data");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create ticket: ${response.status}`);
    }

    const result = await response.json();
    console.log('Ticket created successfully:', result);
    return result;
  }
  
  // Update ticket status
  async updateTicketStatus(ticketId: number, status: TicketStatus): Promise<Ticket> {
    const payload: UpdateTicketStatusRequest = { status };

    const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      throw new Error("Unauthorized. Please login again.");
    }

    if (response.status === 403) {
      throw new Error("You don't have permission to update this ticket");
    }

    if (response.status === 404) {
      throw new Error("Ticket not found");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update ticket status: ${response.status}`);
    }

    return await response.json();
  }

  // Assign ticket to user
  async assignTicket(ticketId: number, assignedToId: number): Promise<Ticket> {
    const payload: AssignTicketRequest = { assignedToId };

    const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/assign`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      throw new Error("Unauthorized. Please login again.");
    }

    if (response.status === 403) {
      throw new Error("You don't have permission to assign tickets");
    }

    if (response.status === 404) {
      throw new Error("Ticket not found");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to assign ticket: ${response.status}`);
    }

    return await response.json();
  }
// Get comments for a ticket
  async getComments(ticketId: number): Promise<TicketComment[]> {
    const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/comments`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      throw new Error("Unauthorized. Please login again.");
    }

    if (response.status === 404) {
      throw new Error("Ticket not found");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch comments: ${response.status}`);
    }

    return await response.json();
  }

  // Add comment to ticket
  async addComment(ticketId: number, content: string): Promise<TicketComment> {
    const authorId = getCurrentUserId();

    const payload: AddCommentRequest = {
      authorId,
      content,
    };

    const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/comments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      throw new Error("Unauthorized. Please login again.");
    }

    if (response.status === 403) {
      throw new Error("You don't have permission to add comments");
    }

    if (response.status === 404) {
      throw new Error("Ticket not found");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to add comment: ${response.status}`);
    }

    return await response.json();
  }

  // Delete ticket (soft delete)
  async deleteTicket(ticketId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      throw new Error("Unauthorized. Please login again.");
    }

    if (response.status === 403) {
      throw new Error("You don't have permission to delete tickets");
    }

    if (response.status === 404) {
      throw new Error("Ticket not found");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete ticket: ${response.status}`);
    }
  }
}

export const ticketService = new TicketService();