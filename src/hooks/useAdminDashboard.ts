import { useState, useEffect, useCallback } from 'react';
import { adminDashboardService } from '../services/adminDashboardService';
import {
  AdminDashboardStats,
  AgentPerformance,
  DepartmentStats,
  TicketDistribution,
  TeamActivityData,
  OverdueTicket,
} from '../types';
import { RecentTicket } from '../components/admin/RecentTicketsWidget';

// 1. ADMIN STATS HOOK
export const useAdminDashboardStats = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminDashboardService.getAdminStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin stats');
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

// 2. AGENT PERFORMANCE HOOK
export const useAgentPerformance = () => {
  const [agents, setAgents] = useState<AgentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminDashboardService.getAgentPerformance();
      setAgents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch agent performance');
      console.error('Error fetching agents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return { agents, loading, error, refetch: fetchAgents };
};

// 3. DEPARTMENT STATS HOOK
export const useDepartmentStats = () => {
  const [departments, setDepartments] = useState<DepartmentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminDashboardService.getDepartmentStats();
      setDepartments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch department stats');
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return { departments, loading, error, refetch: fetchDepartments };
};

// 4. TICKET DISTRIBUTION HOOK
export const useTicketDistribution = () => {
  const [distribution, setDistribution] = useState<TicketDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDistribution = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminDashboardService.getTicketDistribution();
      setDistribution(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch ticket distribution');
      console.error('Error fetching distribution:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDistribution();
  }, [fetchDistribution]);

  return { distribution, loading, error, refetch: fetchDistribution };
};

// 5. TEAM ACTIVITY TREND HOOK
export const useTeamActivityTrend = (period: 'week' | 'month' | 'year' = 'week') => {
  const [activityData, setActivityData] = useState<TeamActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminDashboardService.getTeamActivityTrend(period);
      setActivityData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch team activity');
      console.error('Error fetching activity:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return { activityData, loading, error, refetch: fetchActivity };
};

// 6. COMBO HOOK - ALL ADMIN DATA
export const useAdminDashboard = () => {
  const statsHook = useAdminDashboardStats();
  const agentsHook = useAgentPerformance();
  const departmentsHook = useDepartmentStats();
  const distributionHook = useTicketDistribution();
  const activityHook = useTeamActivityTrend();

  const refreshAll = async () => {
    await Promise.all([
      statsHook.refetch(),
      agentsHook.refetch(),
      departmentsHook.refetch(),
      distributionHook.refetch(),
      activityHook.refetch(),
    ]);
  };

  return {
    stats: statsHook.stats,
    statsLoading: statsHook.loading,
    statsError: statsHook.error,
    
    agents: agentsHook.agents,
    agentsLoading: agentsHook.loading,
    agentsError: agentsHook.error,
    
    departments: departmentsHook.departments,
    departmentsLoading: departmentsHook.loading,
    departmentsError: departmentsHook.error,
    
    distribution: distributionHook.distribution,
    distributionLoading: distributionHook.loading,
    distributionError: distributionHook.error,
    
    activityData: activityHook.activityData,
    activityLoading: activityHook.loading,
    activityError: activityHook.error,
    
    refreshAll,
  };
};

// 7. OVERDUE TICKETS HOOK
export const useOverdueTickets = () => {
  const [overdueTickets, setOverdueTickets] = useState<OverdueTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverdueTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminDashboardService.getOverdueTickets();
      setOverdueTickets(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch overdue tickets');
      console.error('Error fetching overdue tickets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverdueTickets();
  }, [fetchOverdueTickets]);

  return { overdueTickets, loading, error, refetch: fetchOverdueTickets };
};

// 8. RECENT TICKETS HOOK
export const useRecentTickets = () => {
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminDashboardService.getRecentTickets();
      setRecentTickets(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch recent tickets');
      console.error('Error fetching recent tickets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentTickets();
  }, [fetchRecentTickets]);

  return { recentTickets, loading, error, refetch: fetchRecentTickets };
};