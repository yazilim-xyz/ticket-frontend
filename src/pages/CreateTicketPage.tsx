import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layouts/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { ticketService } from "../services/ticketService";
import {
  ArrowLeft,
  Ticket,
  FileText,
  User,
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

type Priority = "HIGH" | "MEDIUM" | "LOW" | "CRITICAL";
type Category = "BUG" | "FEATURE" | "SUPPORT" | "OTHER";

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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/pdf",
  "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "video/mp4", "video/webm",
  "audio/mpeg", "audio/wav",
];

const CreateTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState<Priority | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);

  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const canSubmit =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    priority !== null &&
    !isSubmitting;

  const selectedPriority = PRIORITY_OPTIONS.find((o) => o.value === priority);

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return Image;
    if (type.startsWith("video/")) return FileVideo;
    if (type.startsWith("audio/")) return FileAudio;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const simulateUploadProgress = (id: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setAttachments((prev) =>
        prev.map((att) => (att.id === id ? { ...att, progress: Math.min(progress, 100) } : att))
      );
    }, 200);
  };

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (file.size > MAX_FILE_SIZE) {
        setErrorMsg(`"${file.name}" dosyası çok büyük. Maksimum 10MB izin verilir.`);
        continue;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        setErrorMsg(`"${file.name}" dosya tipi desteklenmiyor.`);
        continue;
      }

      const newAttachment: AttachmentFile = { id: generateId(), file, progress: 0 };

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachments((prev) =>
            prev.map((att) =>
              att.id === newAttachment.id ? { ...att, preview: e.target?.result as string } : att
            )
          );
        };
        reader.readAsDataURL(file);
      }

      setAttachments((prev) => [...prev, newAttachment]);
      simulateUploadProgress(newAttachment.id);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const att = prev.find((x) => x.id === id);
      if (att?.preview) URL.revokeObjectURL(att.preview);
      return prev.filter((x) => x.id !== id);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrorMsg(null);

  if (!priority) {
    setErrorMsg("Please select a priority.");
    return;
  }

  const payload = {
    title: title.trim(),
    description: description.trim(),
    priority,
    category: category || undefined,
    createdById: 1, // şimdilik sabit
    dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
  };

  try {
    setIsSubmitting(true);

    // 1) Create ticket
    const createdTicket = await ticketService.createTicket(payload);
    console.log("Ticket created:", createdTicket);

    // 2) Assign (opsiyonel) - create'ten sonra
    const assignedToId = Number(assignee);
    if (assignee && !Number.isNaN(assignedToId)) {
      const updatedTicket = await ticketService.assignTicket(
        createdTicket.id,
        assignedToId
      );
      console.log("Ticket assigned:", updatedTicket);
    }

    setShowSuccessPopup(true);
  } catch (err) {
    console.error("Create ticket failed:", err);
    setErrorMsg(
      err instanceof Error ? err.message : "Failed to create ticket. Please try again."
    );
  } finally {
    setIsSubmitting(false);
  }
};


  const resetForm = () => {
    setTitle("");
    setCategory("");
    setAssignee("");
    setPriority(null);
    setDueDate("");
    setDescription("");
    setAttachments([]);
    setErrorMsg(null);
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"} transition-colors duration-300`}>
      <Sidebar isDarkMode={isDarkMode} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className={`p-2 rounded-xl transition-all ${
                  isDarkMode
                    ? "hover:bg-gray-800 text-gray-400 hover:text-gray-200"
                    : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                }`}
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className={`text-3xl font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                  Create Ticket
                </h1>
                <p className={`mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Fill in the details to create a new ticket
                </p>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center gap-2">
              <button onClick={toggleTheme} className="relative w-14 h-7 rounded-full transition-colors duration-300 bg-cyan-500" aria-label="Toggle theme">
                <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? "translate-x-7" : "translate-x-0"}`} />
              </button>
            </div>
          </div>

          {/* Error Toast */}
          {errorMsg && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${isDarkMode ? "bg-red-900/30 text-red-400" : "bg-red-50 text-red-700"}`}>
              <AlertCircle className="w-5 h-5" />
              <span className="flex-1 font-medium">{errorMsg}</span>
              <button onClick={() => setErrorMsg(null)} className="hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Form Card */}
          <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-sm overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"} flex items-center gap-3`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-teal-600/20" : "bg-teal-50"}`}>
                <Ticket className={`w-5 h-5 ${isDarkMode ? "text-teal-400" : "text-teal-600"}`} />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>Ticket Details</h2>
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Fields marked with * are required</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  <FileText className="w-4 h-4" />
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                    isDarkMode
                      ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-teal-500"
                      : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-teal-500"
                  } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                  placeholder="Enter a descriptive title for the ticket"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Category & Assignee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <FolderOpen className="w-4 h-4" />
                    Category
                  </label>

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category | "")}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                      isDarkMode
                        ? "bg-gray-700/50 border-gray-600 text-gray-100 focus:border-teal-500"
                        : "bg-gray-50 border-gray-200 text-gray-800 focus:border-teal-500"
                    } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                  >
                    <option value="">Select category</option>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <User className="w-4 h-4" />
                    Assigned to
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                      isDarkMode
                        ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-teal-500"
                        : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-teal-500"
                    } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                    placeholder="Full name (optional)"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                  />
                </div>
              </div>

              {/* Due Date & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <Calendar className="w-4 h-4" />
                    Due Date
                  </label>
                  <input
                    type="date"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                      isDarkMode
                        ? "bg-gray-700/50 border-gray-600 text-gray-100 focus:border-teal-500"
                        : "bg-gray-50 border-gray-200 text-gray-800 focus:border-teal-500"
                    } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <Flag className="w-4 h-4" />
                    Priority <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                        isDarkMode
                          ? "bg-gray-700/50 border-gray-600 text-gray-100 hover:border-teal-500"
                          : "bg-gray-50 border-gray-200 text-gray-800 hover:border-teal-500"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {selectedPriority ? (
                          <>
                            <span className={`w-2 h-2 rounded-full ${selectedPriority.bgColor}`} />
                            <span className="font-medium">{selectedPriority.label}</span>
                          </>
                        ) : (
                          <span className={isDarkMode ? "text-gray-500" : "text-gray-400"}>Select priority</span>
                        )}
                      </span>
                      <ChevronDown className={`w-5 h-5 transition-transform ${isPriorityOpen ? "rotate-180" : ""} ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                    </button>

                    {isPriorityOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsPriorityOpen(false)} />
                        <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-lg z-20 overflow-hidden ${isDarkMode ? "bg-gray-700 border border-gray-600" : "bg-white border border-gray-200"}`}>
                          {PRIORITY_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setPriority(opt.value);
                                setIsPriorityOpen(false);
                              }}
                              className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                                priority === opt.value
                                  ? isDarkMode
                                    ? "bg-teal-600/20 text-teal-400"
                                    : "bg-teal-50 text-teal-700"
                                  : isDarkMode
                                  ? "text-gray-300 hover:bg-gray-600"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <span className={`w-3 h-3 rounded-full ${opt.bgColor}`} />
                              <span className="font-medium">{opt.label}</span>
                              {priority === opt.value && <Check className="w-4 h-4 ml-auto" />}
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
                <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  <FileText className="w-4 h-4" />
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all resize-none ${
                    isDarkMode
                      ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-teal-500"
                      : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-teal-500"
                  } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                  placeholder="Provide a detailed description of the ticket..."
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
                <p className={`mt-2 text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>{description.length} characters</p>
              </div>

              {/* Attachments (UI var, backend yoksa payload'a sokmuyoruz) */}
              <div>
                <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  <Paperclip className="w-4 h-4" />
                  Attachments
                </label>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDragOver
                      ? isDarkMode
                        ? "border-teal-500 bg-teal-500/10"
                        : "border-teal-500 bg-teal-50"
                      : isDarkMode
                      ? "border-gray-600 hover:border-gray-500 hover:bg-gray-700/30"
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    accept={ALLOWED_TYPES.join(",")}
                    className="hidden"
                  />

                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                    <Upload className={`w-6 h-6 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                  </div>

                  <p className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Drop files here or click to upload</p>
                  <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>PNG, JPG, PDF, DOC, XLS up to 10MB</p>
                </div>

                {attachments.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {attachments.map((attachment) => {
                      const FileIcon = getFileIcon(attachment.file.type);
                      const isImage = attachment.file.type.startsWith("image/");
                      const isUploading = attachment.progress < 100;

                      return (
                        <div key={attachment.id} className={`flex items-center gap-3 p-3 rounded-xl ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                          <div className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center ${isDarkMode ? "bg-gray-600" : "bg-gray-200"}`}>
                            {isImage && attachment.preview ? (
                              <img src={attachment.preview} alt={attachment.file.name} className="w-full h-full object-cover" />
                            ) : (
                              <FileIcon className={`w-6 h-6 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>{attachment.file.name}</p>
                            <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>{formatFileSize(attachment.file.size)}</p>

                            {isUploading && (
                              <div className={`mt-2 h-1.5 rounded-full overflow-hidden ${isDarkMode ? "bg-gray-600" : "bg-gray-200"}`}>
                                <div className="h-full bg-teal-500 transition-all duration-300 ease-out" style={{ width: `${attachment.progress}%` }} />
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {isUploading ? (
                              <Loader2 className={`w-5 h-5 animate-spin ${isDarkMode ? "text-teal-400" : "text-teal-600"}`} />
                            ) : (
                              <Check className={`w-5 h-5 ${isDarkMode ? "text-green-400" : "text-green-600"}`} />
                            )}

                            <button
                              type="button"
                              onClick={() => removeAttachment(attachment.id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isDarkMode ? "hover:bg-red-500/20 text-gray-400 hover:text-red-400" : "hover:bg-red-50 text-gray-500 hover:text-red-600"
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className={`flex items-center justify-between pt-6 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                <button
                  type="button"
                  onClick={resetForm}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isDarkMode ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Reset Form
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                      isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
                      canSubmit
                        ? "bg-teal-600 hover:bg-teal-700 text-white hover:shadow-lg hover:shadow-teal-500/25"
                        : isDarkMode
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Create Ticket
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Success popup’ı istersen senin önceki uzun modalınla aynı şekilde geri ekleyebilirsin */}
          {showSuccessPopup && (
            <div className="mt-4 p-3 rounded-xl text-sm bg-green-50 text-green-700">
              Ticket created successfully.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTicketPage;
