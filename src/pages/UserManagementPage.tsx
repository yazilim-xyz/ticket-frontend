import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layouts/Sidebar';
import { useTheme } from '../context/ThemeContext';
import { adminService, AdminUser } from '../services/adminService';
import AddUserModal from '../components/modals/AddUserModal';
import AddDepartmentModal from '../components/modals/AddDepartmentModal';
import EditUserModal from '../components/modals/EditUserModal';
import ChangeRoleModal from '../components/modals/ChangeRoleModal';
import DeleteUserConfirmationModal from '../components/modals/DeleteUserConfirmationModal';
import UserActionsDropdown from '../components/dropdowns/UserActionsDropdown';
import Toast from '../components/ui/Toast';

// INTERFACES
interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const UserManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'waitlisted'>('all');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddDepartmentModalOpen, setIsAddDepartmentModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string; email: string } | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // TOAST HELPER
  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const id = Date.now();
    setToasts([]);
    setTimeout(() => {
      setToasts([{ id, message, type }]);
    }, 50);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await adminService.getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        showToast('Failed to load users. Please refresh the page.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // EVENT HANDLERS
  const handleToggleStatus = async (userId: string) => {
    try {
      const current = users.find(u => u.id === userId);
      const next = current?.status !== 'active'; // ON mu olacak?
       const updatedUser = await adminService.setUserApprovalStatus(userId, !!next);

      setUsers(users.map(u => u.id === userId ? updatedUser : u));
      showToast(
        `User ${updatedUser.status === 'active' ? 'approved' : 'set to waitlist'} successfully`,
        'success'
      );
    } catch (error: any) {
      console.error('Failed to toggle status:', error);

      // Parse backend error
      let errorMessage = 'Failed to update user status';
      if (error?.message?.includes('404')) {
        errorMessage = 'User not found';
      } else if (error?.message?.includes('403')) {
      errorMessage = 'You do not have permission to change user status';
      } else if (error?.message?.includes('500')) {
        errorMessage = 'Server error. Please try again later';
      } else if (error?.message) {
        errorMessage = error.message;
      }
    
      showToast(errorMessage, 'error');
    }

  };
  
  const handleAddUser = async (userData: {
    fullName: string;
    email: string;
    password: string;
    department: string;
    position: string;
    role: 'admin' | 'user';
  }) => {
    try {
      const newUser = await adminService.addUser(userData);
      setUsers([...users, newUser]);
      setIsAddUserModalOpen(false);
      showToast(`User "${userData.fullName}" created successfully`, 'success');
    } catch (error: any) {
      console.error('Failed to add user:', error);

      // Parse backend error
      let errorMessage = 'Failed to create user';
      
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        errorMessage = `Email "${userData.email}" is already registered`;
      } else if (error.message.includes('400')) {
        errorMessage = 'Invalid user data. Please check all fields';
      } else if (error.message.includes('403')) {
        errorMessage = 'You do not have permission to create users';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error. Please try again later';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, 'error');
      // Modal açık kalır - kullanıcı düzeltme yapabilir
    }
  };

  const handleAddDepartment = async (departmentName: string) => {
    try {
      await adminService.addDepartment(departmentName);
      setIsAddDepartmentModalOpen(false);
      showToast(`Department "${departmentName}" created successfully`, 'success');
    } catch (error: any) {
      console.error('Failed to add department:', error);

      let errorMessage = 'Failed to create department';
      if (error.message.includes('already exists')) {
        errorMessage = `Department "${departmentName}" already exists`;
      }
      
      showToast(errorMessage, 'error');
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
        const updatedUser = await adminService.editUser(userId, userData);
        setUsers(users.map(u => u.id === userId ? updatedUser : u));
        setIsEditUserModalOpen(false);
        showToast(`User "${userData.fullName}" updated successfully`, 'success');
    } catch (error: any) {
        console.error('Failed to edit user:', error);
        let errorMessage = 'Failed to update user';
        if (error.message.includes('404')) {
          errorMessage = 'User not found';
        } else if (error.message.includes('403')) {
          errorMessage = 'You do not have permission to edit this user';
        }
      
      showToast(errorMessage, 'error');
    }
  };

  const handleChangeRole = (user: AdminUser) => { // userId yerine user
    setSelectedUser(user);
    setIsChangeRoleModalOpen(true);
  };

  const handleChangeRoleSubmit = async (userId: string, newRole: 'admin' | 'user') => {
    try {
        const updatedUser = await adminService.changeUserRole(userId, newRole);
        setUsers(users.map(u => u.id === userId ? updatedUser : u));
        setIsChangeRoleModalOpen(false);
        showToast(`User role changed to "${newRole}" successfully`, 'success');
    } catch (error: any) {
        console.error('Failed to change role:', error);
        let errorMessage = 'Failed to change user role';
        if (error.message.includes('403')) {
          errorMessage = 'You do not have permission to change user roles';
        }
      
        showToast(errorMessage, 'error');
      }
    };

  const handleDeleteUser = (userId: string, userName: string, userEmail: string) => {
   setUserToDelete({ id: userId, name: userName, email: userEmail });
   setIsDeleteUserModalOpen(true);
 };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await adminService.deleteUser(userToDelete.id);

      // Listeden kaldır (backend'den tekrar fetch etmeden)
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setUserToDelete(null);
      setIsDeleteUserModalOpen(false);

      //  Success toast
      showToast(`User "${userToDelete.name}" deleted successfully`, 'success');
    
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      setIsDeleteUserModalOpen(false);

      // Hata mesajını parse et
      let errorMessage = 'Failed to delete user';
    
      if (error?.message?.includes('404')) {
        errorMessage = 'User not found';
      } else if (error?.message?.includes('403')) {
        errorMessage = 'You do not have permission to delete this user';
      } else if (error?.message?.includes('500')) {
        errorMessage = 'Server error. Please try again later';
      } else if (error?.message) {
        errorMessage = error.message;
      }
    
      showToast(errorMessage, 'error');
    }
  };

  const scrollToUserManagementTable = () => {
    const element = document.getElementById('user-management-table');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // FILTERING
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.position.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // STYLING HELPERS
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

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar isDarkMode={isDarkMode}  />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className={`px-8 py-6 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h1 className="text-cyan-800 text-2xl font-semibold font-['Inter'] leading-9 mb-3">
              User Management
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
        <div className="flex-1 overflow-y-auto px-6 py-3">
          {/* User Table Section */}
          <div id="user-management-table" className={`rounded-xl border mb-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            {/* Section Header */}
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  All Users
                </h2>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New User
                  </button>
                  <button 
                    onClick={() => setIsAddDepartmentModalOpen(true)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Department
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
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                                </div>
                            ) : (
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
                                            Access Status
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
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4 ${
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
                                              <div className="flex items-center justify-center">
                                                {user.registrationDate}
                                              </div>
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
                            )}

                            {!isLoading && filteredUsers.length === 0 && (
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
                onClick={scrollToUserManagementTable}
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

              {/* View Activity Log */}
              <button 
                onClick={() => navigate('/activity-log')}
                className={`p-6 rounded-xl border transition-all hover:shadow-lg hover:border-teal-500/50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className={`text-base font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  View Activity Log
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  See all system activities
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

        <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
            duration={5000}
          />
        ))}
      </div>
    </div>
  );
};

export default UserManagementPage;