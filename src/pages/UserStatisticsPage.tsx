import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/layouts/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { ticketService } from "../services/ticketService";
import type { Ticket } from "../types";

type ChartType = "pie" | "bar";

type StatusBucket = {
  total: number;
  opened: number;
  waiting: number;
  inProgress: number;
  resolved: number;
  closed: number;
  overdue: number;
};

function safeDate(v?: string) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Backend enum'larıyla uyumlu normalize
const normalizeStatus = (t: Ticket): keyof StatusBucket => {
  const raw = String((t as any).status || "").toUpperCase();
  if (raw === "OPEN") return "opened";
  if (raw === "WAITING") return "waiting";
  if (raw === "IN_PROGRESS") return "inProgress";
  if (raw === "RESOLVED") return "resolved";
  if (raw === "CLOSED") return "closed";
  return "opened";
};

const UserStatisticsPage: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { userId } = useParams<{ userId: string }>();

  const [selectedChart, setSelectedChart] = useState<ChartType>("pie");
  const [isChartDropdownOpen, setIsChartDropdownOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const targetId = userId || sessionStorage.getItem('userId');

        if (!targetId) {
          if (mounted) setLoading(false);
          return;
        }

        const data = await ticketService.getTickets();

        if (mounted) {
          setTickets(data || []);
        }
      } catch (err) {
        console.error("İstatistik sayfası veri çekme hatası:", err);
        if (mounted) setTickets([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [userId]);

  // Kullanıcı bilgisi
  const userInfo = useMemo(() => {
    const name = sessionStorage.getItem('userName') || "User";
    const surname = sessionStorage.getItem('userSurname') || "";
    const email = sessionStorage.getItem('userEmail') || sessionStorage.getItem('email') || "";
    const initials = `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase() || "U";
    return { name, surname, email, initials, fullName: `${name} ${surname}`.trim() };
  }, []);

  // Bucket hesaplama
  const buckets: StatusBucket = useMemo(() => {
    const b: StatusBucket = { total: 0, opened: 0, waiting: 0, inProgress: 0, resolved: 0, closed: 0, overdue: 0 };
    
    b.total = tickets.length;

    for (const t of tickets) {
      const st = normalizeStatus(t);
      if (st in b) {
        b[st] += 1;
      }
      // Overdue mantığı
      if (st !== "resolved" && st !== "closed") {
        const now = new Date();
        const due = t.dueDate ? new Date(t.dueDate) : null;
        if (due && now > due) {
          b.overdue += 1;
        }
      }
    }
    return b;
  }, [tickets]);

  const overdueCount = useMemo(() => {
    const now = new Date().getTime();
    return tickets.filter((t) => {
      const st = normalizeStatus(t);
      if (st === "resolved" || st === "closed") return false;
      const due = (t as any).dueDate;
      if (!due) return false;
      const ts = new Date(due).getTime();
      return !Number.isNaN(ts) && ts < now;
    }).length;
  }, [tickets]);

  const total = buckets.opened + buckets.waiting + buckets.inProgress + buckets.resolved + buckets.closed;

  const chartOptions = [
    { id: "pie" as ChartType, label: "Pie Chart" },
    { id: "bar" as ChartType, label: "Bar Chart" },
  ];

  // Pie Chart Component
  const PieChartVisual = () => {
    const pct = (v: number) => (buckets.total === 0 ? 0 : (v / buckets.total) * 100);
    
    const a = pct(buckets.opened);
    const b = pct(buckets.inProgress);
    const c = pct(buckets.resolved);

    const bg = `conic-gradient(
      #6D28D9 0% ${a}%,
      #06B6D4 ${a}% ${a + b}%,
      #14B8A6 ${a + b}% ${a + b + c}%,
      ${isDarkMode ? '#374151' : '#e5e7eb'} ${a + b + c}% 100%
    )`;

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="relative">
          <div
            className="w-52 h-52 rounded-full shadow-lg transition-all duration-700"
            style={{ background: buckets.total === 0 ? (isDarkMode ? '#374151' : '#e5e7eb') : bg }}
          >
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-inner flex items-center justify-center`}>
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{buckets.total}</div>
                <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>TOTAL</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-x-2 w-full px-2">
          {[
            { label: "Total", value: buckets.total, color: "bg-gray-400" },
            { label: "Opened", value: buckets.opened, color: "bg-violet-700" },
            { label: "In Progress", value: buckets.inProgress, color: "bg-cyan-500" },
            { label: "Resolved", value: buckets.resolved, color: "bg-teal-500" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 mb-1">
                <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.label}</span>
              </div>
              <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Bar Chart Component
  const BarChartVisual = () => {
    const max = Math.max(1, buckets.total);
    const heightPx = (v: number) => Math.max((v / max) * 160, 8);

    const bars = [
      { label: "Total", value: buckets.total, color: isDarkMode ? "#4B5563" : "#9CA3AF" },
      { label: "Opened", value: buckets.opened, color: "#6D28D9" },
      { label: "Waiting", value: buckets.waiting, color: "#F59E0B" },
      { label: "In Progress", value: buckets.inProgress, color: "#06B6D4" },
      { label: "Resolved", value: buckets.resolved, color: "#14B8A6" },
    ];

    return (
      <div className="flex flex-col h-full justify-center px-4">
        <div className={`h-48 flex items-end justify-around pb-2 border-b-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {bars.map((bar) => (
            <div key={bar.label} className="flex flex-col items-center gap-2 group w-16">
              <span className={`text-xs font-bold transition-all ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {bar.value}
              </span>
              <div
                className="w-full rounded-t-md transition-all duration-500 ease-out hover:brightness-110 shadow-sm"
                style={{ 
                  height: `${heightPx(bar.value)}px`,
                  backgroundColor: bar.color,
                }}
              />
              <span className={`text-[9px] text-center uppercase tracking-tighter font-bold mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className={`mt-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"} transition-colors duration-300`}>
      <Sidebar isDarkMode={isDarkMode} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className={`px-8 py-6 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-cyan-800 text-2xl font-semibold font-['Inter'] leading-9 mb-1">
                My Statistics
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Welcome back, <span className="font-medium text-teal-600">{userInfo.fullName}</span>
              </p>
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
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* Stats Cards - PerformancePage ile aynı düzen */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Total Tickets */}
            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {total}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Tickets
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'}`}>
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Overdue */}
            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-3xl font-bold mb-1 ${overdueCount > 0 ? 'text-red-500' : isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {overdueCount}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Overdue
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Completed */}
            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {buckets.resolved + buckets.closed}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Completed
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Card - PerformancePage ile aynı düzen */}
          <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-sm overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              {/* Left: Title */}
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                  Ticket Distribution
                </h3>
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {buckets.total} tickets assigned to you
                </p>
              </div>

              {/* Right: Chart Type Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsChartDropdownOpen(!isChartDropdownOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-200 hover:border-teal-500'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-teal-500'
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {selectedChart === "pie" ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    )}
                  </svg>
                  <span className="text-sm font-medium">
                    {chartOptions.find(o => o.id === selectedChart)?.label}
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${isChartDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isChartDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsChartDropdownOpen(false)} />
                    <div className={`absolute right-0 mt-2 w-44 rounded-lg shadow-lg z-20 overflow-hidden ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                      }`}>
                      {chartOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setSelectedChart(option.id);
                            setIsChartDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${selectedChart === option.id
                              ? isDarkMode ? 'bg-teal-600/20 text-teal-400' : 'bg-teal-50 text-teal-600'
                              : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {option.id === "pie" ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            )}
                          </svg>
                          <span className="font-medium text-sm">{option.label}</span>
                          {selectedChart === option.id && (
                            <div className="ml-auto w-2 h-2 rounded-full bg-teal-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Chart Area */}
            <div className="h-80 p-6">
              {selectedChart === "pie" ? <PieChartVisual /> : <BarChartVisual />}
            </div>

            {/* Summary Stats - PerformancePage ile aynı düzen */}
            <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="grid grid-cols-5 gap-4">
                {[
                  {
                    label: "Opened",
                    value: buckets.opened,
                    color: "text-violet-600",
                    bg: isDarkMode ? "bg-violet-900/20" : "bg-violet-50"
                  },
                  {
                    label: "In Progress",
                    value: buckets.inProgress,
                    color: "text-cyan-500",
                    bg: isDarkMode ? "bg-cyan-900/20" : "bg-cyan-50"
                  },
                  {
                    label: "Resolved",
                    value: buckets.resolved,
                    color: "text-teal-500",
                    bg: isDarkMode ? "bg-teal-900/20" : "bg-teal-50"
                  },
                  {
                    label: "Closed",
                    value: buckets.closed,
                    color: "text-gray-500",
                    bg: isDarkMode ? "bg-gray-800" : "bg-gray-100"
                  },
                  {
                    label: "Overdue",
                    value: buckets.overdue,
                    color: "text-red-600",
                    bg: isDarkMode ? "bg-red-900/20" : "bg-red-50",
                    isAlert: true
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`${stat.bg} rounded-xl p-4 text-center transition-transform hover:scale-105 ${stat.isAlert && buckets.overdue > 0 ? 'ring-2 ring-red-500' : ''}`}
                  >
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatisticsPage;