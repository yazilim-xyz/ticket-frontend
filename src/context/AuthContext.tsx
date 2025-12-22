import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, LoginResponse, LoginCredentials } from '../services/authService';



interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);


interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Uygulama başladığında localStorage'dan auth bilgilerini yükle
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const auth = authService.getAuth();
        if (auth) {
          setToken(auth.token);
          setUser(auth.user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login fonksiyonu
  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await authService.login(credentials);
    
    // Auth bilgilerini kaydet
    authService.saveAuth(response);
    
    // State'i güncelle
    setToken(response.token);
    setUser({
      id: response.id,
      Name: response.Name,
      Surname: response.Surname,
      email: response.email,
      role: response.role,
    });
    
    return response;
  };

  // Logout fonksiyonu
  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  // User bilgilerini güncelle (Settings sayfası için)
  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// USE AUTH HOOK
// ============================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;