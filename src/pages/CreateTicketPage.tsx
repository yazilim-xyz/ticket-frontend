import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layouts/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { ticketService } from "../services/ticketService";
import {
  ArrowLeft,
  FileText,
  User as UserIcon,
  Calendar,
  Flag,
  FolderOpen,
  ChevronDown,
  Loader2,
  Check,
  Layers,
  X,
} from "lucide-react";

// Tipler
type Priority = "HIGH" | "MEDIUM" | "LOW" | "CRITICAL";
type Category = "BUG" | "FEATURE" | "SUPPORT" | "OTHER";
type DBUser = { id: number; fullName: string; role?: string };

// Seçenek Tanımlamaları
const PRIORITY_OPTIONS: { value: Priority; label: string; color: string; bgColor: string }[] = [
  { value: "CRITICAL", label: "Critical", color: "text-purple-500", bgColor: "bg-purple-500" },
  { value: "HIGH", label: "High", color: "text-red-500", bgColor: "bg-red-500" },
  { value: "MEDIUM", label: "Medium", color: "text-orange-500", bgColor: "bg-orange-500" },
  { value: "LOW", label: "Low", color: "text-green-500", bgColor: "bg-green-500" },
];

const CATEGORY_OPTIONS: { value: Category; label: string; icon: string }[] = [
  { value: "BUG", label: "Bug", icon: "🐛" },
  { value: "FEATURE", label: "Feature", icon: "🚀" },
  { value: "SUPPORT", label: "Support", icon: "🎧" },
  { value: "OTHER", label: "Other", icon: "📁" },
];

const CreateTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Auth & Role
  const userRole = localStorage.getItem('userRole') || '';
  const isAdmin = userRole.toUpperCase() === 'ADMIN';

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [assignee, setAssignee] = useState<string>(""); 
  const [priority, setPriority] = useState<Priority | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  // UI & Data State
  const [users, setUsers] = useState<DBUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Veritabanından Kullanıcıları Çek (Sadece Admin için veya herkes için ayarlanabilir)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const data = await ticketService.getUsers();
        setUsers(data);
      } catch (err) {
        console.error("User fetch error:", err);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // Yardımcı Fonksiyonlar
  const getMinDate = () => new Date().toISOString().split('T')[0];
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();
  const selectedPriority = PRIORITY_OPTIONS.find((o) => o.value === priority);
  const selectedUser = users.find((u) => String(u.id) === assignee);
  const canSubmit = title.trim() && description.trim() && priority && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!priority) return;

    try {
      setIsSubmitting(true);
      await ticketService.createTicket({
        title: title.trim(),
        description: description.trim(),
        priority,
        category: category || undefined,
        assignedToUserId: assignee ? Number(assignee) : undefined,
        dueDate: dueDate || undefined,
      } as any);

      setShowSuccessPopup(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"} transition-colors duration-300 overflow-hidden`}>
      <Sidebar isDarkMode={isDarkMode} />

      {/* ANA İÇERİK ALANI */}
      <div className="flex-1 flex flex-col min-h-0">
        
        {/* HEADER - SABİT ÜST ŞERİT */}
        <div className={`px-8 py-6 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-600"}`}>
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className={`text-2xl font-bold font-['Inter'] ${isDarkMode ? "text-gray-100" : "text-cyan-800"}`}>Create Ticket</h1>
                <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Create and assign tickets to team members</p>
              </div>
            </div>
            <button onClick={toggleTheme} className="relative w-14 h-7 rounded-full bg-cyan-500 shadow-md">
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-sm ${isDarkMode ? "translate-x-7" : ""}`} />
            </button>
          </div>
        </div>

        {/* SCROLLABLE AREA - SAYFAYA YAYILAN İÇERİK */}
        <div className="flex-1 min-h-0 overflow-y-auto px-10 py-8 scrollbar-thin scrollbar-thumb-gray-400">
          <div className="mx-auto w-full max-w-9xl"> 
            
            <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-xl overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <form onSubmit={handleSubmit} className="p-10 space-y-10">

                {/* Title */}
                <div className="w-full">
                  <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <FileText className="w-4 h-4 text-cyan-600" /> Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full px-5 py-4 rounded-xl border-2 text-lg transition-all ${isDarkMode ? "bg-gray-700/50 border-gray-600 text-white" : "bg-gray-50 border-gray-200"} focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 outline-none`}
                    placeholder="Enter a descriptive title for the ticket"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Grid 1: Priority & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Priority Dropdown */}
                  <div className="relative">
                    <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}><Flag className="w-4 h-4 text-cyan-600" /> Priority *</label>
                    <button type="button" onClick={() => setIsPriorityOpen(!isPriorityOpen)} className={`w-full px-5 py-4 rounded-xl border-2 flex items-center justify-between ${isDarkMode ? "bg-gray-700/50 border-gray-600 text-white" : "bg-gray-50 border-gray-200"} hover:border-teal-500 transition-colors`}>
                      <span className="flex items-center gap-3">
                        {selectedPriority ? <><div className={`w-3 h-3 rounded-full ${selectedPriority.bgColor}`} />{selectedPriority.label}</> : <span className="opacity-50">Select priority</span>}
                      </span>
                      <ChevronDown className={`w-5 h-5 transition-transform ${isPriorityOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isPriorityOpen && (
                      <div className={`absolute top-full left-0 right-0 mt-2 z-50 rounded-xl shadow-2xl border overflow-hidden ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"}`}>
                        {PRIORITY_OPTIONS.map(opt => (
                          <button key={opt.value} type="button" onClick={() => { setPriority(opt.value); setIsPriorityOpen(false); }} className={`w-full px-5 py-4 flex items-center gap-3 transition-colors hover:bg-teal-500/10 ${priority === opt.value ? "bg-teal-500/5 text-teal-500" : "dark:text-gray-200"}`}>
                            <div className={`w-3 h-3 rounded-full ${opt.bgColor}`} /> {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Category Dropdown */}
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}><Layers className="w-4 h-4 text-cyan-600" /> Category</label>
                    <div className="relative">
                      <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className={`w-full px-5 py-4 rounded-xl border-2 appearance-none transition-all ${isDarkMode ? "bg-gray-700/50 border-gray-600 text-white" : "bg-gray-50 border-gray-200"} focus:border-teal-500 focus:outline-none`}>
                        <option value="">Select category</option>
                        {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>)}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none opacity-50" />
                    </div>
                  </div>
                </div>

                {/* Grid 2: Due Date & Assignee */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}><Calendar className="w-4 h-4 text-cyan-600" /> Due Date</label>
                    <input type="date" min={getMinDate()} value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={`w-full px-5 py-4 rounded-xl border-2 transition-all ${isDarkMode ? "bg-gray-700/50 border-gray-600 text-white" : "bg-gray-50 border-gray-200"} focus:border-teal-500 outline-none`} />
                  </div>

                  <div className="relative">
                    <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}><UserIcon className="w-4 h-4 text-cyan-600" /> Assign To</label>
                    <button type="button" onClick={() => setIsAssigneeOpen(!isAssigneeOpen)} className={`w-full px-5 py-4 rounded-xl border-2 flex items-center justify-between ${isDarkMode ? "bg-gray-700/50 border-gray-600 text-white" : "bg-gray-50 border-gray-200"} hover:border-teal-500 transition-colors`}>
                      <span className="flex items-center gap-3">
                        {selectedUser ? <><div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold">{getInitials(selectedUser.fullName)}</div>{selectedUser.fullName}</> : <span className="opacity-50">Select user</span>}
                      </span>
                      {isLoadingUsers ? <Loader2 className="w-4 h-4 animate-spin text-teal-500" /> : <ChevronDown className={`w-5 h-5 transition-transform ${isAssigneeOpen ? 'rotate-180' : ''}`} />}
                    </button>
                    {isAssigneeOpen && (
                      <div className={`absolute top-full left-0 right-0 mt-2 z-50 max-h-64 overflow-y-auto rounded-xl shadow-2xl border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"}`}>
                        {users.map(user => (
                          <button key={user.id} type="button" onClick={() => { setAssignee(String(user.id)); setIsAssigneeOpen(false); }} className={`w-full px-5 py-4 flex items-center gap-4 hover:bg-teal-500/10 border-b last:border-0 border-gray-100 dark:border-gray-600 transition-colors`}>
                            <div className="w-9 h-9 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs">{getInitials(user.fullName)}</div>
                            <div className="text-left">
                              <p className={`text-sm font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>{user.fullName}</p>
                              <p className="text-[11px] opacity-50 uppercase tracking-wider">{user.role || 'Member'}</p>
                            </div>
                            {assignee === String(user.id) && <Check className="ml-auto w-4 h-4 text-teal-500" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="w-full">
                  <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Description *</label>
                  <textarea
                    rows={6}
                    className={`w-full px-5 py-4 rounded-xl border-2 resize-none transition-all ${isDarkMode ? "bg-gray-700/50 border-gray-600 text-white" : "bg-gray-50 border-gray-200"} focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 outline-none`}
                    placeholder="Provide a detailed description of the ticket..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between pt-8 border-t border-gray-100 dark:border-gray-700">
                  <button type="button" onClick={() => {setTitle(""); setDescription(""); setPriority(null); setCategory("");}} className="text-gray-500 hover:text-red-500 font-medium transition-colors text-sm">Reset Form</button>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => navigate(-1)} className={`px-8 py-3 rounded-xl font-medium ${isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"} transition-all`}>Cancel</button>
                    <button type="submit" disabled={!canSubmit} className={`px-10 py-3 rounded-xl font-bold flex items-center gap-3 shadow-lg transition-all ${canSubmit ? "bg-teal-600 text-white hover:bg-teal-700 shadow-teal-500/20 active:scale-95" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                      Create Ticket
                    </button>
                  </div>
                </div>

              </form>
            </div>
            
            {/* Feedback Messages */}
            {errorMsg && (
              <div className="mt-6 p-4 bg-red-500/10 text-red-500 rounded-xl text-center border border-red-500/20 font-medium">
                {errorMsg}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SUCCESS POPUP MODAL */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className={`w-full max-w-md rounded-3xl p-10 shadow-2xl text-center animate-in zoom-in-95 duration-300 ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
              <Check className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Ticket Created! 🎉</h2>
            <p className="text-sm opacity-70 mb-8 leading-relaxed">Your ticket has been logged successfully and is now being tracked in the system.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => navigate('/all-tickets')} className="w-full py-4 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/25">View All Tickets</button>
              <button onClick={() => { setShowSuccessPopup(false); setTitle(""); setDescription(""); setPriority(null); setCategory(""); }} className="w-full py-4 opacity-50 font-semibold hover:opacity-100 transition-all">Create Another</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTicketPage;