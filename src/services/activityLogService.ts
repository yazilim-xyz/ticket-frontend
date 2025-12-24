import apiClient from '../utils/apiClient';

/**
 * Activity Log Types
 */

// Backend'den gelen activity log
export interface UserActivityDto {
  id: number;
  ticketId: number;
  actionType: string;
  actionDetails: string;
  createdAt?: string; // ISO format
}

// Paginated response
export interface PageUserActivityDto {
  totalElements: number;
  totalPages: number;
  size: number;
  content: UserActivityDto[];
  number: number; // current page number
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Frontend için formatted activity log
export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string; // "X ago" formatted
  createdAt?: string; // ISO format for filtering
  type: 'user' | 'ticket' | 'system';
  ticketId?: number;
  actionType?: string;
}

/**
 * Activity Log Service
 */
class ActivityLogService {
  /**
   * Kullanıcının activity log'larını getir
   * 
   * @param userId - User ID
   * @param page - Page number (0-indexed)
   * @param size - Page size (default: 20)
   * @returns Paginated activity logs
   */
  async getUserActivityLogs(
    userId: number,
    page: number = 0,
    size: number = 20
  ): Promise<PageUserActivityDto> {
    try {
      console.log(`📊 Fetching activity logs for user ${userId} (page: ${page}, size: ${size})`);
      
      const response = await apiClient.get(`/admin/users/${userId}/activity`, {
        params: { page, size }
      });

      console.log(`✅ Received ${response.data.content.length} activity logs`);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching activity logs:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error('Failed to fetch activity logs');
    }
  }

  /**
   * Backend activity'yi frontend formatına dönüştür
   */
  mapToActivityLog(activity: UserActivityDto, userName: string = 'User'): ActivityLog {
    return {
      id: activity.id.toString(),
      user: userName,
      action: this.formatAction(activity),
      timestamp: activity.createdAt ? this.formatTimestamp(activity.createdAt) : 'Unknown time',
      createdAt: activity.createdAt, // ISO format for filtering
      type: this.determineType(activity.actionType),
      ticketId: activity.ticketId,
      actionType: activity.actionType
    };
  }

  /**
   * Action'ı okunabilir formata çevir
   */
  private formatAction(activity: UserActivityDto): string {
    const { actionType, actionDetails, ticketId } = activity;
    
    // actionDetails varsa direkt kullan
    if (actionDetails) {
      return actionDetails;
    }
    
    // Yoksa actionType'a göre format et
    const ticketRef = ticketId ? ` TCK-${ticketId}` : '';
    
    const actionMap: Record<string, string> = {
      'CREATED': `Created ticket${ticketRef}`,
      'UPDATED': `Updated ticket${ticketRef}`,
      'COMMENTED': `Added comment to ticket${ticketRef}`,
      'STATUS_CHANGED': `Changed status of ticket${ticketRef}`,
      'ASSIGNED': `Assigned ticket${ticketRef}`,
      'RESOLVED': `Resolved ticket${ticketRef}`,
      'CLOSED': `Closed ticket${ticketRef}`,
      'REOPENED': `Reopened ticket${ticketRef}`
    };
    
    return actionMap[actionType] || `${actionType}${ticketRef}`;
  }

  /**
   * Timestamp'i "X ago" formatına çevir
   */
  private formatTimestamp(isoDate: string): string {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    // 7 günden eskiyse tarih göster
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  }

  /**
   * ActionType'a göre activity type'ı belirle
   */
  private determineType(actionType: string): 'user' | 'ticket' | 'system' {
    const ticketActions = [
      'CREATED', 'UPDATED', 'COMMENTED', 'STATUS_CHANGED',
      'ASSIGNED', 'RESOLVED', 'CLOSED', 'REOPENED'
    ];
    
    const userActions = [
      'USER_CREATED', 'USER_UPDATED', 'USER_DELETED',
      'ROLE_CHANGED', 'STATUS_CHANGED'
    ];
    
    if (ticketActions.includes(actionType)) {
      return 'ticket';
    }
    
    if (userActions.includes(actionType)) {
      return 'user';
    }
    
    return 'system';
  }
}

export const activityLogService = new ActivityLogService();