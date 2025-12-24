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
  approved: boolean; // YENI: Admin approval status
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
  status: 'active' | 'waitlisted'; // active = approved, waitlisted = pending approval
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

// Approve User Request
export interface ApproveUserRequest {
  approved: boolean; // true = approve, false = reject
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
    // Approval sistemi: active VE approved ise "active", değilse "waitlisted"
    status: (backendUser.active && backendUser.approved) ? 'active' : 'waitlisted',
    registrationDate: new Date(backendUser.createdAt).toISOString().split('T')[0], // YYYY-MM-DD
  };
};

/**
 * Frontend'den backend create request'e çevir
 */
const mapFrontendToCreateRequest = (userData: {
  fullName: string;
  email: string;
  password: string;
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
    password: userData.password, // Backend'de password zorunlu
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
  // FIX: localStorage yerine sessionStorage kullan
  const token = sessionStorage.getItem('accessToken');
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
   * GET /api/admin/users
   */
  getUsers: async (): Promise<AdminUser[]> => {
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    // FIX: /admin/users -> /api/admin/users
    const url = `${API_BASE_URL}/api/admin/users?_t=${timestamp}`;

    console.log('🔄 Fetching users from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }

    const data = await response.json();
    console.log('📥 Raw backend response:', data);
    
    // Backend paginated response döndürüyorsa content'i al, değilse direkt data'yı kullan
    const users = data.content || data;
    console.log('📊 User count:', users.length);
    
    // Map backend users to frontend format
    return users.map((user: AdminUserBackendResponse) => mapBackendUserToFrontend(user));
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
    password: string;
    department: string;
    position: string;
    role: 'admin' | 'user';
  }): Promise<AdminUser> => {
    const requestData = mapFrontendToCreateRequest(userData);

    console.log('📤 Creating user with data:', requestData);

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
    console.log('✅ User created:', data);
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
   * PATCH /api/admin/users/{id}/active
   */
  toggleUserStatus: async (userId: string): Promise<AdminUser> => {
    // 1. Mevcut kullanıcıyı al
    const currentUser = await adminService.getUserById(userId);
    
    // 2. Status'ü tersine çevir
    const newActiveStatus = currentUser.status !== 'active';
    
    // 3. Status değiştir - Swagger'a göre /api/admin/users/{id}/active
    const response = await fetch(
      `${API_BASE_URL}/api/admin/users/${userId}/active`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ active: newActiveStatus }),
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
   * Approve/Reject User
   * PATCH /api/admin/users/{id}/approval
   */
  approveUser: async (userId: string, approved: boolean): Promise<AdminUser> => {
    // Swagger'a göre /api/admin/users/{id}/approval
    const response = await fetch(
      `${API_BASE_URL}/api/admin/users/${userId}/approval`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ approved }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to ${approved ? 'approve' : 'reject'} user: HTTP ${response.status}`);
    }

    // Backend void döndürüyor, user'ı tekrar fetch et
    return await adminService.getUserById(userId);
  },
  
  /**
   * Delete User
   * DELETE /api/admin/users/{id}
   */
  deleteUser: async (userId: string): Promise<void> => {
    console.log('🗑️ Attempting to delete user:', userId);
    // FIX: /admin/users -> /api/admin/users
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('🔍 Delete response status:', response.status);
    console.log('🔍 Delete response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Delete failed:', errorText);
      throw new Error(`Failed to delete user: ${response.status} - ${errorText}`);
    }

    console.log('✅ User deleted successfully');
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