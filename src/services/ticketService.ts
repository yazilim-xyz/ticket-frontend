import type { Ticket } from "../types";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8081";

function getAuthToken(): string | null {
  return sessionStorage.getItem("accessToken");
}

// Kullanıcı bilgisini al
function getCurrentUser(): { id: number; name: string; surname: string; email: string; role: string } | null {
  const userStr = sessionStorage.getItem("user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
}

// Kullanıcı rolünü al
function getUserRole(): string | null {
  const user = getCurrentUser();
  return user?.role?.toUpperCase() || null;
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

// ===========================
// BACKEND DTO TYPES
// ===========================
type TicketDto = {
  id: number | string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category?: string | null;

  // Backend'den gelen alanlar
  ownerId?: number | null;
  ownerEmail?: string | null;
  ownerName?: string | null;

  assignedToId?: number | null;
  assignedToEmail?: string | null;
  assignedToName?: string | null;

  resolutionSummary?: string | null;

  createdAt: string;
  updatedAt: string;
  dueDate?: string | null;

  // TicketSimpledto alanları
  createdByName?: string | null;
};

type PageDto<T> = { content: T[] } | T[];

// ===========================
// MAPPER (DTO -> Frontend Ticket)
// ===========================
function mapTicketDtoToTicket(dto: TicketDto): Ticket {
  // Assignee bilgisi
  const assigneeName = dto.assignedToName || dto.assignedToEmail || '';
  const assignee = assigneeName
    ? { firstName: assigneeName.split(' ')[0] || assigneeName, lastName: assigneeName.split(' ').slice(1).join(' ') || '' }
    : undefined;

  // Owner bilgisi
  const ownerName = dto.ownerName || dto.ownerEmail || dto.createdByName || '';
  const owner = ownerName
    ? { firstName: ownerName.split(' ')[0] || ownerName, lastName: ownerName.split(' ').slice(1).join(' ') || '' }
    : undefined;

  return {
    id: String(dto.id),
    title: dto.title,
    description: dto.description,
    category: dto.category ?? 'OTHER',
    priority: dto.priority as any,
    status: dto.status as any,
    resolutionSummary: dto.resolutionSummary || '',

    // String değerler (eski uyumluluk için)
    assignedTo: dto.assignedToEmail || dto.assignedToName || (dto.assignedToId ? String(dto.assignedToId) : ''),
    createdBy: dto.ownerEmail || dto.createdByName || (dto.ownerId ? String(dto.ownerId) : ''),

    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    dueDate: dto.dueDate ?? '',

    // Object değerler (TicketTable için)
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
     GET ALL TICKETS (Admin için)
     Admin: GET /api/admin/tickets
  ======================= */
  async getAllTickets(): Promise<Ticket[]> {
    const url = `${API_BASE_URL}/api/admin/tickets?page=0&size=1000`;
    console.log('📋 Admin: Fetching all tickets from:', url);

    const res = await authenticatedFetch(url, { method: "GET" });
    const data = await res.json();

    const dtos = extractContent<TicketDto>(data);
    return dtos.map(mapTicketDtoToTicket);
  }

  /* =======================
     GET MY ASSIGNED TICKETS (User için)
     User: GET /api/tickets/my-assigned
  ======================= */
  async getMyAssignedTickets(): Promise<Ticket[]> {
    const url = `${API_BASE_URL}/api/tickets/my-assigned`;
    console.log('📋 User: Fetching my assigned tickets from:', url);

    const res = await authenticatedFetch(url, { method: "GET" });
    const data = await res.json();

    // my-assigned array döndürüyor (paginated değil)
    const dtos = Array.isArray(data) ? data : (data.content || []);
    return dtos.map(mapTicketDtoToTicket);
  }

  /* =======================
     GET TICKETS (Role'e göre otomatik seç)
     Admin: Tüm ticket'lar
     User: Sadece kendisine atananlar
  ======================= */
  async getTickets(): Promise<Ticket[]> {
    if (isAdmin()) {
      return this.getAllTickets();
    } else {
      return this.getMyAssignedTickets();
    }
  }

  /* =======================
     GET TICKET BY ID
     Admin: GET /api/admin/tickets/{id}
     User: GET /api/tickets/{id}/detail
  ======================= */
  async getTicketById(id: string): Promise<Ticket> {
    const endpoint = isAdmin()
      ? `${API_BASE_URL}/api/admin/tickets/${encodeURIComponent(id)}`
      : `${API_BASE_URL}/api/tickets/${encodeURIComponent(id)}/detail`;

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
    assignedToId?: number;
    dueDate?: string;
  }): Promise<Ticket> {
    const currentUser = getCurrentUser();

    const endpoint = isAdmin()
      ? `${API_BASE_URL}/api/admin/tickets`
      : `${API_BASE_URL}/api/tickets`;

    let body: any;

    if (isAdmin()) {
      // Admin endpoint: assignedToUserId bekliyor (assignedToId degil!)
      body = {
        title: payload.title,
        description: payload.description,
        priority: payload.priority,
        category: payload.category,
        dueDate: payload.dueDate,
        // Frontend assignedToId gonderiyor, backend assignedToUserId bekliyor
        assignedToUserId: payload.assignedToId,
      };
    } else {
      // User endpoint
      body = {
        ...payload,
        createdById: currentUser?.id,
      };
    }

    console.log('Creating ticket:', { endpoint, body });

    const res = await authenticatedFetch(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const dto: TicketDto = await res.json();
    return mapTicketDtoToTicket(dto);
  }

  /* =======================
     ASSIGN TICKET
     Admin: PATCH /api/admin/tickets/{id}/assign (returns void)
     User: PATCH /api/tickets/{id}/assign (returns TicketDto)
  ======================= */
  async assignTicket(id: string, assignedToId: number): Promise<Ticket | { success: boolean }> {
    const endpoint = isAdmin()
      ? `${API_BASE_URL}/api/admin/tickets/${encodeURIComponent(id)}/assign`
      : `${API_BASE_URL}/api/tickets/${encodeURIComponent(id)}/assign`;

    // Admin endpoint expects { assignedToUserId }, User endpoint expects { assignedToId }
    const body = isAdmin()
      ? { assignedToUserId: assignedToId }
      : { assignedToId };

    const res = await authenticatedFetch(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    // Admin endpoint returns void, User endpoint returns TicketDto
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const text = await res.text();
      if (text) {
        const dto: TicketDto = JSON.parse(text);
        return mapTicketDtoToTicket(dto);
      }
    }

    return { success: true };
  }

  /* =======================
     GET ALL USERS (Dropdown için)
     GET /api/users
  ======================= */
  async getUsers(): Promise<{ id: number; fullName: string; email: string; role?: string }[]> {
    const url = `${API_BASE_URL}/api/users`;
    const res = await authenticatedFetch(url, { method: "GET" });
    const data = await res.json();

    // UserListItemDto: { id, name, surname, email, role }
    const users = Array.isArray(data) ? data : (data.content || []);
    return users.map((u: any) => ({
      id: u.id,
      fullName: `${u.name || ''} ${u.surname || ''}`.trim(),
      email: u.email,
      role: u.role,
    }));
  }

  /* =======================
     UPDATE TICKET STATUS
     Admin: PATCH /api/admin/tickets/{id}/status (returns void)
     User: PATCH /api/tickets/{id}/status (returns TicketDto)
  ======================= */
  async updateTicketStatus(id: string | number, status: string): Promise<any> {
    const endpoint = isAdmin()
      ? `${API_BASE_URL}/api/admin/tickets/${encodeURIComponent(id)}/status`
      : `${API_BASE_URL}/api/tickets/${encodeURIComponent(id)}/status`;

    const res = await authenticatedFetch(endpoint, {
      method: "PATCH",
      body: JSON.stringify({
        status: String(status).toUpperCase(),
      }),
    });

    // Admin endpoint returns void (204 No Content), User endpoint returns TicketDto
    // Check if response has content before parsing JSON
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const text = await res.text();
      if (text) {
        return JSON.parse(text);
      }
    }

    // Return success indicator for void responses
    return { success: true };
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
     DELETE TICKET (Sadece Admin)
     Admin: DELETE /api/admin/tickets/{id}
  ======================= */
  async deleteTicket(id: string): Promise<void> {
    if (!isAdmin()) {
      throw new Error("Sadece admin ticket silebilir.");
    }
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
  async addComment(ticketId: string, content: string): Promise<any> {
    const currentUser = getCurrentUser();
    const url = `${API_BASE_URL}/api/tickets/${encodeURIComponent(ticketId)}/comments`;

    const res = await authenticatedFetch(url, {
      method: "POST",
      body: JSON.stringify({
        content,
        authorId: currentUser?.id
      }),
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
     UPDATE TICKET RESOLUTION
     PATCH /api/tickets/{id}/resolution
  ======================= */
  async updateResolution(id: string, resolutionSummary: string): Promise<void> {
    const endpoint = `${API_BASE_URL}/api/tickets/${encodeURIComponent(id)}/resolution`;

    console.log('📝 Updating ticket resolution:', { id, resolutionSummary });

    await authenticatedFetch(endpoint, {
      method: "PATCH",
      body: JSON.stringify({ resolutionSummary }),
    });

    console.log('✅ Resolution updated successfully');
  }
}

export const ticketService = new TicketService();
export default ticketService;