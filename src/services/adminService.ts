// ============================================
// ADMIN SERVICE - Backend API Entegrasyonu
// ============================================

const API_BASE_URL = "http://localhost:8081";

// ============================================
// INTERFACES - Backend & Frontend Schema Mapping
// ============================================

// Backend Response Schema (AdminUserResponseDto)
export interface AdminUserBackendResponse {
  id: number;
  email: string;
  name: string;
  surname: string;
  role: string; // "ADMIN" veya "USER"
  active: boolean;
  department: string;
  createdAt: string; // ISO date string
  lastLoginAt: string | null;
}

// Frontend User Interface (Mevcut yapı)
export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  department: string;
  position: string;
  role: 'admin' | 'user';
  status: 'active' | 'waitlisted';
  registrationDate: string;
}

// Create User Request (AdminUserCreateRequest)
export interface CreateUserRequest {
  email: string;
  name: string;
  surname: string;
  password: string;
  role: string; // "ADMIN" veya "USER"
  department: string;
}

// Update User Request (AdminUserUpdateRequest)
export interface UpdateUserRequest {
  name: string;
  surname: string;
  department: string;
}

// Change Role Request (ChangeUserRoleRequest)
export interface ChangeRoleRequest {
  role: string; // "ADMIN" veya "USER"
}

// Change Status Request (ChangeUserStatusRequest)
export interface ChangeStatusRequest {
  status: string; // "ACTIVE" veya "DISABLED"
}

// Paginated Response (PageAdminUserResponseDto)
export interface PaginatedUsersResponse {
  content: AdminUserBackendResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ============================================
// HELPER FUNCTIONS - Schema Mapping
// ============================================

/**
 * Backend response'unu frontend formatına çevir
 */
const mapBackendUserToFrontend = (backendUser: AdminUserBackendResponse): AdminUser => {
  return {
    id: backendUser.id.toString(),
    fullName: `${backendUser.name} ${backendUser.surname}`,
    email: backendUser.email,
    department: backendUser.department || 'N/A',
    position: 'N/A', // Backend'de position field'ı yok
    role: backendUser.role.toLowerCase() === 'admin' ? 'admin' : 'user',
    status: backendUser.active ? 'active' : 'waitlisted',
    registrationDate: new Date(backendUser.createdAt).toISOString().split('T')[0], // YYYY-MM-DD
  };
};

/**
 * Frontend'den backend create request'e çevir
 */
const mapFrontendToCreateRequest = (userData: {
  fullName: string;
  email: string;
  department: string;
  position: string;
  role: 'admin' | 'user';
}): CreateUserRequest => {
  const [name, ...surnameParts] = userData.fullName.trim().split(' ');
  const surname = surnameParts.join(' ') || 'User'; // Eğer surname yoksa default "User"

  return {
    email: userData.email,
    name: name,
    surname: surname,
    password: 'DefaultPassword123!', // Backend'de password zorunlu
    role: userData.role.toUpperCase(), // "ADMIN" veya "USER"
    department: userData.department,
  };
};

/**
 * Frontend'den backend update request'e çevir
 */
const mapFrontendToUpdateRequest = (userData: {
  fullName: string;
  email: string;
  department: string;
  position: string;
}): UpdateUserRequest => {
  const [name, ...surnameParts] = userData.fullName.trim().split(' ');
  const surname = surnameParts.join(' ') || 'User';

  return {
    name: name,
    surname: surname,
    department: userData.department,
  };
};

// ============================================
// API HELPER - Get Token
// ============================================

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ============================================
// ADMIN SERVICE
// ============================================

export const adminService = {
  /**
   * Get All Users (with pagination)
   * GET /api/admin/users?page=0&size=100
   */
  getUsers: async (): Promise<AdminUser[]> => {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/users?page=0&size=100`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data: PaginatedUsersResponse = await response.json();
    return data.content.map(mapBackendUserToFrontend);
  },

  /**
   * Get User by ID
   * GET /api/admin/users/{id}
   */
  getUserById: async (userId: string): Promise<AdminUser> => {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/users/${userId}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    const data: AdminUserBackendResponse = await response.json();
    return mapBackendUserToFrontend(data);
  },

  /**
   * Create New User
   * POST /api/admin/users
   */
  addUser: async (userData: {
    fullName: string;
    email: string;
    department: string;
    position: string;
    role: 'admin' | 'user';
  }): Promise<AdminUser> => {
    const requestData = mapFrontendToCreateRequest(userData);

    const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create user');
    }

    const data: AdminUserBackendResponse = await response.json();
    return mapBackendUserToFrontend(data);
  },

  /**
   * Update User
   * PUT /api/admin/users/{id}
   */
  editUser: async (
    userId: string,
    userData: {
      fullName: string;
      email: string;
      department: string;
      position: string;
    }
  ): Promise<AdminUser> => {
    const requestData = mapFrontendToUpdateRequest(userData);

    const response = await fetch(
      `${API_BASE_URL}/api/admin/users/${userId}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestData),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update user');
    }

    const data: AdminUserBackendResponse = await response.json();
    return mapBackendUserToFrontend(data);
  },

  /**
   * Change User Role
   * PATCH /api/admin/users/{id}/role
   * 
   * Backend void döndürüyor, user'ı tekrar fetch ediyoruz
   */
  changeUserRole: async (
    userId: string,
    newRole: 'admin' | 'user'
  ): Promise<AdminUser> => {
    const requestData: ChangeRoleRequest = {
      role: newRole.toUpperCase(), // "ADMIN" veya "USER"
    };

    const response = await fetch(
      `${API_BASE_URL}/api/admin/users/${userId}/role`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to change role: HTTP ${response.status}`);
    }

    // ✅ Backend void döndürüyor, user'ı tekrar fetch et
    return await adminService.getUserById(userId);
  },

  /**
   * Toggle User Status (Active/Disabled)
   * PATCH /api/admin/users/{id}/status
   * 
   * Backend void döndürüyor, user'ı tekrar fetch ediyoruz
   */
  toggleUserStatus: async (userId: string): Promise<AdminUser> => {
    // 1. Mevcut kullanıcıyı al
    const currentUser = await adminService.getUserById(userId);
    
    // 2. Status'ü tersine çevir - ACTIVE ↔ DISABLED
    const newStatus = currentUser.status === 'active' ? 'DISABLED' : 'ACTIVE';
    
    const requestData: ChangeStatusRequest = {
      status: newStatus,
    };

    // 3. Status değiştir
    const response = await fetch(
      `${API_BASE_URL}/api/admin/users/${userId}/status`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestData),
      }
    );

    // 4. Hata kontrolü
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to change status: HTTP ${response.status}`);
    }

    // 5. Backend void döndürüyor, user'ı tekrar fetch et
    return await adminService.getUserById(userId);
  },

  /**
   * Delete User
   * DELETE /api/admin/users/{id}
   * 
   * ✅ Backend endpoint artık mevcut!
   */
  deleteUser: async (userId: string): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/users/${userId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to delete user: HTTP ${response.status}`);
    }

    // Backend void döndürüyor, response body yok
    // Başarılı silme işlemi
  },

  /**
   * Add Department
   * POST /api/admin/departments
   * 
   */
  addDepartment: async (departmentName: string): Promise<void> => {
    console.log(' Department add requested:', departmentName);
    // Kullanıcıya başarılı gibi göster (şimdilik)
    return Promise.resolve();
    
    // Backend endpoint hazır olduğunda bu kod kullanılacak:
    /*
    const response = await fetch(`${API_BASE_URL}/api/admin/departments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name: departmentName }),
    });

    if (!response.ok) {
      throw new Error('Failed to create department');
    }
    */
  },
};

export default adminService;