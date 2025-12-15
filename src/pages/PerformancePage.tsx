import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layouts/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { ticketService } from "../services/ticketService";
import { Ticket } from "../types";
import {
  ArrowLeft,
  Filter,
  PieChart,
  BarChart3,
  ChevronDown,
  X,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  Loader2,
  Calendar,
  CheckCircle2
} from "lucide-react";

type ChartType = "pie" | "bar";

type StatusBucket = {
  notStarted: number;
  inProgress: number;
  done: number;
  deleted: number;
};

const getAssigneeLabel = (t: Ticket): string => {
  if (t.owner?.fullName) return t.owner.fullName;
  if (t.assignee) return String(t.assignee);
  if (t.assignedTo) return String(t.assignedTo);
  return "Unassigned";
};

const isDeletedTicket = (t: Ticket): boolean => {
  // @ts-expect-error
  if (typeof t.isDeleted === "boolean") return t.isDeleted;
  // @ts-expect-error
  if (t.status === "deleted") return true;
  return false;
};

const normalizeStatus = (t: Ticket) => {
  const raw = String((t as any).status || "").toLowerCase();
  if (isDeletedTicket(t)) return "deleted";
  if (raw === "completed" || raw === "done") return "done";
  if (raw === "in_progress" || raw === "in progress") return "in_progress";
  if (raw === "new" || raw === "not started" || raw === "open") return "new";
  return raw || "new";
};

const hoursBetween = (aIso?: string, bIso?: string) => {
  if (!aIso || !bIso) return null;
  const a = new Date(aIso).getTime();
  const b = new Date(bIso).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  const diff = b - a;
  if (diff <= 0) return null;
  return diff / (1000 * 60 * 60);
};

const PerformancePage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const [selectedChart, setSelectedChart] = useState<ChartType>("pie");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isChartDropdownOpen, setIsChartDropdownOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [selectedPerson, setSelectedPerson] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

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

  const buckets: StatusBucket = useMemo(() => {
    const b: StatusBucket = { notStarted: 0, inProgress: 0, done: 0, deleted: 0 };
    for (const t of filteredTickets) {
      const st = normalizeStatus(t);
      if (st === "deleted") b.deleted += 1;
      else if (st === "done") b.done += 1;
      else if (st === "in_progress") b.inProgress += 1;
      else b.notStarted += 1;
    }
    return b;
  }, [filteredTickets]);

  const overdueCount = useMemo(() => {
    const now = new Date().getTime();
    return filteredTickets.filter((t) => {
      const st = normalizeStatus(t);
      if (st === "done" || st === "deleted") return false;
      const due = (t as any).dueDate;
      if (!due) return false;
      const ts = new Date(due).getTime();
      return !Number.isNaN(ts) && ts < now;
    }).length;
  }, [filteredTickets]);

  const avgResolutionHours = useMemo(() => {
    const hrs: number[] = [];
    for (const t of filteredTickets) {
      const st = normalizeStatus(t);
      if (st !== "done") continue;
      const h = hoursBetween((t as any).createdAt, (t as any).updatedAt);
      if (h != null) hrs.push(h);
    }
    if (hrs.length === 0) return 0;
    return hrs.reduce((a, b) => a + b, 0) / hrs.length;
  }, [filteredTickets]);

  const total = buckets.notStarted + buckets.inProgress + buckets.done + buckets.deleted;

  const chartOptions = [
    { id: "pie" as ChartType, label: "Pie Chart", icon: PieChart },
    { id: "bar" as ChartType, label: "Bar Chart", icon: BarChart3 },
  ];

  // Pie Chart Component
  const PieChartVisual = () => {
    const pct = (v: number) => (total === 0 ? 0 : (v / total) * 100);
    const a = pct(buckets.notStarted);
    const b = pct(buckets.inProgress);
    const c = pct(buckets.done);

    const bg = `conic-gradient(
      #0891b2 0% ${a}%,
      #f97316 ${a}% ${a + b}%,
      #16a34a ${a + b}% ${a + b + c}%,
      #dc2626 ${a + b + c}% 100%
    )`;

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="relative">
          <div
            className="w-52 h-52 rounded-full shadow-lg"
            style={{ background: total === 0 ? (isDarkMode ? '#374151' : '#e5e7eb') : bg }}
          >
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-inner flex items-center justify-center`}>
              <div className="text-center">
                <div className={`text-2xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{total}</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2">
          {[
            { label: "Not Started", value: buckets.notStarted, color: "bg-cyan-600" },
            { label: "In Progress", value: buckets.inProgress, color: "bg-orange-500" },
            { label: "Done", value: buckets.done, color: "bg-green-600" },
            { label: "Deleted", value: buckets.deleted, color: "bg-red-600" },
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

  // Bar Chart Component - Fixed version with inline styles for proper rendering
  const BarChartVisual = () => {
    const max = Math.max(1, buckets.notStarted, buckets.inProgress, buckets.done, buckets.deleted);
    const heightPx = (v: number) => Math.max((v / max) * 160, 8); // 160px max height, 8px minimum

    const bars = [
      { label: "Not Started", value: buckets.notStarted, color: "#0891b2" }, // cyan-600
      { label: "In Progress", value: buckets.inProgress, color: "#f97316" }, // orange-500
      { label: "Done", value: buckets.done, color: "#16a34a" }, // green-600
      { label: "Deleted", value: buckets.deleted, color: "#dc2626" }, // red-600
    ];

    return (
      <div className="flex flex-col h-full justify-center px-8">
        <div className={`h-48 flex items-end justify-center gap-8 pb-2 border-b-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {bars.map((bar) => (
            <div key={bar.label} className="flex flex-col items-center gap-2">
              <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {bar.value}
              </span>
              <div
                className="w-14 rounded-t-lg transition-all duration-500 ease-out"
                style={{ 
                  height: `${heightPx(bar.value)}px`,
                  backgroundColor: bar.color,
                  minHeight: '8px'
                }}
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
      <div className={`flex h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <Sidebar isDarkMode={isDarkMode} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto" />
            <p className={`mt-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Loading performance data...</p>
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
                <h1 className={`text-cyan-800 text-2xl font-semibold font-['Inter'] leading-9 mb-3`}>
                  Performance Overview
                </h1>
                <p className={`mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Track team productivity and ticket metrics
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Tickets", value: total, icon: TrendingUp, color: "teal", bg: isDarkMode ? "bg-teal-900/20" : "bg-teal-50" },
              { label: "Avg Resolution", value: `${avgResolutionHours.toFixed(1)}h`, icon: Clock, color: "blue", bg: isDarkMode ? "bg-blue-900/20" : "bg-blue-50" },
              { label: "Overdue", value: overdueCount, icon: AlertTriangle, color: "red", bg: isDarkMode ? "bg-red-900/20" : "bg-red-50" },
              { label: "Completed", value: buckets.done, icon: CheckCircle2, color: "green", bg: isDarkMode ? "bg-green-900/20" : "bg-green-50" },
            ].map((stat) => {
              const Icon = stat.icon;
              const colorClasses: Record<string, string> = {
                teal: isDarkMode ? "text-teal-400" : "text-teal-600",
                blue: isDarkMode ? "text-blue-400" : "text-blue-600",
                red: isDarkMode ? "text-red-400" : "text-red-600",
                green: isDarkMode ? "text-green-400" : "text-green-600",
              };
              return (
                <div key={stat.label} className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl p-5 shadow-sm`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${colorClasses[stat.color]}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
                      <p className={`text-2xl font-semibold ${colorClasses[stat.color]}`}>{stat.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filters & Chart Selection */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Filter Button */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-200 hover:border-teal-500'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-teal-500'
                } ${(selectedPerson !== "all" || selectedDate) ? (isDarkMode ? 'border-teal-500' : 'border-teal-500') : ''}`}
              >
                <Filter className="w-4 h-4" />
                <span className="font-medium">Filters</span>
                {(selectedPerson !== "all" || selectedDate) && (
                  <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-teal-500 text-white">
                    {(selectedPerson !== "all" ? 1 : 0) + (selectedDate ? 1 : 0)}
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFilterOpen && (
                <div className={`absolute left-0 top-full mt-2 w-80 rounded-2xl shadow-xl z-20 overflow-hidden ${
                  isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
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
                        <Users className="w-3 h-3" />
                        Person
                      </label>
                      <div className={`max-h-36 overflow-auto rounded-xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        {peopleOptions.map((p) => (
                          <button
                            key={p}
                            onClick={() => setSelectedPerson(p)}
                            className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                              selectedPerson === p
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
                        <Calendar className="w-3 h-3" />
                        Date (from)
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-xl border-2 transition-all ${
                          isDarkMode
                            ? 'bg-gray-700/50 border-gray-600 text-gray-200 focus:border-teal-500'
                            : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-teal-500'
                        } focus:outline-none`}
                      />
                    </div>

                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Active Filters Display */}
            {(selectedPerson !== "all" || selectedDate) && (
              <div className="flex items-center gap-2">
                {selectedPerson !== "all" && (
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
                    isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedPerson}
                    <button onClick={() => setSelectedPerson("all")} className="ml-1 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedDate && (
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
                    isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    From: {selectedDate}
                    <button onClick={() => setSelectedDate("")} className="ml-1 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Chart Type Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsChartDropdownOpen(!isChartDropdownOpen)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-200 hover:border-teal-500'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-teal-500'
                }`}
              >
                {selectedChart === "pie" ? (
                  <PieChart className="w-4 h-4" />
                ) : (
                  <BarChart3 className="w-4 h-4" />
                )}
                <span className="font-medium">
                  {chartOptions.find(o => o.id === selectedChart)?.label}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isChartDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isChartDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsChartDropdownOpen(false)} />
                  <div className={`absolute right-0 mt-2 w-44 rounded-xl shadow-lg z-20 overflow-hidden ${
                    isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                  }`}>
                    {chartOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => {
                            setSelectedChart(option.id);
                            setIsChartDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                            selectedChart === option.id
                              ? isDarkMode ? 'bg-teal-600/20 text-teal-400' : 'bg-teal-50 text-teal-600'
                              : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="font-medium">{option.label}</span>
                          {selectedChart === option.id && (
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

          {/* Chart Card */}
          <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-sm overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                Ticket Distribution
              </h3>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                {filteredTickets.length} tickets {selectedPerson !== "all" || selectedDate ? "(filtered)" : ""}
              </p>
            </div>

            <div className="h-80 p-6">
              {selectedChart === "pie" ? <PieChartVisual /> : <BarChartVisual />}
            </div>

            {/* Summary Stats */}
            <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Not Started", value: buckets.notStarted, color: "text-cyan-500", bg: isDarkMode ? "bg-cyan-900/20" : "bg-cyan-50" },
                  { label: "In Progress", value: buckets.inProgress, color: "text-orange-500", bg: isDarkMode ? "bg-orange-900/20" : "bg-orange-50" },
                  { label: "Done", value: buckets.done, color: "text-green-500", bg: isDarkMode ? "bg-green-900/20" : "bg-green-50" },
                  { label: "Deleted", value: buckets.deleted, color: "text-red-500", bg: isDarkMode ? "bg-red-900/20" : "bg-red-50" },
                ].map((stat) => (
                  <div key={stat.label} className={`${stat.bg} rounded-xl p-4 text-center`}>
                    <p className={`text-2xl  ${stat.color}`}>{stat.value}</p>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
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

export default PerformancePage;