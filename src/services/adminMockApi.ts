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

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  type: 'user' | 'ticket' | 'system';
}

export interface Permission {
  id: string;
  label: string;
  enabled: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalTickets: number;
  pendingApprovals: number;
}

// Mock Users Data
let mockUsers: AdminUser[] = [
  {
    id: '1',
    fullName: 'Ezgi Yucel',
    email: 'ezgi.yücel@company.com',
    department: 'Ar-Ge',
    position: 'Frontend Developer',
    role: 'user',
    status: 'waitlisted',
    registrationDate: '2025-10-17'
  },
  {
    id: '2',
    fullName: 'Ozge Nur Kok',
    email: 'ozgenur.kok@company.com',
    department: 'Ar-Ge',
    position: 'ML Engineer',
    role: 'user',
    status: 'waitlisted',
    registrationDate: '2025-10-17'
  },
  {
    id: '3',
    fullName: 'Nisa Ozturk',
    email: 'nisa.ozturk@company.com',
    department: 'Ar-Ge',
    position: 'AI Researcher',
    role: 'user',
    status: 'waitlisted',
    registrationDate: '2025-10-17'
  },
  {
    id: '4',
    fullName: 'Beyza Aslan',
    email: 'beyza.aslan@company.com',
    department: 'Ar-Ge',
    position: 'Backend Developer',
    role: 'user',
    status: 'active',
    registrationDate: '2025-10-16'
  },
  {
    id: '5',
    fullName: 'Yelda Cetin',
    email: 'yelda.cetin@company.com',
    department: 'Ar-Ge',
    position: 'QA Engineer',
    role: 'user',
    status: 'active',
    registrationDate: '2025-10-16'
  },
  {
    id: '6',
    fullName: 'Admin User',
    email: 'admin@company.com',
    department: 'Management',
    position: 'System Administrator',
    role: 'admin',
    status: 'active',
    registrationDate: '2025-01-01'
  },
];

// Mock Activity Logs
let mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    user: 'Beyda Ertek',
    action: 'updated ticket #TCK-125',
    timestamp: '2 minutes ago',
    type: 'ticket'
  },
  {
    id: '2',
    user: 'Admin',
    action: 'approved user Yelda Cetin',
    timestamp: '15 minutes ago',
    type: 'user'
  },
  {
    id: '3',
    user: 'Beyza Aslan',
    action: 'changed status to Active',
    timestamp: '1 hour ago',
    type: 'system'
  },
  {
    id: '4',
    user: 'Ezgi Yücel',
    action: 'updated ticket #TCK-118',
    timestamp: '2 hours ago',
    type: 'ticket'
  },
  {
    id: '5',
    user: 'Admin',
    action: 'created new department "DevOps"',
    timestamp: '3 hours ago',
    type: 'system'
  },
];

// Mock Permissions
let mockPermissions: Permission[] = [
  { id: '1', label: 'Approve User Registrations', enabled: true },
  { id: '2', label: 'Create & Delete Tickets', enabled: true },
  { id: '3', label: 'Manage User Roles', enabled: true },
  { id: '4', label: 'Export System Reports', enabled: false },
  { id: '5', label: 'View Audit Logs', enabled: true },
  { id: '6', label: 'System Settings Access', enabled: false },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API Functions
export const adminMockApi = {
  // Get all users
  getUsers: async (): Promise<AdminUser[]> => {
    await delay(300);
    return [...mockUsers];
  },

  // Get statistics
  getStats: async (): Promise<AdminStats> => {
    await delay(300);
    return {
      totalUsers: mockUsers.length,
      totalTickets: 48,
      pendingApprovals: mockUsers.filter(u => u.status === 'waitlisted').length,
    };
  },

  // Get activity logs
  getActivityLogs: async (): Promise<ActivityLog[]> => {
    await delay(300);
    return [...mockActivityLogs];
  },

  // Get permissions
  getPermissions: async (): Promise<Permission[]> => {
    await delay(300);
    return [...mockPermissions];
  },

  // Toggle user status
  toggleUserStatus: async (userId: string): Promise<AdminUser> => {
    await delay(300);
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');

    const user = mockUsers[userIndex];
    user.status = user.status === 'active' ? 'waitlisted' : 'active';
    mockUsers[userIndex] = user;

    // Add activity log
    const actionText = user.status === 'active' 
      ? `approved user registration for ${user.fullName}`
      : `set ${user.fullName} to waitlisted`;
    
    mockActivityLogs.unshift({
      id: Date.now().toString(),
      user: 'Admin User',
      action: actionText,
      timestamp: 'Just now',
      type: 'user',
    });

    return { ...user };
  },

  // Toggle permission
  togglePermission: async (permissionId: string): Promise<Permission> => {
    await delay(300);
    const permIndex = mockPermissions.findIndex(p => p.id === permissionId);
    if (permIndex === -1) throw new Error('Permission not found');

    mockPermissions[permIndex].enabled = !mockPermissions[permIndex].enabled;
    
    // Add activity log
    mockActivityLogs.unshift({
      id: Date.now().toString(),
      user: 'Admin User',
      action: `${mockPermissions[permIndex].enabled ? 'enabled' : 'disabled'} permission: ${mockPermissions[permIndex].label}`,
      timestamp: 'Just now',
      type: 'system',
    });

    return { ...mockPermissions[permIndex] };
  },

  // Add user
  addUser: async (userData: Omit<AdminUser, 'id' | 'registrationDate' | 'status'>): Promise<AdminUser> => {
    await delay(300);
    const newUser: AdminUser = {
      ...userData,
      id: Date.now().toString(),
      status: 'waitlisted',
      registrationDate: new Date().toISOString().split('T')[0],
    };
    mockUsers.push(newUser);

    // Add activity log
    mockActivityLogs.unshift({
      id: Date.now().toString(),
      user: 'Admin User',
      action: `added new user: ${newUser.fullName}`,
      timestamp: 'Just now',
      type: 'user',
    });

    return newUser;
  },

  // Add department
  addDepartment: async (departmentName: string): Promise<void> => {
    await delay(300);
    // Add activity log
    mockActivityLogs.unshift({
      id: Date.now().toString(),
      user: 'Admin User',
      action: `created new department: ${departmentName}`,
      timestamp: 'Just now',
      type: 'system',
    });
  },

  // Edit user
  editUser: async (userId: string, userData: {
    fullName: string;
    email: string;
    department: string;
    position: string;
  }): Promise<AdminUser> => {
    await delay(300);
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');

    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...userData,
    };

    // Add activity log
    mockActivityLogs.unshift({
      id: Date.now().toString(),
      user: 'Admin User',
      action: `updated user information for ${userData.fullName}`,
      timestamp: 'Just now',
      type: 'user',
    });

    return { ...mockUsers[userIndex] };
  },

  // Change user role
  changeUserRole: async (userId: string, newRole: 'admin' | 'user'): Promise<AdminUser> => {
    await delay(300);
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');

    const oldRole = mockUsers[userIndex].role;
    mockUsers[userIndex].role = newRole;

    // Add activity log
    mockActivityLogs.unshift({
      id: Date.now().toString(),
      user: 'Admin User',
      action: `changed ${mockUsers[userIndex].fullName}'s role from ${oldRole} to ${newRole}`,
      timestamp: 'Just now',
      type: 'user',
    });

    return { ...mockUsers[userIndex] };
  },

  // Delete user
  deleteUser: async (userId: string): Promise<void> => {
    await delay(300);
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');

    const userName = mockUsers[userIndex].fullName;
    mockUsers = mockUsers.filter(u => u.id !== userId);

    // Add activity log
    mockActivityLogs.unshift({
      id: Date.now().toString(),
      user: 'Admin User',
      action: `deleted user: ${userName}`,
      timestamp: 'Just now',
      type: 'user',
    });
  },
};