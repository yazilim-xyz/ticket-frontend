import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layouts/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { ticketService } from "../services/ticketService";
import { Ticket } from "../types";

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
  // TicketDetail sayfasındaki gibi: new, in_progress, completed, blocked
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

// --- Basit Pie görseli (CSS conic-gradient) ---
const PieLike: React.FC<{ buckets: StatusBucket }> = ({ buckets }) => {
  const total = buckets.notStarted + buckets.inProgress + buckets.done + buckets.deleted || 1;
  const a = (buckets.notStarted / total) * 360;
  const b = (buckets.inProgress / total) * 360;
  const c = (buckets.done / total) * 360;
  const d = (buckets.deleted / total) * 360;

  // figmadaki renklere yakın (tailwind class kullanmadan inline gradient)
  const bg = `conic-gradient(
    #2563EB 0deg ${a}deg,
    #F97316 ${a}deg ${a + b}deg,
    #16A34A ${a + b}deg ${a + b + c}deg,
    #DC2626 ${a + b + c}deg ${a + b + c + d}deg
  )`;

  return (
    <div className="w-full h-full flex items-center justify-center">
<Sidebar  isDarkMode={isDarkMode} />
      <div className="flex items-center gap-10">
        <div className="flex flex-col items-center">
          <div
            className="w-56 h-56 rounded-full"
            style={{ background: bg }}
            aria-label="Pie chart"
          />
        </div>

        <div className="text-xs text-zinc-700 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 inline-block" style={{ background: "#2563EB" }} />
            <span>not started</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 inline-block" style={{ background: "#F97316" }} />
            <span>in progress</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 inline-block" style={{ background: "#16A34A" }} />
            <span>done</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 inline-block" style={{ background: "#DC2626" }} />
            <span>deleted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Basit Bar görseli (figmadaki gibi 4 bar) ---
const BarLike: React.FC<{ buckets: StatusBucket }> = ({ buckets }) => {
  const totalTicket = buckets.notStarted + buckets.inProgress + buckets.done + buckets.deleted;
  const opened = buckets.notStarted; // senin örneğe yakın
  const inProgress = buckets.inProgress;
  const done = buckets.done;

  const max = Math.max(totalTicket, opened, inProgress, done, 1);
  const h = (v: number) => Math.round((v / max) * 180);

  const bars = [
    { label: "Total Ticket", value: totalTicket },
    { label: "Opened", value: opened },
    { label: "In Progress", value: inProgress },
    { label: "Done", value: done },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-[420px] h-[240px] border border-zinc-400 rounded-xl p-4">
        <div className="h-[180px] flex items-end justify-between gap-6 px-4">
          {bars.map((b) => (
            <div key={b.label} className="flex flex-col items-center gap-2">
              <div className="text-xs text-zinc-700">{b.value}</div>
              <div
                className="w-16 rounded-sm"
                style={{ height: `${h(b.value)}px`, background: "#0F766E" }}
                aria-label={`${b.label} bar`}
              />
              <div className="text-[11px] text-zinc-700 text-center w-20">
                {b.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PerformancePage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  // ✅ TEK grafik: default pie
  const [selectedChart, setSelectedChart] = useState<ChartType>("pie");

  // ✅ Filtre dropdown (Filter butonunun hemen sağı)
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [selectedPerson, setSelectedPerson] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>(""); // YYYY-MM-DD

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

  // dışarı tıklayınca filter kapanması
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

    // kişi filtresi
    if (selectedPerson !== "all") {
      data = data.filter((t) => getAssigneeLabel(t) === selectedPerson);
    }

    // tarih filtresi: seçilen tarih ve sonrası (createdAt üzerinden)
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

  return (
    <div className={`flex h-screen ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
      <Sidebar userRole="admin" isDarkMode={isDarkMode} />

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className={`h-24 px-8 py-5 border-b flex items-center justify-between ${isDarkMode ? "border-gray-700" : "border-zinc-200"}`}>
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

            <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-cyan-800"}`}>
              Performance Overview
            </h1>
          </div>

          {/* Dark/Light Toggle */}
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="relative w-14 h-7 rounded-full transition-colors duration-300 bg-cyan-500">
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                  isDarkMode ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          <div className="flex items-center gap-3">
            <button
              className={`h-10 pl-3 pr-4 py-2 rounded-lg border inline-flex items-center gap-3 ${
                isDarkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-neutral-200 text-black"
              }`}
              onClick={() => setIsFilterOpen((p) => !p)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-base">Filter</span>
            </button>
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setIsFilterOpen(true)}
                className={`h-10 px-4 rounded-lg border flex items-center gap-2 ${
                  isDarkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-neutral-200 text-black"
                }`}
              >
                <span className="text-sm font-medium">
                  {selectedPerson === "all" && !selectedDate
                    ? "No Filter (All)"
                    : `Person: ${selectedPerson === "all" ? "All" : selectedPerson}${selectedDate ? ` • Date: ${selectedDate}+` : ""}`}
                </span>
                <span className={`text-sm transition-transform ${isFilterOpen ? "rotate-180" : ""}`}>▾</span>
              </button>

              {isFilterOpen && (
                <div className={`absolute left-0 top-12 w-[340px] rounded-lg border shadow-lg z-10 ${
                  isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}>
                  <div className="p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`text-sm font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}>
                        Filters
                      </div>
                      <button
                        onClick={() => {
                          setSelectedPerson("all");
                          setSelectedDate("");
                          setIsFilterOpen(false);
                        }}
                        className="text-sm text-teal-600"
                      >
                        Clear
                      </button>
                    </div>

                    {/* Person */}
                    <div>
                      <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Person
                      </div>
                      <div className="max-h-40 overflow-auto border rounded-md">
                        {peopleOptions.map((p) => (
                          <button
                            key={p}
                            onClick={() => setSelectedPerson(p)}
                            className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                              selectedPerson === p
                                ? "bg-cyan-100 text-cyan-800"
                                : isDarkMode
                                  ? "text-gray-200 hover:bg-gray-700"
                                  : "text-gray-900 hover:bg-gray-50"
                            }`}
                          >
                            {p === "all" ? "All People" : p}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date */}
                    <div>
                      <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Date (and after)
                      </div>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className={`w-full h-10 px-3 rounded-md border ${
                          isDarkMode ? "bg-gray-900 border-gray-700 text-gray-200" : "bg-white border-gray-300 text-gray-900"
                        }`}
                      />
                    </div>

                    {/* Apply */}
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="w-full h-10 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-medium"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setSelectedChart((c) => (c === "pie" ? "bar" : "pie"))}
                className={`h-10 px-4 rounded-lg border flex items-center gap-2 ${
                  isDarkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-neutral-200 text-black"
                }`}
                title="Toggle chart"
              >
                <span className="text-sm font-medium">Chart: {selectedChart === "pie" ? "Pie" : "Bar"}</span>
                <span className="text-sm">↺</span>
              </button>
            </div>
          </div>
          <div className="mt-10">
            <div className={`w-[720px] h-[360px] rounded-xl outline outline-1 outline-offset-[-1px] mx-auto ${
              isDarkMode ? "bg-gray-800 outline-gray-700" : "bg-white outline-zinc-500"
            }`}>
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600" />
                </div>
              ) : selectedChart === "pie" ? (
                <PieLike buckets={buckets} />
              ) : (
                <BarLike buckets={buckets} />
              )}
            </div>

            {/* Alt metrikler (grafiğe göre değişir) */}
            <div className={`mt-10 w-[720px] mx-auto space-y-4 ${isDarkMode ? "text-gray-200" : "text-black"}`}>
              <div className="text-base font-medium">
                Average resolution time: {avgResolutionHours.toFixed(1)} hour
              </div>
              <div className="text-base font-medium">
                Overdue tickets : {overdueCount}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformancePage;
