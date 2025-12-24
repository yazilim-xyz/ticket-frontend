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
  AlertCircle,
  X,
  Paperclip,
  Upload,
  File,
  Image,
  FileVideo,
  FileAudio,
  Trash2,
} from "lucide-react";

// Tipler
type Priority = "HIGH" | "MEDIUM" | "LOW" | "CRITICAL";
type Category = "BUG" | "FEATURE" | "SUPPORT" | "OTHER";
type DBUser = { id: number; fullName: string; role?: string };

type AttachmentFile = {
  id: string;
  file: File;
  preview?: string;
  progress: number;
};

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string; bgColor: string }[] = [
  { value: "HIGH", label: "HIGH", color: "text-red-500", bgColor: "bg-red-500" },
  { value: "MEDIUM", label: "MEDIUM", color: "text-orange-500", bgColor: "bg-orange-500" },
  { value: "LOW", label: "LOW", color: "text-green-500", bgColor: "bg-green-500" },
  { value: "CRITICAL", label: "CRITICAL", color: "text-red-700", bgColor: "bg-red-700" },
];

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "BUG", label: "Bug" },
  { value: "FEATURE", label: "Feature" },
  { value: "SUPPORT", label: "Support" },
  { value: "OTHER", label: "Other" },
];

const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf", "text/plain"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const CreateTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [assignee, setAssignee] = useState<string>(""); // Seçilen User ID
  const [priority, setPriority] = useState<Priority | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);

  // UI & Data State
  const [users, setUsers] = useState<DBUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // 1. Veritabanından Kullanıcıları Çek
  useEffect(() => {
  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const data = await ticketService.getUsers(); // Servise eklediğimiz yeni metod
      setUsers(data);
    } catch (err) {
      console.error("User fetch error:", err);
    } finally {
      setIsLoadingUsers(false);
    }
  };
  fetchUsers();
}, []);

  const selectedPriority = PRIORITY_OPTIONS.find((o) => o.value === priority);
  const selectedUser = users.find((u) => String(u.id) === assignee);

const canSubmit = title.trim() && description.trim() && priority && assignee && !isSubmitting;

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!priority) return setErrorMsg("Please select a priority.");

    try {
      setIsSubmitting(true);
      
      
      const createdTicket = await ticketService.createTicket({
        title: title.trim(),
        description: description.trim(),
        priority,
        category: category || undefined,
      });

    
      if (assignee && createdTicket.id) {
        await ticketService.assignTicket(String(createdTicket.id), Number(assignee));
      }

      setShowSuccessPopup(true);
      setTimeout(() => navigate("/tickets"), 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };
  // Yardımcı Fonksiyonlar (Dosya işlemleri vb. aynı kalıyor)
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className={`flex h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"} transition-colors duration-300`}>
      <Sidebar isDarkMode={isDarkMode} />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className={`p-2 rounded-xl ${isDarkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-600"}`}>
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className={`text-3xl font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>Create Ticket</h1>
              </div>
            </div>
            <button onClick={toggleTheme} className="relative w-14 h-7 rounded-full bg-cyan-500">
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${isDarkMode ? "translate-x-7" : ""}`} />
            </button>
          </div>

          <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-sm overflow-hidden`}>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Title */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2 opacity-80">
                  <FileText className="w-4 h-4" /> Title *
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${isDarkMode ? "bg-gray-700/50 border-gray-600 text-white" : "bg-gray-50 border-gray-200"}`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Category */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2 opacity-80">
                    <FolderOpen className="w-4 h-4" /> Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className={`w-full px-4 py-3 rounded-xl border-2 ${isDarkMode ? "bg-gray-700/50 border-gray-600 text-white" : "bg-gray-50 border-gray-200"}`}
                  >
                    <option value="">Select category</option>
                    {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>

                {/* Assigned To (Custom Dropdown) */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2 opacity-80">
                    <UserIcon className="w-4 h-4" /> Assigned to
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsAssigneeOpen(!isAssigneeOpen)}
                      className={`w-full px-4 py-3 rounded-xl border-2 flex items-center justify-between ${isDarkMode ? "bg-gray-700/50 border-gray-600 text-white" : "bg-gray-50 border-gray-200"}`}
                    >
                      <span className="flex items-center gap-2">
                        {selectedUser ? (
                          <>
                            <div className="w-6 h-6 rounded-full bg-teal-500 text-[10px] flex items-center justify-center text-white">
                              {getInitials(selectedUser.fullName)}
                            </div>
                            <span>{selectedUser.fullName}</span>
                          </>
                        ) : (
                          <span className="opacity-50">Select a person</span>
                        )}
                      </span>
                      {isLoadingUsers ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isAssigneeOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsAssigneeOpen(false)} />
                        <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200 border"}`}>
                          {users.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => { setAssignee(String(user.id)); setIsAssigneeOpen(false); }}
                              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-teal-500/10 ${assignee === String(user.id) ? "bg-teal-500/20 text-teal-400" : ""}`}
                            >
                              <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs">{getInitials(user.fullName)}</div>
                              <div className="text-left">
                                <p className="text-sm font-medium">{user.fullName}</p>
                                <p className="text-[10px] opacity-50">{user.role || 'Staff'}</p>
                              </div>
                              {assignee === String(user.id) && <Check className="w-4 h-4 ml-auto" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Priority & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2 opacity-80"><Calendar className="w-4 h-4" /> Due Date</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={`w-full px-4 py-3 rounded-xl border-2 ${isDarkMode ? "bg-gray-700/50 border-gray-600 text-white" : "bg-gray-50 border-gray-200"}`} />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2 opacity-80"><Flag className="w-4 h-4" /> Priority *</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                      className={`w-full px-4 py-3 rounded-xl border-2 flex items-center justify-between ${isDarkMode ? "bg-gray-700/50 border-gray-600 text-white" : "bg-gray-50 border-gray-200"}`}
                    >
                      <span className="flex items-center gap-2">
                        {selectedPriority ? (
                          <>
                            <span className={`w-2 h-2 rounded-full ${selectedPriority.bgColor}`} />
                            <span>{selectedPriority.label}</span>
                          </>
                        ) : <span className="opacity-50">Select priority</span>}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {isPriorityOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsPriorityOpen(false)} />
                        <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl z-20 ${isDarkMode ? "bg-gray-700" : "bg-white"} border ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}>
                          {PRIORITY_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => { setPriority(opt.value); setIsPriorityOpen(false); }}
                              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-teal-500/10 ${priority === opt.value ? "text-teal-500" : ""}`}
                            >
                              <span className={`w-2 h-2 rounded-full ${opt.bgColor}`} />
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2 opacity-80">Description *</label>
                <textarea
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl border-2 resize-none ${isDarkMode ? "bg-gray-700/50 border-gray-600 text-white" : "bg-gray-50 border-gray-200"}`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-700/20">
                <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-xl font-medium opacity-70 hover:opacity-100">Cancel</button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`px-8 py-2.5 rounded-xl font-medium flex items-center gap-2 ${canSubmit ? "bg-teal-600 text-white" : "bg-gray-700 text-gray-500 cursor-not-allowed"}`}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Create Ticket
                </button>
              </div>

            </form>
          </div>
          {showSuccessPopup && <div className="mt-4 p-4 bg-green-500/20 text-green-500 rounded-xl text-center border border-green-500/30">Ticket created successfully! Redirecting...</div>}
        </div>
      </div>
    </div>
  );
};

export default CreateTicketPage;