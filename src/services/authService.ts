const API_BASE_URL = "http://localhost:8081";

export interface RegisterData {
  Name: string;
  Surname: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  Name: string;
  Surname: string;
  email: string;
  role: string;
}

// Backend Login Response (flat yapı, "token" kullanıyor)
export interface LoginResponse {
  id: number;
  Name: string;
  Surname: string;
  email: string;
  role: string;
  token: string;
  refreshToken: string;
}

// Backend Register Response
export interface RegisterResponse {
  id: number;
  Name: string;
  Surname: string;
  email: string;
  role: string;
}

export const authService = {
  /**
   * Register (Kayıt)
   * POST /auth/register
   */
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.Name,
        surname: data.Surname,
        email: data.email,
        password: data.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 409 || errorData.message?.includes("already")) {
        throw new Error("This email is already registered");
      }
      if (response.status === 400) {
        throw new Error(errorData.message || "Invalid registration data");
      }
      throw new Error(errorData.message || "Registration failed");
    }

    return await response.json();
  },

  /**
   * Login (Giriş)
   * POST /auth/login
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        throw new Error("Invalid email or password");
      }
      if (response.status === 403) {
        throw new Error("Account is disabled. Please contact administrator.");
      }
      throw new Error(errorData.message || "Login failed");
    }

    const data: LoginResponse = await response.json();
    return data;
  },

  /**
   * Logout (Çıkış)
   * POST /auth/logout
   */
  logout: async (): Promise<void> => {
    const token = sessionStorage.getItem("accessToken");

    try {
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Her durumda local storage'ı temizle
      authService.clearAuth();
    }
  },

  /**
   * Refresh Token
   * POST /auth/refresh
   */
  refreshToken: async (): Promise<LoginResponse> => {
    const refreshToken = sessionStorage.getItem("refreshToken");

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: refreshToken,
      }),
    });

    if (!response.ok) {
      authService.clearAuth();
      throw new Error("Session expired. Please login again.");
    }

    const data: LoginResponse = await response.json();
    authService.saveAuth(data);
    return data;
  },

  /**
   * Auth bilgilerini kaydet
   * sessionStorage kullanıyoruz - tarayıcı/sekme kapanınca otomatik temizlenir
   */
  saveAuth: (auth: LoginResponse): void => {
    // Backend "token" olarak gönderiyor, biz "accessToken" olarak kaydediyoruz
    sessionStorage.setItem("accessToken", auth.token);
    sessionStorage.setItem("refreshToken", auth.refreshToken);
    sessionStorage.setItem("userId", auth.id.toString());
    
    // User objesini oluştur ve kaydet
    const user: User = {
      id: auth.id,
      Name: auth.Name,
      Surname: auth.Surname,
      email: auth.email,
      role: auth.role,
    };
    sessionStorage.setItem("user", JSON.stringify(user));
  },

  /**
   * Auth bilgilerini temizle
   */
  clearAuth: (): void => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("user");
  },

  /**
   * Mevcut auth bilgilerini al
   */
  getAuth: (): { token: string; user: User } | null => {
    const token = sessionStorage.getItem("accessToken");
    const userStr = sessionStorage.getItem("user");

    if (!token || !userStr) return null;

    try {
      return {
        token,
        user: JSON.parse(userStr),
      };
    } catch {
      return null;
    }
  },

  /**
   * Kullanıcı giriş yapmış mı?
   */
  isAuthenticated: (): boolean => {
    return !!sessionStorage.getItem("accessToken");
  },

  /**
   * Mevcut kullanıcıyı al
   */
  getCurrentUser: (): User | null => {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Access token'ı al
   */
  getAccessToken: (): string | null => {
    return sessionStorage.getItem("accessToken");
  },
};

export default authService;