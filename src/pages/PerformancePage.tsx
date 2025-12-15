import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layouts/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { ticketService } from "../services/ticketService";
import { Ticket } from "../types";

type ChartType = "pie" | "bar";

type PersonOption = {
  key: string; // id/email/fullName gibi
  label: string;
};

function toDateInputValue(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function safeDate(s?: string | null) {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function statusBucket(t: any): "not_started" | "in_progress" | "done" | "deleted" {
  // farklı backend/mock ihtimallerini tolere etmeye çalışıyoruz
  if (t?.deleted === true || t?.isDeleted === true) return "deleted";
  const s = String(t?.status ?? "").toLowerCase();

  if (s === "deleted") return "deleted";
  if (s === "completed" || s === "done") return "done";
  if (s === "in_progress" || s === "in progress") return "in_progress";
  if (s === "new" || s === "not started" || s === "open") return "not_started";

  // bilinmiyorsa not_started gibi say
  return "not_started";
}

const PerformancePage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // chart
  const [chartType, setChartType] = useState<ChartType>("pie");
  const [isChartOpen, setIsChartOpen] = useState(false);

  // filter dropdown
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>(""); // YYYY-MM-DD

  const chartRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // İlk açılış: Pie + tüm veri
  useEffect(() => {
    setChartType("pie");
    setSelectedPerson("all");
    setStartDate("");
  }, []);

  // Ticketları çek
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const all = await ticketService.getTickets();
        setTickets(all ?? []);
      } catch (e) {
        console.error("Failed to fetch tickets:", e);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  // dışarı tıklayınca dropdown kapansın
  useEffect(() => {
    const onDocClick = (ev: MouseEvent) => {
      const target = ev.target as Node;
      if (isChartOpen && chartRef.current && !chartRef.current.contains(target)) {
        setIsChartOpen(false);
      }
      if (isFilterOpen && filterRef.current && !filterRef.current.contains(target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isChartOpen, isFilterOpen]);

  // kişi seçenekleri
  const personOptions: PersonOption[] = useMemo(() => {
    const map = new Map<string, string>();

    tickets.forEach((t: any) => {
      // projendeki olası alanlar:
      // t.owner.fullName / t.owner.email
      // t.assignee / t.assignedTo
      const ownerName = t?.owner?.fullName;
      const ownerEmail = t?.owner?.email;
      const assignee = t?.assignee;
      const assignedTo = t?.assignedTo;

      if (ownerEmail) map.set(ownerEmail, ownerName ? `${ownerName} (${ownerEmail})` : ownerEmail);
      else if (ownerName) map.set(ownerName, ownerName);
      else if (assignee) map.set(assignee, assignee);
      else if (assignedTo) map.set(assignedTo, assignedTo);
    });

    const arr = Array.from(map.entries()).map(([key, label]) => ({ key, label }));
    arr.sort((a, b) => a.label.localeCompare(b.label));
    return [{ key: "all", label: "All People" }, ...arr];
  }, [tickets]);

  // filtrelenmiş ticketlar
  const filteredTickets = useMemo(() => {
    let list = tickets;

    // kişi filtresi
    if (selectedPerson !== "all") {
      list = list.filter((t: any) => {
        const ownerEmail = t?.owner?.email;
        const ownerName = t?.owner?.fullName;
        const assignee = t?.assignee;
        const assignedTo = t?.assignedTo;
        return (
          ownerEmail === selectedPerson ||
          ownerName === selectedPerson ||
          assignee === selectedPerson ||
          assignedTo === selectedPerson
        );
      });
    }

    // tarih filtresi: seçilen tarih ve sonrası (createdAt üzerinden)
    if (startDate) {
      const start = new Date(`${startDate}T00:00:00`);
      list = list.filter((t: any) => {
        const c = safeDate(t?.createdAt);
        return c ? c.getTime() >= start.getTime() : true;
      });
    }

    return list;
  }, [tickets, selectedPerson, startDate]);

  // chart verileri (4 kalem)
  const chartCounts = useMemo(() => {
    const counts = {
      not_started: 0,
      in_progress: 0,
      done: 0,
      deleted: 0,
      total: 0,
      opened: 0, // örnekte “Opened” var: not_started + in_progress (deleted hariç)
    };

    filteredTickets.forEach((t: any) => {
      const b = statusBucket(t);
      counts[b] += 1;
      counts.total += 1;
    });

    counts.opened = counts.not_started + counts.in_progress; // örnekteki mantık
    return counts;
  }, [filteredTickets]);

  // KPI: overdue + avg resolution time (hour)
  const kpis = useMemo(() => {
    const now = new Date();

    const overdue = filteredTickets.filter((t: any) => {
      const due = safeDate(t?.dueDate);
      if (!due) return false;
      const b = statusBucket(t);
      return due.getTime() < now.getTime() && b !== "done" && b !== "deleted";
    }).length;

    // avg resolution time: done olanlarda (updatedAt - createdAt)
    const doneTickets = filteredTickets.filter((t: any) => statusBucket(t) === "done");

    let avgHours = 0;
    if (doneTickets.length > 0) {
      const totalMs = doneTickets.reduce((acc: number, t: any) => {
        const c = safeDate(t?.createdAt);
        const u = safeDate(t?.updatedAt) ?? safeDate(t?.closedAt);
        if (!c || !u) return acc;
        const diff = u.getTime() - c.getTime();
        return diff > 0 ? acc + diff : acc;
      }, 0);

      const avgMs = totalMs / doneTickets.length;
      avgHours = avgMs / (1000 * 60 * 60);
    }

    return {
      overdue,
      avgHours,
    };
  }, [filteredTickets]);

  // Pie: CSS conic-gradient ile (kütüphane yok)
  const pieStyle = useMemo(() => {
    const total = Math.max(chartCounts.total, 1);
    const p1 = (chartCounts.not_started / total) * 360;
    const p2 = (chartCounts.in_progress / total) * 360;
    const p3 = (chartCounts.done / total) * 360;
    // deleted kalan
    return {
      background: `conic-gradient(
        #0EA5E9 0deg ${p1}deg,
        #F97316 ${p1}deg ${p1 + p2}deg,
        #16A34A ${p1 + p2}deg ${p1 + p2 + p3}deg,
        #DC2626 ${p1 + p2 + p3}deg 360deg
      )`,
    } as React.CSSProperties;
  }, [chartCounts]);

  // Bar heights
  const barItems = useMemo(() => {
    const items = [
      { key: "total", label: "Total Ticket", value: chartCounts.total },
      { key: "opened", label: "Opened", value: chartCounts.opened },
      { key: "in_progress", label: "In Progress", value: chartCounts.in_progress },
      { key: "done", label: "Done", value: chartCounts.done },
    ];
    const max = Math.max(...items.map((i) => i.value), 1);
    return { items, max };
  }, [chartCounts]);

  return (
    <div className={`flex h-screen ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
      <Sidebar userRole="user" isDarkMode={isDarkMode} />

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div
          className={`h-24 px-8 py-5 border-b ${
            isDarkMode ? "border-gray-700" : "border-zinc-200"
          } flex items-center justify-between`}
        >
          {/* Back + Title + Filter */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-700"
              }`}
              aria-label="Back"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex flex-col">
              <h1 className="text-cyan-800 text-2xl font-bold font-['Inter']">
                Performance Overview
              </h1>

              {/* Filter button + dropdown right next to it */}
              <div className="mt-2 flex items-center gap-3" ref={filterRef}>
                <button
                  onClick={() => setIsFilterOpen((p) => !p)}
                  className={`h-10 pl-3 pr-4 py-2 rounded-lg border inline-flex items-center gap-2 ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-gray-200"
                      : "bg-white border-neutral-200 text-black"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Filter</span>
                </button>

                {isFilterOpen && (
                  <div
                    className={`relative`}
                  >
                    <div
                      className={`absolute left-0 top-0 mt-0 w-[360px] rounded-lg border shadow-lg z-20 p-3 ${
                        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="grid grid-cols-1 gap-3">
                        {/* Person */}
                        <div>
                          <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                            Person
                          </label>
                          <select
                            value={selectedPerson}
                            onChange={(e) => setSelectedPerson(e.target.value)}
                            className={`w-full h-10 px-3 rounded-lg border text-sm ${
                              isDarkMode
                                ? "bg-gray-700 border-gray-600 text-gray-200"
                                : "bg-white border-gray-300 text-gray-900"
                            }`}
                          >
                            {personOptions.map((p) => (
                              <option key={p.key} value={p.key}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Date */}
                        <div>
                          <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                            Start Date (and after)
                          </label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className={`w-full h-10 px-3 rounded-lg border text-sm ${
                              isDarkMode
                                ? "bg-gray-700 border-gray-600 text-gray-200"
                                : "bg-white border-gray-300 text-gray-900"
                            }`}
                            max={toDateInputValue(new Date())}
                          />
                        </div>

                        {/* Clear */}
                        <button
                          onClick={() => {
                            setSelectedPerson("all");
                            setStartDate("");
                            setIsFilterOpen(false);
                          }}
                          className={`h-10 rounded-lg border text-sm font-medium transition-colors ${
                            isDarkMode
                              ? "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
                              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          Clear Filter
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Theme toggle */}
          <div className="flex items-center gap-2">
            <svg
              className={`w-5 h-5 transition-colors ${isDarkMode ? "text-gray-500" : "text-yellow-500"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>

            <button
              onClick={toggleTheme}
              className="relative w-14 h-7 rounded-full transition-colors duration-300 bg-cyan-500"
              aria-label="Toggle theme"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                  isDarkMode ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>

            <svg
              className={`w-5 h-5 transition-colors ${isDarkMode ? "text-blue-400" : "text-gray-800"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8 0 1010.586 10.586z" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          {/* 2 kolon (ortadaki çizgi yok) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* LEFT: Pie */}
            <div className="min-h-[520px]">
              <div className={`w-full max-w-[520px]`}>
                <div className="flex items-center justify-center mt-6">
                  {loading ? (
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600" />
                  ) : (
                    <div className="flex items-center gap-10">
                      {/* pie */}
                      <div className="relative">
                        <div
                          className="w-56 h-56 rounded-full"
                          style={pieStyle}
                          aria-label="Pie chart"
                        />
                        {/* küçük donut boşluğu istersen */}
                        <div
                          className={`absolute inset-0 m-auto w-20 h-20 rounded-full ${
                            isDarkMode ? "bg-gray-900" : "bg-white"
                          }`}
                        />
                        {/* sayılar (görseldeki gibi ortalara basit yerleşim) */}
                        <div className="absolute left-[38%] top-[35%] text-xs font-medium text-white">
                          {chartCounts.not_started}
                        </div>
                        <div className="absolute left-[48%] top-[55%] text-xs font-medium text-white">
                          {chartCounts.in_progress}
                        </div>
                        <div className="absolute left-[60%] top-[38%] text-xs font-medium text-white">
                          {chartCounts.done}
                        </div>
                        <div className="absolute left-[52%] top-[22%] text-xs font-medium text-white">
                          {chartCounts.deleted}
                        </div>
                      </div>

                      {/* legend */}
                      <div className="text-xs font-['Inter']">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-3 h-3 bg-sky-500 inline-block" />
                          <span className={isDarkMode ? "text-gray-200" : "text-gray-800"}>not started</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-3 h-3 bg-orange-500 inline-block" />
                          <span className={isDarkMode ? "text-gray-200" : "text-gray-800"}>in progress</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-3 h-3 bg-green-600 inline-block" />
                          <span className={isDarkMode ? "text-gray-200" : "text-gray-800"}>done</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-red-600 inline-block" />
                          <span className={isDarkMode ? "text-gray-200" : "text-gray-800"}>deleted</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* KPIs */}
                <div className="mt-14 space-y-4">
                  <div className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-black"}`}>
                    Average resolution time:{" "}
                    <span className="font-semibold">
                      {kpis.avgHours ? `${kpis.avgHours.toFixed(1)} hour` : "0.0 hour"}
                    </span>
                  </div>
                  <div className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-black"}`}>
                    Overdue tickets : <span className="font-semibold">{kpis.overdue}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Bar + Chart Select dropdown */}
            <div className="min-h-[520px] relative">
              {/* bar card */}
              <div className={`w-full max-w-[520px] rounded-xl border ${isDarkMode ? "border-gray-700 bg-gray-800" : "border-zinc-500 bg-white"} p-6`}>
                <div className="h-[240px] flex items-end gap-10 px-6">
                  {loading ? (
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600" />
                  ) : (
                    barItems.items.map((it) => {
                      const h = Math.round((it.value / barItems.max) * 180); // 180px max bar
                      return (
                        <div key={it.key} className="flex flex-col items-center gap-3">
                          <div className="w-20 h-[200px] flex items-end">
                            <div
                              className="w-full bg-teal-600"
                              style={{ height: `${h}px` }}
                              title={`${it.label}: ${it.value}`}
                            />
                          </div>
                          <div className={`text-xs ${isDarkMode ? "text-gray-200" : "text-black"}`}>
                            {it.label}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* select chart dropdown (alt sağ) */}
              <div className="absolute right-0 bottom-0" ref={chartRef}>
                <button
                  onClick={() => setIsChartOpen((p) => !p)}
                  className={`flex items-center justify-between w-72 px-3 py-2 rounded-md border ${
                    isDarkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-zinc-300 text-black"
                  }`}
                >
                  <span className="text-sm font-normal font-['Roboto']">Select Chart</span>
                  <svg className={`w-5 h-5 transition-transform ${isChartOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isChartOpen && (
                  <div className={`mt-2 w-72 rounded-md border shadow-lg overflow-hidden ${
                    isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-zinc-300"
                  }`}>
                    <button
                      className="w-full px-3 py-2 flex items-center gap-2 text-sm text-teal-600"
                      onClick={() => {
                        // Clear Selection mantığı: default pie
                        setChartType("pie");
                        setIsChartOpen(false);
                      }}
                    >
                      <span className="w-4 h-4 bg-teal-600 rounded-sm inline-flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      Clear Selection
                    </button>

                    {(["pie", "bar"] as ChartType[]).map((opt) => (
                      <button
                        key={opt}
                        className={`w-full px-3 py-2 flex items-center gap-2 text-sm ${
                          isDarkMode ? "hover:bg-gray-700 text-gray-200" : "hover:bg-zinc-100 text-gray-900"
                        }`}
                        onClick={() => {
                          setChartType(opt);
                          setIsChartOpen(false);
                        }}
                      >
                        <span className={`w-4 h-4 rounded-sm border ${chartType === opt ? "bg-teal-600 border-teal-600" : isDarkMode ? "border-gray-500" : "border-zinc-300"}`}>
                          {chartType === opt && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        {opt === "pie" ? "Pie" : "Bar"}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* NOT: chartType seçimi görselde grafiği değiştiriyor. Biz burada:
                  - default pie (sol)
                  - bar (sağ)
                  chartType = pie/bar olsa da iki grafiği de gösteriyoruz diye düşünebilirsin.
                  Eğer “seçime göre sadece bir grafik görünsün” istersen söyle, 2 satırda değiştiririm.
              */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformancePage;
