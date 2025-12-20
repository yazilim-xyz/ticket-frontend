import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layouts/Sidebar";
import { useTheme } from "../context/ThemeContext";
import {
  FileText,
  User,
  Calendar,
  Flag,
  ChevronDown,
  Loader2,
  Check,
  Paperclip,
  Upload,
  File,
  Image,
  FileVideo,
  FileAudio,
  Trash2,
  AlertCircle,
  X
} from "lucide-react";

type Priority = "high" | "medium" | "low";
type Status = "new" | "in_progress" | "blocked" | "completed";

type AttachmentFile = {
  id: string;
  file: File;
  preview?: string;
  progress: number;
};

type CreateTicketPayload = {
  id?: string;
  title: string;
  description: string;
  project?: string;
  dueDate?: string;
  priority: Priority;
  status?: Status;
  assignee?: string;
  attachments?: File[];
};

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string; bgColor: string }[] = [
  { value: "high", label: "High", color: "text-red-500", bgColor: "bg-red-500" },
  { value: "medium", label: "Medium", color: "text-orange-500", bgColor: "bg-orange-500" },
  { value: "low", label: "Low", color: "text-green-500", bgColor: "bg-green-500" },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'video/mp4', 'video/webm',
  'audio/mpeg', 'audio/wav'
];

const CreateTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [project, setProject] = useState("");
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
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return FileVideo;
    if (type.startsWith('audio/')) return FileAudio;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      // Dosya boyutu kontrolü
      if (file.size > MAX_FILE_SIZE) {
        setErrorMsg(`"${file.name}" dosyası çok büyük. Maksimum 10MB izin verilir.`);
        continue;
      }

      // Dosya tipi kontrolü
      if (!ALLOWED_TYPES.includes(file.type)) {
        setErrorMsg(`"${file.name}" dosya tipi desteklenmiyor.`);
        continue;
      }

      const newAttachment: AttachmentFile = {
        id: generateId(),
        file,
        progress: 0
      };

      // Resim ise önizleme oluştur
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachments(prev => 
            prev.map(att => 
              att.id === newAttachment.id 
                ? { ...att, preview: e.target?.result as string }
                : att
            )
          );
        };
        reader.readAsDataURL(file);
      }

      setAttachments(prev => [...prev, newAttachment]);

      // Simüle upload progress
      simulateUploadProgress(newAttachment.id);
    }
  };

  const simulateUploadProgress = (id: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setAttachments(prev =>
        prev.map(att =>
          att.id === id ? { ...att, progress: Math.min(progress, 100) } : att
        )
      );
    }, 200);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = ''; // Reset input
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
    setAttachments(prev => {
      const attachment = prev.find(att => att.id === id);
      if (attachment?.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
      return prev.filter(att => att.id !== id);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!priority) {
      setErrorMsg("Please select a priority.");
      return;
    }

    const payload: CreateTicketPayload = {
      title: title.trim(),
      description: description.trim(),
      project: project.trim() || undefined,
      assignee: assignee.trim() || undefined,
      priority,
      status: "new",
      dueDate: dueDate || undefined,
      attachments: attachments.map(att => att.file),
    };

    try {
      setIsSubmitting(true);
      // await ticketService.createTicket(payload);
      console.log("Ticket payload:", payload);
      setShowSuccessPopup(true);
    } catch (err) {
      console.error("Create ticket failed:", err);
      setErrorMsg("Failed to create ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setProject("");
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

      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className={`px-6 py-6 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h1 className="text-cyan-800 text-2xl font-semibold font-['Inter'] leading-7">
              Create Ticket
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
          
          {/* SCROLLABLE AREA*/}
          <div className="flex-1 min-h-0 overflow-y-auto px-8 py-2">
            <div className="mx-auto w-full max-w-9xl">
            {/* Form Card */}
            <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-sm overflow-hidden`}>
              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-3 space-y-3">
              {errorMsg && (
                <div
                  className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${
                    isDarkMode
                      ? "bg-red-500/10 border-red-500/30 text-red-300"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold leading-5">Error</p>
                    <p className="text-xs leading-4 opacity-90 break-words">{errorMsg}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrorMsg(null)}
                    className={`p-1 rounded-md transition ${
                      isDarkMode ? "hover:bg-red-500/10" : "hover:bg-red-100"
                    }`}
                    aria-label="Close error"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}  
              
                {/* Title */}
                <div>
                  <label className={`flex items-center gap-2 text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <FileText className="w-4 h-4" />
                    Title <span className="text-red-500">*</span> 
                    <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Fields marked with * are required</p>
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 rounded-xl border-2 transition-all text-sm ${
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

                {/* Assigned to / Due Date / Priority Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">                  {/* Assigned to */}
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      <User className="w-4 h-4" />
                      Assigned to
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 rounded-xl border-2 transition-all text-sm ${
                        isDarkMode
                          ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-teal-500"
                          : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-teal-500"
                      } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                      placeholder="Person or team (optional)"
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                    />
                  </div>
                  
                  {/* Due Date & Priority Row */}
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      <Calendar className="w-4 h-4" />
                      Due Date
                    </label>
                    <input
                      type="date"
                      className={`w-full px-3 py-2 rounded-xl border-2 transition-all text-sm ${
                        isDarkMode
                          ? "bg-gray-700/50 border-gray-600 text-gray-100 focus:border-teal-500"
                          : "bg-gray-50 border-gray-200 text-gray-800 focus:border-teal-500"
                      } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                
                  {/* Priority */}
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      <Flag className="w-4 h-4" />
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                        className={`w-full px-4 py-2 rounded-xl border-2 transition-all text-sm  ${
                          isDarkMode
                            ? "bg-gray-700/50 border-gray-600 text-gray-100 hover:border-teal-500"
                            : "bg-gray-50 border-gray-200 text-gray-800 hover:border-teal-500"
                        } ${isPriorityOpen ? (isDarkMode ? 'border-teal-500' : 'border-teal-500') : ''}`}
                      >
                        <span className="flex items-center gap-1">
                          {selectedPriority ? (
                            <>
                              <span className={`w-2 h-2 rounded-full ${selectedPriority.bgColor}`} />
                              <span className="font-medium">{selectedPriority.label}</span>
                            </>
                          ) : (
                            <span className={isDarkMode ? "text-gray-500" : "text-gray-400"}>Select priority</span>
                          )}
                        <ChevronDown className={`w-5 h-5 transition-transform ${isPriorityOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        </span>
                      </button>

                      {isPriorityOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setIsPriorityOpen(false)} />
                          <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-lg z-20 overflow-hidden ${
                            isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'
                          }`}>
                            {PRIORITY_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  setPriority(opt.value);
                                  setIsPriorityOpen(false);
                                }}
                                className={`w-full px-4 py-2 flex items-center gap-3 transition-colors ${
                                  priority === opt.value
                                    ? isDarkMode ? 'bg-teal-600/20 text-teal-400' : 'bg-teal-50 text-teal-700'
                                    : isDarkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <span className={`w-3 h-3 rounded-full ${opt.bgColor}`} />
                                <span className="font-medium">{opt.label}</span>
                                {priority === opt.value && (
                                  <Check className="w-4 h-4 ml-auto" />
                                )}
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
                  <label className={`flex items-center gap-1 text-sm font-medium mb-0.5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <FileText className="w-3 h-3.5" />
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className={`w-full px-4 py-2 rounded-xl border-2 transition-all ${
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
                  <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {description.length} characters
                  </p>
                </div>

                {/* Attachments Section */}
                <div>
                  <label className={`flex items-center gap-1 text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <Paperclip className="w-4 h-4" />
                    Attachments
                  </label>

                  {/* Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      isDragOver
                        ? isDarkMode
                          ? 'border-teal-500 bg-teal-500/10'
                          : 'border-teal-500 bg-teal-50'
                        : isDarkMode
                          ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/30'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      accept={ALLOWED_TYPES.join(',')}
                      className="hidden"
                    />
                  
                    <div className={`w-8 h-8 mx-auto mb-1 rounded-xl flex items-center justify-center ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <Upload className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                  
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Drop files here or click to upload
                    </p>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      PNG, JPG, PDF, DOC, XLS up to 10MB
                    </p>
                  </div>

                  {/* Attachment List */}
                  {attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {attachments.map((attachment) => {
                        const FileIcon = getFileIcon(attachment.file.type);
                        const isImage = attachment.file.type.startsWith('image/');
                        const isUploading = attachment.progress < 100;

                        return (
                          <div
                            key={attachment.id}
                            className={`flex items-center gap-2 p-2 rounded-xl ${
                              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                            }`}
                          >
                            {/* Preview / Icon */}
                            <div className={`w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center ${
                              isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                            }`}>
                              {isImage && attachment.preview ? (
                                <img
                                  src={attachment.preview}
                                  alt={attachment.file.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FileIcon className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                              )}
                            </div>

                            {/* File Info */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                {attachment.file.name}
                              </p>
                              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                {formatFileSize(attachment.file.size)}
                              </p>
                            
                              {/* Progress Bar */}
                              {isUploading && (
                                <div className={`mt-2 h-1.5 rounded-full overflow-hidden ${
                                  isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                                }`}>
                                  <div
                                    className="h-full bg-teal-500 transition-all duration-300 ease-out"
                                    style={{ width: `${attachment.progress}%` }}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Status / Remove */}
                          <div className="flex items-center gap-2">
                              {isUploading ? (
                                <Loader2 className={`w-5 h-5 animate-spin ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
                              ) : (
                                <Check className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                              )}
                            
                              <button
                                type="button"
                                onClick={() => removeAttachment(attachment.id)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isDarkMode
                                    ? 'hover:bg-red-500/20 text-gray-400 hover:text-red-400'
                                    : 'hover:bg-red-50 text-gray-500 hover:text-red-600'
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

                  {/* Attachment Count */}
                  {attachments.length > 0 && (
                    <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {attachments.length} file{attachments.length > 1 ? 's' : ''} attached
                    </p>
                  )}
                </div>

                {/* Form Actions */}
                <div className={`flex items-center justify-between pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    type="button"
                    onClick={resetForm}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isDarkMode
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Reset Form
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                        isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
                        canSubmit
                          ? 'bg-teal-600 hover:bg-teal-700 text-white hover:shadow-lg hover:shadow-teal-500/25'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
            </div>
          </div>
        </div>
      </div>

      {showSuccessPopup && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div
          className={`w-full max-w-sm rounded-2xl p-4 shadow-lg ${
            isDarkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="font-semibold">Ticket created</p>
            <button
              type="button"
              onClick={() => setShowSuccessPopup(false)}
              className={`p-1 rounded-md ${
                isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
              aria-label="Close popup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className={`mt-2 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            Your ticket has been created successfully.
          </p>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowSuccessPopup(false);
                resetForm();
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium ${
                isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Create another
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white"
            >
              Close
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTicketPage;

