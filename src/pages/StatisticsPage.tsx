import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/layouts/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { ticketService } from "../services/ticketService";
import type { Ticket } from "../types";
import { 
  ArrowLeft, Clock, AlertTriangle, CheckCircle2, 
  User, Mail, Building2, BarChart3, PieChart,
  ChevronDown, Loader2
} from "lucide-react";

type ChartType = "pie" | "bar";
type StatusGroup = "not_started" | "in_progress" | "done" | "deleted";

function safeDate(v?: string) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toGroup(status: Ticket["status"]): StatusGroup {
  if (status === "new") return "not_started";
  if (status === "in_progress" || status === "blocked") return "in_progress";
  if (status === "completed") return "done";
  return "deleted";
}

const UserStatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { userId } = useParams<{ userId: string }>();

  const [chart, setChart] = useState<ChartType>("pie");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await ticketService.getTickets(userId);
        if (mounted) setTickets(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const userInfo = useMemo(() => {
    const t0 = tickets[0];
    const o = t0?.owner;
    return {
      name: o?.fullName ?? "Unknown User",
      department: o?.department ?? "—",
      email: o?.email ?? "—",
    };
  }, [tickets]);

  const counts = useMemo(() => {
    const base = { not_started: 0, in_progress: 0, done: 0, deleted: 0 };
    for (const t of tickets) base[toGroup(t.status)]++;
    return base;
  }, [tickets]);

  const overdue = useMemo(() => {
    const now = new Date();
    return tickets.filter((t) => {
      const due = safeDate(t.dueDate);
      if (!due) return false;
      const g = toGroup(t.status);
      if (g === "done" || g === "deleted") return false;
      return due.getTime() < now.getTime();
    }).length;
  }, [tickets]);

  const avgResolutionHours = useMemo(() => {
    const done = tickets.filter((t) => toGroup(t.status) === "done");
    if (done.length === 0) return 0;

    let totalMs = 0;
    let n = 0;
    for (const t of done) {
      const c = safeDate(t.createdAt);
      const u = safeDate(t.updatedAt);
      if (!c || !u) continue;
      totalMs += u.getTime() - c.getTime();
      n++;
    }
    if (n === 0) return 0;
    return Math.round((totalMs / n / 3600000) * 10) / 10;
  }, [tickets]);

  const total = counts.not_started + counts.in_progress + counts.done + counts.deleted;
  const pct = (v: number) => (total === 0 ? 0 : (v / total) * 100);

  const chartOptions = [
    { id: "pie" as ChartType, label: "Pie Chart", icon: PieChart },
    { id: "bar" as ChartType, label: "Bar Chart", icon: BarChart3 },
  ];

  // Pie Chart Component
  const PieChart_Visual = () => {
    const a = pct(counts.not_started);
    const b = pct(counts.in_progress);
    const c = pct(counts.done);

    const bg = `conic-gradient(
      #0891b2 0% ${a}%,
      #f97316 ${a}% ${a + b}%,
      #16a34a ${a + b}% ${a + b + c}%,
      #dc2626 ${a + b + c}% 100%
    )`;

    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <div 
            className="w-56 h-56 rounded-full shadow-lg" 
            style={{ background: total === 0 ? (isDarkMode ? '#374151' : '#e5e7eb') : bg }}
          >
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-inner flex items-center justify-center`}>
              <div className="text-center">
                <div className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{total}</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {[
            { label: "Not Started", value: counts.not_started, color: "bg-cyan-600" },
            { label: "In Progress", value: counts.in_progress, color: "bg-orange-500" },
            { label: "Done", value: counts.done, color: "bg-green-600" },
            { label: "Deleted", value: counts.deleted, color: "bg-red-600" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-sm ${item.color}`} />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {item.label}: <span className="font-semibold">{item.value}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Bar Chart Component - DÜZELTİLDİ
  const BarChart_Visual = () => {
    const max = Math.max(1, counts.not_started, counts.in_progress, counts.done, counts.deleted);
    const maxHeight = 180; // piksel cinsinden maksimum yükseklik
    const calcHeight = (v: number) => Math.max((v / max) * maxHeight, 8); // minimum 8px

    const bars = [
      { label: "Not Started", value: counts.not_started, color: "bg-cyan-600" },
      { label: "In Progress", value: counts.in_progress, color: "bg-orange-500" },
      { label: "Done", value: counts.done, color: "bg-green-600" },
      { label: "Deleted", value: counts.deleted, color: "bg-red-600" },
    ];

    return (
      <div className="w-full max-w-md mx-auto">
        <div 
          className={`flex items-end justify-center gap-6 px-4 pb-2 border-b-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} 
          style={{ height: '240px' }}
        >
          {bars.map((bar) => (
            <div key={bar.label} className="flex flex-col items-center gap-2">
              <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {bar.value}
              </span>
              <div 
                className={`w-14 ${bar.color} rounded-t-lg transition-all duration-500 ease-out shadow-md`}
                style={{ height: `${calcHeight(bar.value)}px` }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-6 px-4 mt-3">
          {bars.map((bar) => (
            <div key={bar.label} className="w-14 text-center">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {bar.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`flex h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <Sidebar isDarkMode={isDarkMode} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto" />
            <p className={`mt-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Loading statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"} transition-colors duration-300`}>
      <Sidebar isDarkMode={isDarkMode} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className={`p-2 rounded-xl transition-all ${
                  isDarkMode 
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className={`text-3xl font-bold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                  User Statistics
                </h1>
                <p className={`mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Performance overview and ticket metrics
                </p>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-600' : 'text-yellow-500'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
                {!isDarkMode && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              
              <button onClick={toggleTheme} className="relative w-14 h-7 rounded-full transition-colors duration-300 bg-cyan-500" aria-label="Toggle theme">
                <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
              
              <div className="relative">
                <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-blue-400' : 'text-gray-800'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
                {isDarkMode && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - User Info & Metrics */}
            <div className="lg:col-span-1 space-y-6">
              {/* User Info Card */}
              <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 shadow-sm`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-teal-600/20' : 'bg-teal-50'}`}>
                    <User className={`w-8 h-8 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                      {userInfo.name}
                    </h2>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      User Profile
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className={`flex items-center gap-3 p-3 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <Building2 className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Department</p>
                      <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{userInfo.department}</p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 p-3 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <Mail className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Email</p>
                      <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} truncate`}>{userInfo.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics Card */}
              <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 shadow-sm`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                  Key Metrics
                </h3>

                <div className="space-y-4">
                  <div className={`flex items-center gap-3 p-3 rounded-xl ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-blue-600/30' : 'bg-blue-100'}`}>
                      <Clock className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Avg Resolution Time</p>
                      <p className={`text-lg font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        {avgResolutionHours === 0 ? "—" : `${avgResolutionHours}h`}
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 p-3 rounded-xl ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-red-600/30' : 'bg-red-100'}`}>
                      <AlertTriangle className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Overdue Tickets</p>
                      <p className={`text-lg font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{overdue}</p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 p-3 rounded-xl ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-green-600/30' : 'bg-green-100'}`}>
                      <CheckCircle2 className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Completed Tickets</p>
                      <p className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{counts.done}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column - Chart */}
            <div className="lg:col-span-2">
              <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 shadow-sm h-full`}>
                {/* Chart Header with Dropdown */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                    Ticket Distribution
                  </h3>

                  {/* Custom Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700/50 border-gray-600 text-gray-200 hover:border-teal-500' 
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-teal-500'
                      }`}
                    >
                      {chart === "pie" ? (
                        <PieChart className="w-4 h-4" />
                      ) : (
                        <BarChart3 className="w-4 h-4" />
                      )}
                      <span className="font-medium">
                        {chartOptions.find(o => o.id === chart)?.label}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setIsDropdownOpen(false)} 
                        />
                        <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg z-20 overflow-hidden ${
                          isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'
                        }`}>
                          {chartOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                              <button
                                key={option.id}
                                onClick={() => {
                                  setChart(option.id);
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                                  chart === option.id
                                    ? isDarkMode 
                                      ? 'bg-teal-600/20 text-teal-400' 
                                      : 'bg-teal-50 text-teal-600'
                                    : isDarkMode
                                      ? 'text-gray-300 hover:bg-gray-600'
                                      : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                                <span className="font-medium">{option.label}</span>
                                {chart === option.id && (
                                  <div className="ml-auto w-2 h-2 rounded-full bg-teal-500" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Chart Area */}
                <div className="flex items-center justify-center min-h-[350px]">
                  {chart === "pie" ? <PieChart_Visual /> : <BarChart_Visual />}
                </div>

                {/* Summary Stats */}
                <div className={`mt-6 pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: "Not Started", value: counts.not_started, color: "text-cyan-500", bg: isDarkMode ? "bg-cyan-900/20" : "bg-cyan-50" },
                      { label: "In Progress", value: counts.in_progress, color: "text-orange-500", bg: isDarkMode ? "bg-orange-900/20" : "bg-orange-50" },
                      { label: "Done", value: counts.done, color: "text-green-500", bg: isDarkMode ? "bg-green-900/20" : "bg-green-50" },
                      { label: "Deleted", value: counts.deleted, color: "text-red-500", bg: isDarkMode ? "bg-red-900/20" : "bg-red-50" },
                    ].map((stat) => (
                      <div key={stat.label} className={`${stat.bg} rounded-xl p-4 text-center`}>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatisticsPage;