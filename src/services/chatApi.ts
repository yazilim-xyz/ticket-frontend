import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";

// Backend'den dönen ChatMessageResponseDto
export interface ChatMessageResponse {
  id: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  message: string;
  createdAt: string; 
}

// Backend'e gönderilen MessageDto
export interface MessageDto {
  receiverId: number;
  message: string;
}

// Frontend'de kullanılan ChatUser
export interface ChatUser {
  id: number;
  name: string;
  email?: string;
  lastMessageDate: string;
  lastMessage?: string;
  isOnline?: boolean;
}

// Frontend'de kullanılan ChatMessage
export interface ChatMessage {
  id: number;
  sender: "me" | "other";
  senderId: number;
  senderName: string;
  text: string;
  createdAt: string;
}

// Login Response
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    role: string;
  };
}


const API_BASE_URL = "http://localhost:8081"; // Backend URL
const WS_URL = `${API_BASE_URL}/ws`; // WebSocket endpoint


// FIX: localStorage -> sessionStorage
export const getToken = (): string | null => {
  return sessionStorage.getItem("accessToken");
};

// FIX: localStorage -> sessionStorage
export const getCurrentUserId = (): number => {
  const userId = sessionStorage.getItem("userId");
  if (userId) return parseInt(userId, 10);

  // Token'dan decode et
  const token = getToken();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId || payload.id || payload.sub;
    } catch (e) {
      console.error("Token decode error:", e);
    }
  }
  return 0;
};

// FIX: localStorage -> sessionStorage
export const getCurrentUser = () => {
  const userStr = sessionStorage.getItem("user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const chatApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data: LoginResponse = await response.json();

    // FIX: localStorage -> sessionStorage
    sessionStorage.setItem("accessToken", data.accessToken);
    sessionStorage.setItem("refreshToken", data.refreshToken);
    sessionStorage.setItem("userId", data.user.id.toString());
    sessionStorage.setItem("user", JSON.stringify(data.user));

    return data;
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
    } finally {
      // FIX: localStorage -> sessionStorage
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("user");
    }
  },

  async getMessages(otherUserId: number): Promise<ChatMessage[]> {
    const response = await fetch(`${API_BASE_URL}/api/messages/${otherUserId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      throw new Error("Failed to fetch messages");
    }

    const data: ChatMessageResponse[] = await response.json();
    const currentUserId = getCurrentUserId();

    // Backend response'u frontend formatına dönüştür
    return data.map((msg) => ({
      id: msg.id,
      sender: msg.senderId === currentUserId ? "me" : "other",
      senderId: msg.senderId,
      senderName: msg.senderName,
      text: msg.message,
      createdAt: msg.createdAt,
    }));
  },

  // FIX: /api/admin/users -> /api/users (user-controller endpoint'i)
  async getAllUsers(): Promise<ChatUser[]> {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const data = await response.json();
    const currentUserId = getCurrentUserId();
    
    // Backend response array veya paginated olabilir
    const users = data.content || data;

    return users
      .filter((user: any) => user.id !== currentUserId)
      .map((user: any) => ({
        id: user.id,
        name: user.fullName || `${user.name ?? ""} ${user.surname ?? ""}`.trim(),
        email: user.email,
        lastMessageDate: "",
        isOnline: user.active,
      }));
  },
};


type MessageCallback = (message: ChatMessage) => void;

class WebSocketService {
  private client: Client | null = null;
  private messageCallbacks: MessageCallback[] = [];
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const token = getToken();

      if (!token) {
        reject(new Error("No auth token"));
        return;
      }

      // STOMP client oluştur
      this.client = new Client({
        // SockJS factory
        webSocketFactory: () => new SockJS(WS_URL),

        // Bağlantı header'ları (JWT token)
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        // Debug logları
        debug: (str) => {
          if (process.env.NODE_ENV === "development") {
            console.log("[STOMP]", str);
          }
        },

        // Reconnect ayarları
        reconnectDelay: 5000,

        // Heartbeat
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      // Bağlantı başarılı
      this.client.onConnect = () => {
        console.log("✅ WebSocket connected!");
        this.isConnected = true;
        this.reconnectAttempts = 0;

        this.client?.subscribe("/user/queue/messages", (message: IMessage) => {
          const data: ChatMessageResponse = JSON.parse(message.body);
          const currentUserId = getCurrentUserId();

          const chatMessage: ChatMessage = {
            id: data.id,
            sender: data.senderId === currentUserId ? "me" : "other",
            senderId: data.senderId,
            senderName: data.senderName,
            text: data.message,
            createdAt: data.createdAt,
          };

          // Tüm callback'leri çağır
          this.messageCallbacks.forEach((cb) => cb(chatMessage));
        });

        resolve();
      };

      // Bağlantı hatası
      this.client.onStompError = (frame) => {
        console.error("❌ STOMP error:", frame.headers["message"]);
        reject(new Error(frame.headers["message"]));
      };

      // WebSocket kapandı
      this.client.onWebSocketClose = () => {
        console.log("🔌 WebSocket disconnected");
        this.isConnected = false;
      };

      // Bağlantıyı başlat
      this.client.activate();
    });
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
      this.messageCallbacks = [];
    }
  }

  sendMessage(receiverId: number, message: string): void {
    if (!this.client || !this.isConnected) {
      throw new Error("WebSocket not connected");
    }

    const messageDto: MessageDto = {
      receiverId,
      message,
    };

    this.client.publish({
      destination: "/app/chat",
      body: JSON.stringify(messageDto),
    });
  }

  onMessage(callback: MessageCallback): () => void {
    this.messageCallbacks.push(callback);

    return () => {
      this.messageCallbacks = this.messageCallbacks.filter((cb) => cb !== callback);
    };
  }

  
  get connected(): boolean {
    return this.isConnected;
  }
}

export const wsService = new WebSocketService();


export function formatDate(isoString: string): string {
  if (!isoString) return "";

  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Şimdi";
  if (diffMins < 60) return `${diffMins} dk önce`;
  if (diffHours < 24) {
    return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Dün";
  if (diffDays < 7) {
    return date.toLocaleDateString("tr-TR", { weekday: "short" });
  }
  return date.toLocaleDateString("tr-TR", { month: "short", day: "numeric" });
}

export function formatMessageTime(isoString: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

export default chatApi;