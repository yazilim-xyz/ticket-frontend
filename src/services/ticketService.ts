import type { Ticket } from "../types";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8081";

function getAuthToken(): string | null {
  return sessionStorage.getItem("accessToken");
}

// Kullanıcı rolünü al
function getUserRole(): string | null {
  const userStr = sessionStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.role?.toUpperCase() || null;
    } catch {
      return null;
    }
  }
  return null;
}

// Admin mi kontrol et
function isAdmin(): boolean {
  return getUserRole() === 'ADMIN';
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
// ===========================
// BACKEND DTO TYPES
// ===========================
type TicketDto = {
  id: number | string;
  title: string;
  description: string;
  status: string;
  priority: string;

  // senin backend örneğinde bunlar var:
  ownerId?: number | null;
  ownerEmail?: string | null;

  assignedToId?: number | null;
  assignedToEmail?: string | null;

  createdAt: string;
  updatedAt: string;

  // backend varsa diğerleri:
  category?: string | null;
  dueDate?: string | null;
};

type PageDto<T> = { content: T[] } | T[];

// ===========================
// MAPPER (DTO -> Frontend Ticket)
// ===========================
function mapTicketDtoToTicket(dto: TicketDto): Ticket {
  const assignee =
    dto.assignedToEmail
      ? { firstName: dto.assignedToEmail, lastName: '' } // TicketTable bunu string gibi basacak
      : undefined;

  const owner =
    dto.ownerEmail
      ? { firstName: dto.ownerEmail, lastName: '' }
      : undefined;

  return {
    id: String(dto.id),
    title: dto.title,
    description: dto.description,
    category: dto.category ?? 'OTHER',
    priority: dto.priority as any,
    status: dto.status as any,

    // eski tiplerin bozulmaması için:
    assignedTo: dto.assignedToId ? String(dto.assignedToId) : '',
    createdBy: dto.ownerId ? String(dto.ownerId) : '',

    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    dueDate: dto.dueDate ?? '',

    // TicketTable artık buradan basacak:
    assignee,
    owner,

    attachments: [],
    email: dto.ownerEmail ?? '',
  };
}

function extractContent<T>(data: PageDto<T>): T[] {
  return Array.isArray(data) ? data : (data.content ?? []);
}

class TicketService {
  /* =======================
     GET ALL TICKETS
     Admin: GET /api/admin/tickets (tüm ticket'lar)
     User: GET /api/tickets (kendi ticket'ları)
  ======================= */
  async getTickets(userId?: string): Promise<Ticket[]> {
    // Role'e göre endpoint seç
    const endpoint = isAdmin() 
      ? `${API_BASE_URL}/api/admin/tickets`
      : `${API_BASE_URL}/api/tickets`;
    
    const url = userId
      ? `${endpoint}?userId=${encodeURIComponent(userId)}`
      : endpoint;

    console.log(`📋 Fetching tickets from: ${url} (isAdmin: ${isAdmin()})`);

    const res = await authenticatedFetch(url, { method: "GET" });
    const data = await res.json();
    
    // Backend paginated response döndürüyorsa content'i al
    const dtos = extractContent<TicketDto>(data);
    return dtos.map(mapTicketDtoToTicket);
    
  }

  /* =======================
     GET TICKET BY ID
     Admin: GET /api/admin/tickets/{id}
  ======================= */
  async getTicketById(id: string): Promise<Ticket> {
    const endpoint = `${API_BASE_URL}/api/admin/tickets/${encodeURIComponent(id)}`;
    const res = await authenticatedFetch(endpoint, { method: "GET" });
    const dto: TicketDto = await res.json();
    return mapTicketDtoToTicket(dto);
  }

  /* =======================
     CREATE TICKET
     Admin: POST /api/admin/tickets
     User: POST /api/tickets
  ======================= */
  async createTicket(payload: {
    title: string;
    description: string;
    priority: "HIGH" | "MEDIUM" | "LOW" | "CRITICAL";
    category?: "BUG" | "FEATURE" | "SUPPORT" | "OTHER";
  }): Promise<Ticket> {
    const endpoint = isAdmin()
      ? `${API_BASE_URL}/api/admin/tickets`
      : `${API_BASE_URL}/api/tickets`;
    
    const res = await authenticatedFetch(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    
    const dto: TicketDto = await res.json();
    return mapTicketDtoToTicket(dto);
  }

  /* =======================
     ASSIGN TICKET
     Admin: PATCH /api/admin/tickets/{id}/assign
     User: PATCH /api/tickets/{id}/assign
  ======================= */
  async assignTicket(id: string, assignedToId: number): Promise<Ticket> {
    const endpoint = isAdmin()
      ? `${API_BASE_URL}/api/admin/tickets/${encodeURIComponent(id)}/assign`
      : `${API_BASE_URL}/api/tickets/${encodeURIComponent(id)}/assign`;
    
    const res = await authenticatedFetch(endpoint, {
      method: "PATCH",
      body: JSON.stringify({ assignedToId }),
    });
    
    const dto: TicketDto = await res.json();
    return mapTicketDtoToTicket(dto);
  }

  /* =======================
     GET ALL USERS (Dropdown için)
     Admin endpoint kullan
  ======================= */
  async getUsers(): Promise<{ id: number; fullName: string; role?: string }[]> {
    const url = `${API_BASE_URL}/api/admin/users`;
    const res = await authenticatedFetch(url, { method: "GET" });
    const data = await res.json();
    return data.content || data;
  }

  /* =======================
     UPDATE TICKET STATUS
     Admin: PATCH /api/admin/tickets/{id}/status
     User: PATCH /api/tickets/{id}/status
  ======================= */
  async updateTicketStatus(id: string, status: string): Promise<any> {
    const endpoint = isAdmin()
      ? `${API_BASE_URL}/api/admin/tickets/${encodeURIComponent(id)}/status`
      : `${API_BASE_URL}/api/tickets/${encodeURIComponent(id)}/status`;

    const res = await authenticatedFetch(endpoint, {
      method: "PATCH",
      body: JSON.stringify({
        status: String(status).toUpperCase(),
      }),
    });

    return res.json();
  }

  /* =======================
     UPDATE TICKET (generic)
  ======================= */
  async updateTicket(id: string, data: Partial<Ticket>): Promise<any> {
    // STATUS UPDATE
    if (data.status) {
      return this.updateTicketStatus(id, data.status);
    }

    // ASSIGN UPDATE
    if ((data as any).assignedTo || (data as any).assignee || (data as any).owner) {
      const endpoint = isAdmin()
        ? `${API_BASE_URL}/api/admin/tickets/${encodeURIComponent(id)}/assign`
        : `${API_BASE_URL}/api/tickets/${encodeURIComponent(id)}/assign`;

      const assignedToId =
        (data as any).assignedToId ??
        (data as any).assignedTo ??
        (data as any).assignee?.id ??
        (data as any).owner?.id;

      const res = await authenticatedFetch(endpoint, {
        method: "PATCH",
        body: JSON.stringify({ assignedToId }),
      });

      return res.json();
    }

    throw new Error("Bu update işlemi için backend endpoint henüz yok.");
  }

  /* =======================
     DELETE TICKET
     Admin: DELETE /api/admin/tickets/{id}
  ======================= */
  async deleteTicket(id: string): Promise<void> {
    const url = `${API_BASE_URL}/api/admin/tickets/${encodeURIComponent(id)}`;
    await authenticatedFetch(url, { method: "DELETE" });
  }

  /* =======================
     GET COMMENTS
     GET /api/tickets/{id}/comments
  ======================= */
  async getComments(ticketId: string): Promise<any[]> {
    const url = `${API_BASE_URL}/api/tickets/${encodeURIComponent(ticketId)}/comments`;
    const res = await authenticatedFetch(url, { method: "GET" });
    return res.json();
  }

  /* =======================
     ADD COMMENT
     POST /api/tickets/{id}/comments
  ======================= */
  async addComment(ticketId: string, comment: string): Promise<any> {
    const url = `${API_BASE_URL}/api/tickets/${encodeURIComponent(ticketId)}/comments`;
    const res = await authenticatedFetch(url, {
      method: "POST",
      body: JSON.stringify({ comment }),
    });
    return res.json();
  }

  /* =======================
     TOP RESOLVERS (Analytics)
     GET /api/tickets/analytics/top-resolvers
  ======================= */
  async getTopResolvers(): Promise<any[]> {
    const url = `${API_BASE_URL}/api/tickets/analytics/top-resolvers`;
    const res = await authenticatedFetch(url, { method: "GET" });
    return res.json();
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