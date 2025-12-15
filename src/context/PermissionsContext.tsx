import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminMockApi, Permission } from '../services/adminMockApi';

interface PermissionsContextType {
  permissions: Permission[];
  hasPermission: (permissionLabel: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const fetchPermissions = async () => {
    try {
      const perms = await adminMockApi.getPermissions();
      setPermissions(perms);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const hasPermission = (permissionLabel: string): boolean => {
    const permission = permissions.find(p => p.label === permissionLabel);
    return permission?.enabled ?? false;
  };

  const refreshPermissions = async () => {
    await fetchPermissions();
  };

  return (
    <PermissionsContext.Provider value={{ permissions, hasPermission, refreshPermissions }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionsProvider');
  }
  return context;
};