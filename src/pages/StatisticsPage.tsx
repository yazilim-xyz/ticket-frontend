import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

function formatRelative(dt: Date) {
  const diffMs = Date.now() - dt.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day ago`;
}

function toGroup(status: Ticket["status"]): StatusGroup {
  // 4 kalem: not started / in progress / done / deleted
  if (status === "new") return "not_started";
  if (status === "in_progress" || status === "blocked") return "in_progress";
  if (status === "completed") return "done";
  return "deleted"; // cancelled vb.
}

const UserStatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { userId } = useParams<{ userId: string }>();

  // başlangıçta pie açık
  const [chart, setChart] = useState<ChartType>("pie");
  const [isOpen, setIsOpen] = useState(false);

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
    return Math.round((totalMs / n / 3600000) * 10) / 10; // 1 ondalık
  }, [tickets]);

  const lastUpdated = useMemo(() => {
    let best: Date | null = null;
    for (const t of tickets) {
      const u = safeDate(t.updatedAt);
      if (!u) continue;
      if (!best || u.getTime() > best.getTime()) best = u;
    }
    if (!best) return "—";
    const time = best.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `${time} ${formatRelative(best)}`;
  }, [tickets]);

  const lastCompleted = useMemo(() => {
    const done = tickets
      .filter((t) => toGroup(t.status) === "done")
      .sort((a, b) => (safeDate(b.updatedAt)?.getTime() ?? 0) - (safeDate(a.updatedAt)?.getTime() ?? 0));
    return done[0]?.title ?? "—";
  }, [tickets]);

  // Pie için oranlar
  const total = counts.not_started + counts.in_progress + counts.done + counts.deleted;
  const pct = (v: number) => (total === 0 ? 0 : (v / total) * 100);

  // basit “çalışan” pie: conic-gradient
  const PieVisual = () => {
    const a = pct(counts.not_started);
    const b = pct(counts.in_progress);
    const c = pct(counts.done);
    const d = pct(counts.deleted);

    // cyan / orange / green / red
    const bg = `conic-gradient(
      #0891b2 0% ${a}%,
      #f97316 ${a}% ${a + b}%,
      #16a34a ${a + b}% ${a + b + c}%,
      #dc2626 ${a + b + c}% 100%
    )`;

    return (
      <div className="w-[280px] h-[280px] rounded-full mx-auto" style={{ background: bg }}>
        <div className="w-[140px] h-[140px] bg-white rounded-full translate-x-[70px] translate-y-[70px]" />
      </div>
    );
  };

  // basit bar: figma’daki gibi 4 bar
  const BarVisual = () => {
    const max = Math.max(1, counts.not_started, counts.in_progress, counts.done, counts.deleted);
    const h = (v: number) => Math.round((v / max) * 180); // 180px max bar

    return (
      <div className="w-full h-[260px] relative">
        <div className="absolute left-[40px] top-[10px] right-[40px] bottom-[50px] border border-zinc-300 rounded-lg" />
        <div className="absolute left-[70px] top-[40px] flex gap-10 items-end">
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 bg-cyan-600" style={{ height: `${h(counts.not_started)}px` }} />
            <div className="text-xs">not started</div>
            <div className="text-xs font-semibold">{counts.not_started}</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 bg-orange-500" style={{ height: `${h(counts.in_progress)}px` }} />
            <div className="text-xs">in progress</div>
            <div className="text-xs font-semibold">{counts.in_progress}</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 bg-green-600" style={{ height: `${h(counts.done)}px` }} />
            <div className="text-xs">done</div>
            <div className="text-xs font-semibold">{counts.done}</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 bg-red-600" style={{ height: `${h(counts.deleted)}px` }} />
            <div className="text-xs">deleted</div>
            <div className="text-xs font-semibold">{counts.deleted}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
      <Sidebar userRole="admin" isDarkMode={isDarkMode} />

      {/* Figma canvas */}
      <div className="flex-1 overflow-auto">
        <div className="w-[1440px] h-[960px] relative bg-white">
          {/* Theme toggle ikon alanı (figma üst sağ) */}
          <div
            className="p-0.5 left-[1387px] top-[49px] absolute origin-top-left rotate-180 bg-sky-600 rounded-2xl inline-flex justify-start items-center gap-1 cursor-pointer"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            <div className="py-0.5 flex justify-start items-center">
              <div className="flex justify-start items-center gap-2.5">
                <div className="w-1 h-1" />
              </div>
              <div className="w-3 h-3 relative" />
            </div>
            <div className="w-4 h-4 relative rounded-[77px] shadow-[0px_2px_4px_0px_rgba(0,35,11,0.20)] overflow-hidden">
              <div className="w-4 h-4 left-0 top-0 absolute bg-white rounded-2xl" />
            </div>
          </div>

          {/* Başlık + back */}
          <div className="w-9 h-9 left-[332px] top-[80px] absolute overflow-hidden">
            <button
              onClick={() => navigate(-1)}
              className="w-full h-full flex items-center justify-center"
              aria-label="Back"
            >
              <div className="w-6 h-6 outline outline-4 outline-offset-[-2px] outline-cyan-800" />
            </button>
          </div>

          <div className="left-[408px] top-[84px] absolute justify-start text-cyan-800 text-2xl font-semibold font-['Inter']">
            User Statistics
          </div>

          {/* Sol user info (dinamik) */}
          <div className="w-96 h-48 left-[351px] top-[214px] absolute overflow-hidden">
            <div className="w-80 h-40 left-[49px] top-[40px] absolute justify-start text-black text-base font-semibold font-['Inter']">
              {`User Name: ${userInfo.name}`}
              <br />
              <br />
              {`Department: ${userInfo.department}`}
              <br />
              <br />
              {`E-mail: ${userInfo.email}`}
            </div>
          </div>

          {/* Alt sol metrikler (dinamik) */}
          <div className="w-96 h-64 left-[370px] top-[439px] absolute overflow-hidden">
            <div className="w-96 h-48 left-[22px] top-[38px] absolute justify-start text-black text-base font-semibold font-['Inter']">
              {`Average Resulotion Time: ${avgResolutionHours === 0 ? "—" : `${avgResolutionHours} Hour`}`}
              <br />
              <br />
              {`Overdue Tickets: ${overdue}`}
              <br />
              <br />
              {`Last Ticket Updated: ${lastUpdated}`}
              <br />
              <br />
              {`Last Completed Ticket: ${lastCompleted}`}
            </div>
          </div>

          {/* Dropdown başlık */}
          <div className="left-[899px] top-[98px] absolute justify-center text-black text-sm font-normal font-['Roboto'] leading-5">
            Select Chart
          </div>

          {/* Dropdown trigger (kapalıyken tek satır gibi davranacak) */}
          <button
            type="button"
            onClick={() => setIsOpen((p) => !p)}
            className="w-72 h-10 px-3 py-[5px] left-[874px] top-[127px] absolute bg-white outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex justify-between items-center gap-2 overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm border border-zinc-300 bg-white" />
              <div className="text-green-950/95 text-sm font-normal font-['Roboto'] leading-5">
                {chart === "pie" ? "Pie" : "Bar"}
              </div>
            </div>
            <div className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>▾</div>
          </button>

          {/* Dropdown list (Figma’da açık hali; biz state ile aç/kapatıyoruz) */}
          {isOpen && (
            <>
              
              <button
                type="button"
                onClick={() => {
                  setChart("pie");
                  setIsOpen(false);
                }}
                className="w-72 h-10 px-3 py-[5px] left-[874px] top-[159.34px] absolute bg-white outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex justify-start items-center gap-2 overflow-hidden"
              >
                <div className="flex justify-start items-center gap-2">
                  <div className="w-4 h-4 bg-white rounded-sm border border-zinc-300 flex items-center justify-center">
                    {chart === "pie" && <div className="w-2.5 h-2.5 bg-teal-600 rounded-sm" />}
                  </div>
                  <div className="justify-center text-green-950/95 text-sm font-normal font-['Roboto'] leading-5">Pie</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setChart("bar");
                  setIsOpen(false);
                }}
                className="w-72 h-10 px-3 py-[5px] left-[874px] top-[198px] absolute bg-white outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex justify-start items-center gap-2 overflow-hidden"
              >
                <div className="flex justify-start items-center gap-2">
                  <div className="w-4 h-4 bg-white rounded-sm border border-zinc-300 flex items-center justify-center">
                    {chart === "bar" && <div className="w-2.5 h-2.5 bg-teal-600 rounded-sm" />}
                  </div>
                  <div className="justify-center text-green-950/95 text-sm font-normal font-['Roboto'] leading-5">Bar</div>
                </div>
              </button>
            </>
          )}

          {/* Sağ grafik alanı (tek alan — seçilene göre değişir) */}
          <div className="w-[487px] h-72 left-[841px] top-[311px] absolute bg-white">
            <div className="w-full h-full flex items-center justify-center">
              {loading ? (
                <div className="text-sm text-gray-600">Loading...</div>
              ) : chart === "pie" ? (
                <div className="w-full">
                  <PieVisual />
                  {/* legend */}
                  <div className="mt-4 flex items-center justify-end gap-6 pr-6 text-xs font-['Inter']">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-cyan-600 inline-block" />not started</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-orange-500 inline-block" />in progress</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-600 inline-block" />done</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-600 inline-block" />deleted</div>
                  </div>
                </div>
              ) : (
                <BarVisual />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatisticsPage;
