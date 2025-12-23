const API_BASE_URL = "http://localhost:8081/api";

export interface AIChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: AIChatMessage[];
}

// Backend'e mesaj gönder ve Gemini'den cevap al
export const sendMessageToBackend = async (message: string): Promise<string> => {
  const token = localStorage.getItem("accessToken");
  
  const response = await fetch(`${API_BASE_URL}/chatbot/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  // Backend response: { message: "user message", response: "gemini response" }
  return data.response;
};

// In-memory session yönetimi (sayfa yenilenince sıfırlanır)
class ChatbotSessionManager {
  private sessions: ChatSession[] = [];
  private currentSessionId: string | null = null;

  getSessions(): ChatSession[] {
    return this.sessions;
  }

  getCurrentSession(): ChatSession | null {
    if (!this.currentSessionId) return null;
    return this.sessions.find((s) => s.id === this.currentSessionId) || null;
  }

  createSession(firstMessage?: string): ChatSession {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: firstMessage ? firstMessage.substring(0, 30) + (firstMessage.length > 30 ? "..." : "") : "New Chat",
      messages: [],
    };
    this.sessions.unshift(newSession);
    this.currentSessionId = newSession.id;
    return newSession;
  }

  setCurrentSession(sessionId: string): ChatSession | null {
    const session = this.sessions.find((s) => s.id === sessionId);
    if (session) {
      this.currentSessionId = sessionId;
      return session;
    }
    return null;
  }

  addMessage(sessionId: string, message: AIChatMessage): void {
    const session = this.sessions.find((s) => s.id === sessionId);
    if (session) {
      session.messages.push(message);
      // İlk mesajsa title'ı güncelle
      if (session.messages.length === 1 && message.sender === "user") {
        session.title = message.text.substring(0, 30) + (message.text.length > 30 ? "..." : "");
      }
    }
  }

  deleteSession(sessionId: string): boolean {
    const index = this.sessions.findIndex((s) => s.id === sessionId);
    if (index !== -1) {
      this.sessions.splice(index, 1);
      if (this.currentSessionId === sessionId) {
        this.currentSessionId = null;
      }
      return true;
    }
    return false;
  }

  getSessionMessages(sessionId: string): AIChatMessage[] {
    const session = this.sessions.find((s) => s.id === sessionId);
    return session ? session.messages : [];
  }
}

export const sessionManager = new ChatbotSessionManager();