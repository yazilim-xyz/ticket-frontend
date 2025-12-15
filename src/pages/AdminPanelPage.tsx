import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layouts/Sidebar';
import { useTheme } from '../context/ThemeContext';
import { usePermissions } from '../context/PermissionsContext';
import { adminMockApi, AdminStats, AdminUser, ActivityLog, Permission } from '../services/adminMockApi';
import AddUserModal from '../components/modals/AddUserModal';
import AddDepartmentModal from '../components/modals/AddDepartmentModal';
import EditUserModal from '../components/modals/EditUserModal';
import ChangeRoleModal from '../components/modals/ChangeRoleModal';
import DeleteUserConfirmationModal from '../components/modals/DeleteUserConfirmationModal';
import UserActionsDropdown from '../components/dropdowns/UserActionsDropdown';

const AdminPanelPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalTickets: 0,
    pendingApprovals: 0,
  });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'waitlisted'>('all');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddDepartmentModalOpen, setIsAddDepartmentModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const { refreshPermissions } = usePermissions();
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string; email: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, usersData, logsData, permissionsData] = await Promise.all([
          adminMockApi.getStats(),
          adminMockApi.getUsers(),
          adminMockApi.getActivityLogs(),
          adminMockApi.getPermissions(),
        ]);
        setStats(statsData);
        setUsers(usersData);
        setActivityLogs(logsData);
        setPermissions(permissionsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleStatus = async (userId: string) => {
    try {
      const updatedUser = await adminMockApi.toggleUserStatus(userId);
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
      
      // Update stats and logs
      const [statsData, logsData] = await Promise.all([
        adminMockApi.getStats(),
        adminMockApi.getActivityLogs(),
      ]);
      setStats(statsData);
      setActivityLogs(logsData);
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleTogglePermission = async (permissionId: string) => {
    try {
      const updatedPermission = await adminMockApi.togglePermission(permissionId);
      setPermissions(permissions.map(p => p.id === permissionId ? updatedPermission : p));
      
      // Update logs
      const logsData = await adminMockApi.getActivityLogs();
      setActivityLogs(logsData);

      // Refresh global permissions
      await refreshPermissions();

    } catch (error) {
      console.error('Failed to toggle permission:', error);
    }
  };

  const handleAddUser = async (userData: {
    fullName: string;
    email: string;
    department: string;
    position: string;
    role: 'admin' | 'user';
  }) => {
    try {
      const newUser = await adminMockApi.addUser(userData);
      setUsers([...users, newUser]);
      
      // Update stats and logs
      const [statsData, logsData] = await Promise.all([
        adminMockApi.getStats(),
        adminMockApi.getActivityLogs(),
      ]);
      setStats(statsData);
      setActivityLogs(logsData);
      setIsAddUserModalOpen(false);
    } catch (error) {
      console.error('Failed to add user:', error);
    }
  };

  const handleAddDepartment = async (departmentName: string) => {
    try {
      await adminMockApi.addDepartment(departmentName);
      
      // Update logs
      const logsData = await adminMockApi.getActivityLogs();
      setActivityLogs(logsData);
      setIsAddDepartmentModalOpen(false);
    } catch (error) {
      console.error('Failed to add department:', error);
    }
  };

  const handleEditUser = (user: AdminUser) => { 
    setSelectedUser(user);
    setIsEditUserModalOpen(true);
  };

    const handleEditUserSubmit = async (userId: string, userData: {
        fullName: string;
        email: string;
            department: string;
        position: string;
    }) => {
    try {
        const updatedUser = await adminMockApi.editUser(userId, userData);
        setUsers(users.map(u => u.id === userId ? updatedUser : u));
    
        const logsData = await adminMockApi.getActivityLogs();
        setActivityLogs(logsData);
        setIsEditUserModalOpen(false);
    } catch (error) {
        console.error('Failed to edit user:', error);
    }
  };

  const handleChangeRole = (user: AdminUser) => { // userId yerine user
    setSelectedUser(user);
    setIsChangeRoleModalOpen(true);
  };

  const handleChangeRoleSubmit = async (userId: string, newRole: 'admin' | 'user') => {
    try {
        const updatedUser = await adminMockApi.changeUserRole(userId, newRole);
        setUsers(users.map(u => u.id === userId ? updatedUser : u));
    
        const logsData = await adminMockApi.getActivityLogs();
        setActivityLogs(logsData);
        setIsChangeRoleModalOpen(false);
    } catch (error) {
        console.error('Failed to change role:', error);
    }
    };

  const handleDeleteUser = (userId: string, userName: string, userEmail: string) => {
   setUserToDelete({ id: userId, name: userName, email: userEmail });
   setIsDeleteUserModalOpen(true);
 };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await adminMockApi.deleteUser(userToDelete.id);
      const updatedUsers = await adminMockApi.getUsers();
      setUsers(updatedUsers);
    
      const statsData = await adminMockApi.getStats();
      setStats(statsData);
    
      const logsData = await adminMockApi.getActivityLogs();
      setActivityLogs(logsData);
    
      setUserToDelete(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const scrollToUserManagement = () => {
    const element = document.getElementById('user-management');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.position.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeClass = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      return isDarkMode 
        ? 'bg-red-900/30 text-red-400 border-red-700' 
        : 'bg-red-100 text-red-700 border-red-200';
    }
    return isDarkMode 
      ? 'bg-green-900/30 text-green-400 border-green-700' 
      : 'bg-green-100 text-green-700 border-green-200';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ticket':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'user':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'system':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar isDarkMode={isDarkMode}  />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className={`px-8 py-6 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h1 className="text-cyan-800 text-2xl font-semibold font-['Inter'] leading-9 mb-3">
              Admin Panel
            </h1>           

            {/* Theme Toggle */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-600' : 'text-yellow-500'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
                {!isDarkMode && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              
              <button onClick={toggleTheme} className="relative w-14 h-7 rounded-full transition-colors duration-300 bg-cyan-500" aria-label="Toggle theme">
                <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
              
              <div className="relative">
                <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-blue-400' : 'text-gray-800'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
                {isDarkMode && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* Statistics Cards */}
          {isLoading ? (
            <div className="grid grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6 mb-8">
              {/* Total Users Card */}
              <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {stats.totalUsers}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total Users
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                    <svg className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Tickets Card */}
              <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {stats.totalTickets}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total Tickets <span className="text-xs">(This Month)</span>
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'}`}>
                    <svg className={`w-6 h-6 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Pending Approvals Card */}
              <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {stats.pendingApprovals}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Pending Approvals
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-100'}`}>
                    <svg className={`w-6 h-6 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Management Section */}
          <div id="user-management" className={`rounded-xl border mb-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            {/* Section Header */}
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  User Management
                </h2>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add new user
                  </button>
                  <button 
                    onClick={() => setIsAddDepartmentModalOpen(true)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add new department
                  </button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="flex-1 relative">
                  <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500' 
                        : 'bg-white border-gray-300 text-gray-700 placeholder-gray-400'
                    }`}
                  />
                </div>

                {/* Role Filter */}
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as any)}
                  className={`px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className={`px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="waitlisted">Waitlisted</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Full Name
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Email
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Department
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Position
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Role
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Approval Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Registration Date
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className={`transition-colors ${isDarkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}`}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {user.fullName}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {user.email}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className={`px-2 py-1 rounded-md text-xs ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          {user.department}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {user.position}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm`}>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getRoleBadgeClass(user.role)}`}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm`}>
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            user.status === 'active' 
                              ? 'bg-teal-600' 
                              : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                          }`}
                          title={user.status === 'active' ? 'Approved - Click to set waitlisted' : 'Waitlisted - Click to approve'}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              user.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {user.registrationDate}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm`}>
                        <UserActionsDropdown
                          userId={user.id}
                          userName={user.fullName}
                          userEmail={user.email}
                          userStatus={user.status}
                          onEdit={() => handleEditUser(user)}
                          onChangeRole={() => handleChangeRole(user)}
                          onToggleStatus={() => handleToggleStatus(user.id)}
                          onDelete={() => handleDeleteUser(user.id, user.fullName, user.email)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No users found matching your criteria.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="mb-8">
            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              Quick Actions
            </h2>
            <div className="grid grid-cols-3 gap-6">
              {/* Add New User */}
              <button 
                onClick={() => setIsAddUserModalOpen(true)}
                className={`p-6 rounded-xl border transition-all hover:shadow-lg hover:border-teal-500/50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'}`}>
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h3 className={`text-base font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  Add New User
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Create new user account
                </p>
              </button>

              {/* Approve Registrations */}
              <button 
                onClick={scrollToUserManagement}
                className={`p-6 rounded-xl border transition-all hover:shadow-lg hover:border-teal-500/50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className={`text-base font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  Approve Registrations
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage user approvals
                </p>
              </button>

              {/* Export Reports */}
              <button 
                onClick={() => navigate('/excel-reports')}
                className={`p-6 rounded-xl border transition-all hover:shadow-lg hover:border-teal-500/50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className={`text-base font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  Export Reports
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Download system reports
                </p>
              </button>

              {/* Create Ticket */}
              <button 
                onClick={() => navigate('/create-ticket')}
                className={`p-6 rounded-xl border transition-all hover:shadow-lg hover:border-teal-500/50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className={`text-base font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  Create Ticket
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Create a new support ticket
                </p>
              </button>

              {/* View All Tickets */}
              <button 
                onClick={() => navigate('/all-tickets')}
                className={`p-6 rounded-xl border transition-all hover:shadow-lg hover:border-teal-500/50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${isDarkMode ? 'bg-cyan-900/30' : 'bg-cyan-100'}`}>
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className={`text-base font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  View All Tickets
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Browse all support tickets
                </p>
              </button>

              {/* System Settings */}
              <button 
                onClick={() => navigate('/settings')}
                className={`p-6 rounded-xl border transition-all hover:shadow-lg hover:border-teal-500/50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className={`text-base font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  System Settings
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Configure system settings
                </p>
              </button>
            </div>
          </div>

          {/* Recent Activity & Permission Settings */}
          <div className="grid grid-cols-2 gap-6">
            {/* Recent Activity Log */}
            <div className={`rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  Recent Activity
                </h2>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        log.type === 'ticket' 
                          ? isDarkMode ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-100 text-teal-600'
                          : log.type === 'user'
                          ? isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
                          : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {getActivityIcon(log.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <span className="font-medium">{log.user}</span> {log.action}
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {log.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Permission Settings */}
            <div className={`rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  Permission Settings
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center justify-between">
                      <label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {permission.label}
                      </label>
                      <button
                        onClick={() => handleTogglePermission(permission.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          permission.enabled 
                            ? 'bg-teal-600' 
                            : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            permission.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSubmit={handleAddUser}
      />
      <AddDepartmentModal
        isOpen={isAddDepartmentModalOpen}
        onClose={() => setIsAddDepartmentModalOpen(false)}
        onSubmit={handleAddDepartment}
      />
      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        onSubmit={handleEditUserSubmit}
        user={selectedUser}
      />
      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <DeleteUserConfirmationModal
          isOpen={isDeleteUserModalOpen}
          onClose={() => {
            setIsDeleteUserModalOpen(false);
            setUserToDelete(null);
          }}
          onConfirm={handleConfirmDeleteUser}
          isDarkMode={isDarkMode}
          userName={userToDelete.name}
          userEmail={userToDelete.email}
        />
      )}
      <ChangeRoleModal
        isOpen={isChangeRoleModalOpen}
        onClose={() => setIsChangeRoleModalOpen(false)}
        onSubmit={handleChangeRoleSubmit}
        user={selectedUser}
       />
    </div>
  );
};

export default AdminPanelPage;