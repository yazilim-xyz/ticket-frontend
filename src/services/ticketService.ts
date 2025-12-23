import type { Ticket } from "../types";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8081";

function getAuthToken(): string | null {
  return localStorage.getItem("accessToken");
}

async function readErrorText(res: Response): Promise<string> {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  const text = await res.text().catch(() => "");
  if (!text) return `HTTP ${res.status}`;

  if (isJson) {
    try {
      const j = JSON.parse(text);
      return j.message || j.error || j.detail || text;
    } catch {
      return text;
    }
  }

  return text;
}

/**
 * Auth'lu fetch:
 * - Authorization: Bearer <token> ekler
 * - JSON ise Content-Type ekler (FormData ise eklemez)
 * - res.ok değilse detaylı hata fırlatır
 */
async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();

  const headers = new Headers(options.headers);

  // FormData değilse JSON varsay (ve Content-Type yoksa ekle)
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  // Hataları tek yerden yönetelim
  if (!res.ok) {
    throw new Error(await readErrorText(res));
  }

  return res;
}

// ============================================
// TICKET SERVICE
// ============================================

class TicketService {
  /* =======================
     GET ALL / USER TICKETS
  ======================= */
  async getTickets(userId?: string): Promise<Ticket[]> {
    const url = userId
      ? `${API_BASE_URL}/api/tickets?userId=${encodeURIComponent(userId)}`
      : `${API_BASE_URL}/api/tickets`;

    const res = await authenticatedFetch(url, { method: "GET" });
    return res.json();
  }

  /* =======================
     GET TICKET BY ID
  ======================= */
  async getTicketById(id: string): Promise<Ticket> {
    const url = `${API_BASE_URL}/api/tickets/${encodeURIComponent(id)}`;
    const res = await authenticatedFetch(url, { method: "GET" });
    return res.json();
  }

  /* =======================
     CREATE TICKET
     ✅ createdById kaldırıldı (JWT’den gelecek)
  ======================= */
  async createTicket(payload: {
    title: string;
    description: string;
    priority: "HIGH" | "MEDIUM" | "LOW" | "CRITICAL";
    category?: "BUG" | "FEATURE" | "SUPPORT" | "OTHER";
  }): Promise<Ticket> {
    const url = `${API_BASE_URL}/api/tickets`;
    const res = await authenticatedFetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.json();
  }
    /* =======================
     ASSIGN TICKET
     PATCH /api/tickets/{id}/assign
  ======================= */
  async assignTicket(id: string, assignedToId: number): Promise<Ticket> {
    const url = `${API_BASE_URL}/api/tickets/${encodeURIComponent(id)}/assign`;
    const res = await authenticatedFetch(url, {
      method: "PATCH",
      body: JSON.stringify({ assignedToId }),
    });
    return res.json();
  }

  /* =======================
     GET ALL USERS (Dropdown için)
  ======================= */
  async getUsers(): Promise<{ id: number; fullName: string; role?: string }[]> {
    const url = `${API_BASE_URL}/api/users`; // Backend endpoint'in neyse onu yaz (örn: /api/users veya /api/auth/users)
    const res = await authenticatedFetch(url, { method: "GET" });
    return res.json();
  }

  /* =======================
     UPDATE TICKET
  ======================= */
 async updateTicket(id: string, data: Partial<Ticket>): Promise<any> {

  // 1️⃣ STATUS UPDATE → PATCH /{id}/status
  if (data.status) {
    const url = `${API_BASE_URL}/api/tickets/${encodeURIComponent(id)}/status`;

    const res = await authenticatedFetch(url, {
      method: "PATCH",
      body: JSON.stringify({
        status: String(data.status).toUpperCase(),
      }),
    });

    return res.json();
  }

  // 2️⃣ ASSIGN UPDATE → PATCH /{id}/assign (ileride)
  if (data.assignedTo || data.assignee || data.owner) {
    const url = `${API_BASE_URL}/api/tickets/${encodeURIComponent(id)}/assign`;

    const assignedToId =
      (data as any).assignedToId ??
      (data as any).assignedTo ??
      (data as any).assignee?.id ??
      (data as any).owner?.id;

    const res = await authenticatedFetch(url, {
      method: "PATCH",
      body: JSON.stringify({ assignedToId }),
    });

    return res.json();
  }

  throw new Error("Bu update işlemi için backend endpoint henüz yok.");
}


  /* =======
  ================
     DELETE TICKET
  ======================= */
  async deleteTicket(id: string): Promise<void> {
    const url = `${API_BASE_URL}/api/tickets/${encodeURIComponent(id)}`;
    await authenticatedFetch(url, { method: "DELETE" });
  }

  /* =======================
     PERFORMANCE STATS
  ======================= */
  async getPerformanceStats(): Promise<any> {
    const url = `${API_BASE_URL}/api/tickets/stats/performance`;
    const res = await authenticatedFetch(url, { method: "GET" });
    return res.json();
  }
}

export const ticketService = new TicketService();
export default ticketService;
