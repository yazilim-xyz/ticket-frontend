// USER SERVICE - Backend API Integration
// Fetches users from admin endpoints
const API_BASE_URL = "http://localhost:8081";

// USER INTERFACES

export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  phoneNumber?: string;
  role: 'ADMIN' | 'USER';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalTicketsCreated: number;
  totalTicketsAssigned: number;
  completedTickets: number;
  averageResolutionTime: number;
}

// HELPER FUNCTIONS

const getAuthHeaders = (): HeadersInit => {
  // FIX: localStorage yerine sessionStorage kullan
  const token = sessionStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// USER SERVICE

class UserService {
  /**
   * Get all users
   * GET /api/admin/users
   */
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      throw new Error("Unauthorized. Please login again.");
    }

    if (response.status === 403) {
      throw new Error("You don't have permission to view users");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch users: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get user by ID
   * GET /api/admin/users/{id}
   */
  async getUserById(id: number): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.status === 404) {
      throw new Error("User not found");
    }

    if (response.status === 401) {
      throw new Error("Unauthorized. Please login again.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch user: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get user's tickets
   * GET /api/admin/users/{id}/tickets
   */
  async getUserTickets(userId: number): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/tickets`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.status === 404) {
      throw new Error("User not found");
    }

    if (response.status === 401) {
      throw new Error("Unauthorized. Please login again.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch user tickets: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get user's statistics
   * GET /api/admin/users/{id}/stats
   */
  async getUserStats(userId: number): Promise<UserStats> {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/stats`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.status === 404) {
      throw new Error("User not found");
    }

    if (response.status === 401) {
      throw new Error("Unauthorized. Please login again.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch user stats: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Update user role
   * PATCH /api/admin/users/{id}/role
   */
  async updateUserRole(userId: number, role: 'ADMIN' | 'USER'): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });

    if (response.status === 401) {
      throw new Error("Unauthorized. Please login again.");
    }

    if (response.status === 403) {
      throw new Error("You don't have permission to update user roles");
    }

    if (response.status === 404) {
      throw new Error("User not found");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update user role: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Update user status (active/inactive)
   * PATCH /api/admin/users/{id}/status
   */
  async updateUserStatus(userId: number, active: boolean): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ active }),
    });

    if (response.status === 401) {
      throw new Error("Unauthorized. Please login again.");
    }

    if (response.status === 403) {
      throw new Error("You don't have permission to update user status");
    }

    if (response.status === 404) {
      throw new Error("User not found");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update user status: ${response.status}`);
    }

    return await response.json();
  }
}

export const userService = new UserService();