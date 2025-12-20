import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/layouts/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { ticketService } from "../services/ticketService";
import type { Ticket } from "../types";

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

  const total = counts.not_started + counts.in_progress + counts.done + counts.deleted;
  const pct = (v: number) => (total === 0 ? 0 : (v / total) * 100);

  const chartOptions = [
    { id: "pie" as ChartType, label: "Pie Chart"},
    { id: "bar" as ChartType, label: "Bar Chart"},
  ];

  // Pie Chart Component
  const PieChartVisual = () => {
    const a = pct(counts.not_started);
    const b = pct(counts.in_progress);
    const c = pct(counts.done);

    const bg = `conic-gradient(
      #6D28D9 0% ${a}%,
      #06B6D4 ${a}% ${a + b}%,
      #14B8A6 ${a + b}% ${a + b + c}%,
      #BE185D ${a + b + c}%
    )`;

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="relative">
          <div 
            className="w-52 h-52 rounded-full shadow-lg" 
            style={{ background: total === 0 ? (isDarkMode ? '#374151' : '#e5e7eb') : bg }}
          >
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-inner flex items-center justify-center`}>
              <div className="text-center">
                <div className={`text-2xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{total}</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {[
            { label: "Not Started", value: counts.not_started, color: "bg-violet-700" },
            { label: "In Progress", value: counts.in_progress, color: "bg-cyan-500" },
            { label: "Done", value: counts.done, color: "bg-teal-500" },
            { label: "Deleted", value: counts.deleted, color: "bg-pink-700" },
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

  // Bar Chart Component 
  const BarChartVisual = () => {
    const max = Math.max(1, counts.not_started, counts.in_progress, counts.done, counts.deleted);
    const heightPx = (v: number) => Math.max((v / max) * 160, 8);

    const bars = [
      { label: "Not Started", value: counts.not_started, color: "bg-violet-700" },
      { label: "In Progress", value: counts.in_progress, color: "bg-cyan-500" },
      { label: "Done", value: counts.done, color: "bg-teal-500" },
      { label: "Deleted", value: counts.deleted, color: "bg-pink-700" },
    ];

    return (
      <div className="flex flex-col h-full justify-center px-8">
        <div className={`h-48 flex items-end justify-center gap-8 pb-2 border-b-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {bars.map((bar) => (
            <div key={bar.label} className="flex flex-col items-center gap-2">
              <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {bar.value}
              </span>
              <div 
                className={`w-14 ${bar.color} rounded-t-lg transition-all duration-500 ease-out shadow-md`}
                style={{ height: `${heightPx(bar.value)}px`, backgroundColor: bar.color, minHeight: '8px' }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-8 mt-3">
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
      <div className="flex-1 flex items-center justify-center">
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

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className={`px-8 py-6 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h1 className="text-cyan-800 text-2xl font-semibold font-['Inter'] leading-9 mb-3">
              User Statistics
            </h1>
          
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - User Info & Metrics */}
            <div className="lg:col-span-1 space-y-6">
              {/* User Info Card */}
              <div className={`rounded-xl border p-5 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-teal-600/20' : 'bg-teal-50'}`}>
                    <svg className={`w-6 h-6 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className={`text-lg font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                      {userInfo.name}
                    </h2>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className={`flex items-center gap-2.5 p-2.5 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <svg className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Department</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{userInfo.department}</p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2.5 p-2.5 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <svg className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Email</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} truncate`}>{userInfo.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics Card */}
              <div className={`rounded-xl border p-5 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                  Key Metrics
                </h3>

                <div className="space-y-3">
                  {/* Overdue Tickets */}
                  <div className={`flex items-center gap-2.5 p-2.5 rounded-xl ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-red-600/30' : 'bg-red-100'}`}>
                      <svg className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Overdue Tickets</p>
                      <p className={`text-lg font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{overdue}</p>
                    </div>
                  </div>

                  {/* Completed Tickets */}
                  <div className={`flex items-center gap-2.5 p-2.5 rounded-xl ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-green-600/30' : 'bg-green-100'}`}>
                      <svg className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Completed Tickets</p>
                      <p className={`text-lg font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{counts.done}</p>
                    </div>
                  </div>

                  {/* Total Tickets */}
                  <div className={`flex items-center gap-2.5 p-2.5 rounded-xl ${isDarkMode ? 'bg-teal-900/20' : 'bg-teal-50'}`}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'}`}>
                      <svg className={`w-5 h-5 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Tickets</p>
                      <p className={`text-lg font-semibold ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>{total}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Chart */}
            <div className="lg:col-span-2">
              <div className={`rounded-xl border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                {/* Chart Header with Dropdown */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                    Ticket Distribution
                  </h3>

                  {/* Chart Type Selector */}
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-200 hover:border-teal-500' 
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-teal-500'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {chart === "pie" ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        )}
                      </svg>
                      <span className="text-sm font-medium">
                        {chartOptions.find(o => o.id === chart)?.label}
                      </span>
                      <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setIsDropdownOpen(false)} 
                        />
                        <div className={`absolute right-0 mt-2 w-44 rounded-lg shadow-lg z-20 overflow-hidden ${
                          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                        }`}>
                          {chartOptions.map((option) => (
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
                                    ? 'text-gray-300 hover:bg-gray-700'
                                    : 'text-gray-700 hover:bg-gray-50'
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
                              {chart === option.id && (
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
                <div className="px-6 py-8">
                  <div className="flex items-center justify-center min-h-[310px]">
                    {chart === "pie" ? <PieChartVisual /> : <BarChartVisual />}
                  </div>
                </div>

                {/* Summary Stats */}
                <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: "Not Started", value: counts.not_started, color: "text-violet-700", bg: isDarkMode ? "bg-violet-900/20" : "bg-violet-50" },
                      { label: "In Progress", value: counts.in_progress, color: "text-cyan-500", bg: isDarkMode ? "bg-cyan-900/20" : "bg-cyan-50" },
                      { label: "Done", value: counts.done, color: "text-teal-500", bg: isDarkMode ? "bg-teal-900/20" : "bg-teal-50" },
                      { label: "Deleted", value: counts.deleted, color: "text-pink-700", bg: isDarkMode ? "bg-pink-900/20" : "bg-pink-50" },
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
