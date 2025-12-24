import React, { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { ticketService } from "../services/ticketService";
import { Ticket } from "../types";

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
const getAssigneeLabel = (t: Ticket): string => {
  if (t.owner?.firstName || t.owner?.lastName) {
    return `${t.owner.firstName || ""} ${t.owner.lastName || ""}`.trim();
  }
  return "Unassigned";
};

const isDeletedTicket = (t: Ticket): boolean => {
  // @ts-expect-error
  if (typeof t.isDeleted === "boolean") return t.isDeleted;
  // @ts-expect-error
  if (t.status === "deleted") return true;
  return false;
};

// 2. Normalize Fonksiyonu (Java Enumları ile birebir)
const normalizeStatus = (t: Ticket): keyof StatusBucket => {
  const raw = String((t as any).status || "").toUpperCase();
  if (raw === "OPEN") return "opened";
  if (raw === "IN_PROGRESS") return "inProgress";
  if (raw === "RESOLVED") return "resolved";
  if (raw === "CLOSED") return "closed";
  return "opened";
};
const PerformancePage: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  const [selectedChart, setSelectedChart] = useState<ChartType>("pie");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isChartDropdownOpen, setIsChartDropdownOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [selectedPerson, setSelectedPerson] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const isOverdue = (t: Ticket): boolean => {
    if (!t.dueDate) return false;

    // Bilet zaten tamamlanmışsa (Resolved veya Closed) süresi geçmiş sayılmaz
    const rawStatus = String((t as any).status || "").toUpperCase();
    const isFinished = rawStatus === "RESOLVED" || rawStatus === "CLOSED";

    if (isFinished) return false;

    // Şu anki zaman, dueDate'den büyükse süresi geçmiştir
    const now = new Date();
    const dueDate = new Date(t.dueDate);
    return now > dueDate;
  };
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await ticketService.getTickets();
        setTickets(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!isFilterOpen) return;
      const target = e.target as Node;
      if (filterRef.current && !filterRef.current.contains(target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isFilterOpen]);

  const peopleOptions = useMemo(() => {
    const set = new Set<string>();
    for (const t of tickets) set.add(getAssigneeLabel(t));
    return ["all", ...Array.from(set)];
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    let data = [...tickets];

    if (selectedPerson !== "all") {
      data = data.filter((t) => getAssigneeLabel(t) === selectedPerson);
    }

    if (selectedDate) {
      const from = new Date(selectedDate).setHours(0, 0, 0, 0);
      data = data.filter((t) => {
        const createdAt = (t as any).createdAt;
        if (!createdAt) return false;
        const ts = new Date(createdAt).getTime();
        return !Number.isNaN(ts) && ts >= from;
      });
    }

    return data;
  }, [tickets, selectedPerson, selectedDate]);

  //Bucket Hesaplaması (Admin'in filtrelerine duyarlı)
  const buckets: StatusBucket = useMemo(() => {
  const b: StatusBucket = { total: 0, opened: 0, waiting: 0, inProgress: 0, resolved: 0, closed: 0, overdue: 0 };
  
  b.total = filteredTickets.length;

  for (const t of filteredTickets) {
    const st = normalizeStatus(t);
    if (st in b) {
       b[st] += 1;
    }
    // Overdue mantığı: Resolved veya Closed olmayan, süresi geçmiş biletler
    if (st !== "resolved" && st !== "closed") {
      const now = new Date();
      const due = t.dueDate ? new Date(t.dueDate) : null;
      if (due && now > due) {
        b.overdue += 1;
      }
    }
  }
  return b;
}, [filteredTickets]);

  const overdueCount = useMemo(() => {
    const now = new Date().getTime();
    return filteredTickets.filter((t) => {
      const st = normalizeStatus(t);
      if (st === "resolved" || st === "closed") return false;
      const due = (t as any).dueDate;
      if (!due) return false;
      const ts = new Date(due).getTime();
      return !Number.isNaN(ts) && ts < now;
    }).length;
  }, [filteredTickets]);

  const total = buckets.opened + buckets.inProgress + buckets.resolved + buckets.closed;

  const chartOptions = [
    { id: "pie" as ChartType, label: "Pie Chart" },
    { id: "bar" as ChartType, label: "Bar Chart" },
  ];

  // Pie Chart Component
  const PieChartVisual = () => {
  // Yüzde hesaplama: Değer / Toplam bilet sayısı
  const pct = (v: number) => (buckets.total === 0 ? 0 : (v / buckets.total) * 100);
  
  const a = pct(buckets.opened);
  const b = pct(buckets.inProgress);
  const c = pct(buckets.resolved);

  // Geri kalan kısım (Closed vb.) gri alan olarak görünür
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

  // Bar Chart Component - Fixed version with inline styles for proper rendering
  const BarChartVisual = () => {
  // En yüksek bar her zaman 'Total' olacağı için max değer b.total
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
          <p className={`mt-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Loading performance data...</p>
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
            <h1 className="text-cyan-800 text-2xl font-semibold font-['Inter'] leading-9 mb-3">
              Performance Overview
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
          {/* Stats Cards */}
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
                  <h3 className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
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
                    {buckets.closed}
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

          {/* Chart Card */}
          <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-sm overflow-hidden`}>
            <div className={`px-12 py-4  border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              {/* Left: Title */}
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                  Ticket Distribution
                </h3>
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {filteredTickets.length} tickets {selectedPerson !== "all" || selectedDate ? "(filtered)" : ""}
                </p>
              </div>

              {/* Right: Filter and Chart Controls */}
              <div className="flex items-center gap-10">
                {/* Filter Button */}
                <div className="relative" ref={filterRef}>
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`flex items-center gap-4 px-4 py-2 rounded-lg border transition-colors ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200 hover:border-teal-500'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-teal-500'
                      } ${(selectedPerson !== "all" || selectedDate) ? 'border-teal-500' : ''}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="text-sm font-medium">Filter</span>
                    {(selectedPerson !== "all" || selectedDate) && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-teal-500 text-white">
                        {(selectedPerson !== "all" ? 1 : 0) + (selectedDate ? 1 : 0)}
                      </span>
                    )}
                  </button>

                  {isFilterOpen && (
                    <div className={`absolute left-0 top-full mt-2 w-80 rounded-xl shadow-xl z-20 overflow-hidden ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                      }`}>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Filters</h4>
                          <button
                            onClick={() => {
                              setSelectedPerson("all");
                              setSelectedDate("");
                            }}
                            className="text-sm text-teal-500 hover:text-teal-600"
                          >
                            Clear all
                          </button>
                        </div>

                        {/* Person Filter */}
                        <div className="mb-4">
                          <label className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            Person
                          </label>
                          <div className={`max-h-36 overflow-auto rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            {peopleOptions.map((p) => (
                              <button
                                key={p}
                                onClick={() => setSelectedPerson(p)}
                                className={`w-full text-left px-3 py-2 text-sm transition-colors ${selectedPerson === p
                                    ? isDarkMode ? 'bg-teal-600/20 text-teal-400' : 'bg-teal-50 text-teal-700'
                                    : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                              >
                                {p === "all" ? "All People" : p}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Date Filter */}
                        <div className="mb-4">
                          <label className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Date (from)
                          </label>
                          <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border transition-all ${isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-teal-500'
                                : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-teal-500'
                              } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                          />
                        </div>

                        <button
                          onClick={() => setIsFilterOpen(false)}
                          className="w-full py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium transition-colors"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chart Type Selector */}
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
            </div>

            {/* Chart Card */}
            <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-sm overflow-hidden`}>
              <div className="h-80 p-6">
                {selectedChart === "pie" ? <PieChartVisual /> : <BarChartVisual />}
              </div>

              {/* Summary Stats */}
              <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="grid grid-cols-5 gap-4"> {/* Kolon sayısını Overdue için 5'e çıkardık */}
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
                      isAlert: true // Gecikme olduğu için vurgu yapabiliriz
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
    </div>
  );
};

export default PerformancePage;