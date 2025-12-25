import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layouts/Sidebar';
import { useTheme } from '../context/ThemeContext';
import { ticketService } from '../services/ticketService';
import { Ticket } from '../types';

const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isDarkMode, toggleTheme } = useTheme();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [solution, setSolution] = useState('');
  const [isSavingSolution, setIsSavingSolution] = useState(false);
  const handleSolutionSave = async () => {
    if (!ticket || !solution.trim()) return;

    try {
      setIsSavingSolution(true);
      await ticketService.updateResolution(ticket.id, solution.trim());

      // 1 saniye bekle, sonra sayfayı yenile
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Failed to save solution:', error);
      alert('Çözüm kaydedilemedi. Lütfen tekrar deneyin.');
      setIsSavingSolution(false);
    }
  };
  const safeDate = (v?: string | null) => {
    if (!v) return "-";
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? "-" : formatDate(v);
  };



  useEffect(() => {
    const fetchTicket = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await ticketService.getTicketById(id);
        setTicket(data);
        console.log(data)
        if (data) {
          setSelectedStatus(data.status);
          setSolution((data as any).resolutionSummary || '');
        }
      } catch (error) {
        console.error('Failed to fetch ticket:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);
  const handleStatusUpdate = async () => {
    if (!ticket || selectedStatus === ticket.status) return;

    try {
      setIsUpdating(true);
      await ticketService.updateTicket(ticket.id, { status: selectedStatus.toUpperCase() as any });

      // Refresh ticket data
      const updatedTicket = await ticketService.getTicketById(ticket.id);
      setTicket(updatedTicket);
      setSelectedStatus(updatedTicket.status);
      setShowStatusDropdown(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityStyle = (priority: string): string => {
    const baseStyle = "px-3 py-1 rounded-full text-sm font-medium border";
    switch (priority.toLowerCase()) {
      case 'high':
        return `${baseStyle} bg-red-50 text-red-700 border-red-200`;
      case 'medium':
        return `${baseStyle} bg-amber-50 text-amber-700 border-amber-200`;
      case 'low':
        return `${baseStyle} bg-emerald-50 text-emerald-700 border-emerald-200`;
      default:
        return `${baseStyle} bg-gray-50 text-gray-700 border-gray-200`;
    }
  };

  const getStatusStyle = (status: string): string => {
    const baseStyle = "px-3 py-1 rounded-full text-sm font-medium border";
    switch (status.toLowerCase()) {
      case 'NEW':
        return `${baseStyle} bg-blue-50 text-blue-700 border-blue-200`;
      case 'IN_PROGRESS':
        return `${baseStyle} bg-cyan-50 text-cyan-700 border-cyan-200`;
      case 'WAITING':
        return `${baseStyle} bg-amber-50 text-amber-700 border-amber-200`;
      case 'RESOLVED':
        return `${baseStyle} bg-emerald-50 text-emerald-700 border-emerald-200`;
      case 'CLOSED':
        return `${baseStyle} bg-red-50 text-red-700 border-red-200`;
      default:
        return `${baseStyle} bg-gray-50 text-gray-700 border-gray-200`;
    }
  };

  const getStatusText = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'in_progress':
        return 'In Progress';
      case 'new':
        return 'Not Started';
      case 'waiting':
        return 'Waiting';
      case 'resolved':
        return 'Done';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  };

  const getFileIconColor = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'text-red-500';
      case 'doc':
      case 'docx':
        return 'text-blue-500';
      case 'xls':
      case 'xlsx':
        return 'text-green-500';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'text-purple-500';
      case 'zip':
      case 'rar':
        return 'text-amber-500';
      default:
        return 'text-gray-500';
    }
  };




  const FileIcon: React.FC<{ fileName: string; className?: string }> = ({ fileName, className = '' }) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const colorClass = getFileIconColor(fileName);

    if (extension === 'pdf') {
      return (
        <svg className={`w-8 h-8 ${colorClass} ${className}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      );
    }

    if (extension === 'doc' || extension === 'docx') {
      return (
        <svg className={`w-8 h-8 ${colorClass} ${className}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      );
    }

    if (extension === 'xls' || extension === 'xlsx') {
      return (
        <svg className={`w-8 h-8 ${colorClass} ${className}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" />
        </svg>
      );
    }

    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension || '')) {
      return (
        <svg className={`w-8 h-8 ${colorClass} ${className}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      );
    }

    if (['zip', 'rar', '7z', 'tar'].includes(extension || '')) {
      return (
        <svg className={`w-8 h-8 ${colorClass} ${className}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
          <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      );
    }

    return (
      <svg className={`w-8 h-8 ${colorClass} ${className}`} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Ticket not found
            </p>
            <button
              onClick={() => navigate('/active-tickets')}
              className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
            >
              Back to Tickets
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusOptions = [
    { value: 'new', label: 'Not Started' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'waiting', label: 'Waiting' },
    { value: 'closed', label: 'Closed' },
    { value: 'resolved', label: 'Done' }
  ];

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <Sidebar isDarkMode={isDarkMode} />

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className={`h-24 px-8 py-5 border-b ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'} flex items-center justify-between`}>
          {/* Back Button & Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-cyan-800 text-2xl font-semibold font-['Inter']">
              Ticket Details
            </h1>
          </div>

          {/* Dark/Light Mode Toggle */}
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

            <button onClick={toggleTheme} className="relative w-14 h-7 rounded-full transition-colors duration-300 bg-cyan-500">
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

        {/* Content - 2 Column Layout */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Left Column - Main Content (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Ticket Info Card */}
              <div className={`rounded-lg border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      TICKET ID
                    </p>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {ticket.title}
                    </h2>
                  </div>
                  <span className={getStatusStyle(ticket.status)}>
                    {getStatusText(ticket.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Created Date
                    </p>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {formatDate(ticket.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Due Date
                    </p>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {safeDate((ticket as any).dueDate)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      category
                    </p>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {ticket.category}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Priority
                    </p>
                    <span className={getPriorityStyle(ticket.priority)}>
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description - READONLY for User */}
              <div className={`rounded-lg border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className="text-lg font-semibold mb-4">Description</h3>
                <textarea
                  value={ticket.description ?? ""}
                  readOnly // Kullanıcı değiştiremez
                  rows={6}
                  className={`w-full px-4 py-3 rounded-lg border text-sm leading-relaxed resize-none outline-none ${isDarkMode
                    ? 'bg-gray-900/50 border-gray-700 text-gray-400'
                    : 'bg-gray-100 border-gray-200 text-gray-600'
                    }`}
                />
                <p className="mt-2 text-xs opacity-50 italic text-red-500">
                  * This field is read-only. Only the reporter or admin can modify the description.
                </p>
              </div>

              {/* Attachments */}
              <div className={`rounded-lg border p-5 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <h3 className={`text-base font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      Attachments
                    </h3>
                  </div>

                  <button
                    onClick={handleAttachmentClick}
                    className={`px-1.5 rounded-lg border transition-colors flex items-center gap-2 ${isDarkMode
                      ? 'border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm font-medium">Add File</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {attachments.length === 0 ? (
                  <p className={`text-sm text-center py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No attachments. Click "Add File" to upload.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                          }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileIcon fileName={file.name} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                              {file.name}
                            </p>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveAttachment(index)}
                          className={`p-1.5 rounded-lg transition-colors ${isDarkMode
                            ? 'hover:bg-gray-600 text-gray-400 hover:text-red-400'
                            : 'hover:bg-gray-200 text-gray-500 hover:text-red-600'
                            }`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Solution - Editable for User */}
              <div className={`rounded-lg border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className="text-lg font-semibold mb-4">Solution</h3>
                <textarea
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  disabled={(ticket.status as any) === 'RESOLVED'} // Bilet bittiyse düzenleme kapansın
                  placeholder="Write the steps taken to resolve this ticket..."
                  className={`w-full px-4 py-3 rounded-lg border text-sm leading-relaxed resize-none focus:ring-2 focus:ring-cyan-500 outline-none transition-all ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                    : 'bg-white border-gray-300 text-gray-900'
                    } ${ticket.status === 'RESOLVED' ? 'opacity-60 cursor-not-allowed' : ''}`}
                  rows={6}
                />

                {ticket.status !== 'RESOLVED' && (
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handleSolutionSave}
                      disabled={isSavingSolution || !solution.trim()}
                      className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium disabled:opacity-50"
                    >
                      {isSavingSolution ? "Saving..." : "Save Solution"}
                    </button>
                  </div>
                )}
              </div>


            </div>

            {/* Right Column - Status & Assignment (1/3) */}
            <div className="space-y-6">
              {/* Update Status Card */}
              <div className={`rounded-lg border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  Update Status
                </h3>

                <div className="space-y-6">
                  {/* Status Dropdown */}
                  <div className="relative">
                    <label className={`text-xs font-semibold uppercase tracking-wider mb-2 block ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Status
                    </label>
                    <button
                      onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                      className={`w-full px-4 py-3 rounded-lg border text-left flex items-center justify-between transition-colors ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
                        : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400'
                        }`}
                    >
                      <span className="text-sm font-medium">
                        {getStatusText(selectedStatus)}
                      </span>
                      <svg className={`w-5 h-5 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showStatusDropdown && (
                      <div className={`absolute z-10 mt-2 w-full rounded-lg border shadow-lg ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                        }`}>
                        {statusOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSelectedStatus(option.value);
                              setShowStatusDropdown(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${selectedStatus === option.value
                              ? 'bg-cyan-50 text-cyan-700'
                              : isDarkMode
                                ? 'text-gray-200 hover:bg-gray-600'
                                : 'text-gray-900 hover:bg-gray-50'
                              } first:rounded-t-lg last:rounded-b-lg`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={handleStatusUpdate}
                    disabled={isUpdating || selectedStatus === ticket.status}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${isUpdating || selectedStatus === ticket.status
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-cyan-600 text-white hover:bg-cyan-700'
                      }`}
                  >
                    {isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Sending...
                      </>
                    ) : (
                      'Send'
                    )}
                  </button>
                </div>
              </div>

              {/* Assignment Info */}
              <div className={`rounded-lg border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  Assignment
                </h3>

                <div className="space-y-4">
                  {/* FROM */}
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      REPORTER (FROM):
                    </p>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {/* Biletin içindeki yaratan kişi bilgisini basıyoruz */}
                      {(ticket as any).createdBy?.fullName || (ticket as any).createdBy?.firstName ? `${(ticket as any).createdBy.firstName} ${(ticket as any).createdBy.lastName}` : "System Admin"}
                    </p>
                  </div>

                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      ASSIGNED TO:
                    </p>
                    {ticket.owner ? (
                      <div className="flex items-center gap-3">
                        {/* Avatar Kısmı: İsim ve Soyismin ilk harfleri */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {`${ticket.owner.firstName?.[0] || ''}${ticket.owner.lastName?.[0] || ''}`.toUpperCase()}
                        </div>

                        {/* İsim Bilgileri */}
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                            {`${ticket.owner.firstName} ${ticket.owner.lastName}`}
                          </p>
                          <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {(ticket.owner as any)?.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Eğer bilet henüz kimseye atanmamışsa gösterilecek durum */
                      <p className={`text-sm italic ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Not assigned yet
                      </p>
                    )}
                  </div>

                  {/* Last Update */}
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Last Update:
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {formatDateTime(ticket.updatedAt)}
                    </p>
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

export default TicketDetailPage;