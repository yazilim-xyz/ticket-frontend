import { Notification } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

function getAuthToken(): string | null {
    return sessionStorage.getItem('accessToken');
}

async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = getAuthToken();
    const headers = new Headers(options.headers);

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }

    return res;
}

class NotificationService {
    async getNotifications(): Promise<Notification[]> {
        const url = `${API_BASE_URL}/api/notifications`;
        const res = await authenticatedFetch(url);
        return res.json();
    }

    async getUnreadCount(): Promise<number> {
        const url = `${API_BASE_URL}/api/notifications/unread-count`;
        const res = await authenticatedFetch(url);
        const data = await res.json();
        return data.count || 0;
    }

    async markAsRead(notificationId: string): Promise<void> {
        const url = `${API_BASE_URL}/api/notifications/${notificationId}/read`;
        await authenticatedFetch(url, { method: 'PATCH' });
    }

    async markAllAsRead(): Promise<void> {
        const url = `${API_BASE_URL}/api/notifications/mark-all-read`;
        await authenticatedFetch(url, { method: 'PATCH' });
    }
}

export const notificationService = new NotificationService();
export default notificationService;
