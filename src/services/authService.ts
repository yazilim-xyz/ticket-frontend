import { RegisterData, LoginCredentials, AuthResponse } from '../types';

// Mock kullanıcı veritabanı (geçici)
const mockUsers: any[] = [];

// Mock API delay simülasyonu
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  // Register (Kayıt)
  register: async (data: RegisterData): Promise<AuthResponse> => {
    await delay(1000); // 1 saniye bekle (API simülasyonu)

    // Email zaten kayıtlı mı kontrol et
    const existingUser = mockUsers.find(u => u.email === data.email);
    if (existingUser) {
      throw new Error('This email is already registered');
    }

    // Password validation
    if (!data.password || data.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Yeni kullanıcı oluştur
    const newUser = {
      id: `user_${Date.now()}`,
      fullName: data.fullName,
      email: data.email,
      department: data.department,
      password: data.password, // Password kaydedildi (gerçek uygulamada hash'lenecek)
      role: 'user' as const,
      createdAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);

    // Mock token oluştur
    const token = `mock_token_${newUser.id}`;

    console.log('User registered:', { ...newUser, password: '***hidden***' });
    console.log('Total users:', mockUsers.length);

    return {
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        department: newUser.department,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
      token,
    };
  },

  // Login (Giriş)
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    await delay(1000); // 1 saniye bekle

    // Kullanıcıyı bul
    const user = mockUsers.find(u => u.email === credentials.email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Password kontrolü
    if (user.password !== credentials.password) {
      throw new Error('Invalid email or password');
    }

    // Mock token oluştur
    const token = `mock_token_${user.id}`;

    console.log('User logged in:', { ...user, password: '***hidden***' });

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        department: user.department,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    };
  },

  // Logout (Çıkış)
  logout: async (): Promise<void> => {
    await delay(500);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('User logged out');
  },

  // Token'ı kaydet
  saveAuth: (auth: AuthResponse): void => {
    localStorage.setItem('token', auth.token);
    localStorage.setItem('user', JSON.stringify(auth.user));
  },

  // Token'ı al
  getAuth: (): AuthResponse | null => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) return null;

    return {
      token,
      user: JSON.parse(userStr),
    };
  },
};