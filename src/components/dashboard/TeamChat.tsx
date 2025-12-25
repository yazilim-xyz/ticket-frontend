import React, { useState, useRef, useEffect } from 'react';
import { TeamChatMessage } from '../../types';
import { useNavigate } from 'react-router-dom';
import { chatApi, ChatUser } from '../../services/chatApi';

interface TeamChatProps {
  isDarkMode?: boolean;
  messages?: TeamChatMessage[];
  onSendMessage?: (recipientId: string, text: string) => Promise<void>;
  loading?: boolean;
  sending?: boolean;
}

const TeamChat: React.FC<TeamChatProps> = ({ 
  isDarkMode = false,
  messages = [],
  onSendMessage,
  loading = false,
  sending = false,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Fetch users for chat list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        const users = await chatApi.getAllUsers();
        setChatUsers(users);
      } catch (error) {
        console.error('Failed to fetch chat users:', error);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !onSendMessage) return;

    try {
      const recipientId = 'user_456';
      await onSendMessage(recipientId, inputMessage);
      setInputMessage('');
      setAttachedFiles([]);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Navigate to Chat Page
  const handleNavigateToChat = () => {
    navigate('/chat');
  };

  // Navigate to Chat Page with specific user
  const handleUserClick = (userId: number) => {
    navigate(`/chat?userId=${userId}`);
  };

  // Get initials from name
  const getInitials = (name: string) => {
    if (!name) return "?";
    const letters = name
      .split(" ")
      .filter(Boolean)
      .map(word => word[0])
      .slice(0, 2)
      .join("");
    return letters.toUpperCase();
  };

  // Loading state
  if (loading) {
    return (
      <div className={`
        rounded-lg border h-[450px] flex items-center justify-center
        ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}
      `}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-2"></div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      rounded-lg border h-[550px] flex flex-col
      ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}
    `}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'} flex items-center justify-between flex-shrink-0`}>
        <div className="flex items-center gap-3">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Team Chat
          </h3>
          <span className={`text-xs font-medium ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
            {chatUsers.length} users
          </span>
        </div>
        
        {/* View All - Navigate to Chat Page */}
        <button 
          onClick={handleNavigateToChat}
          className={`text-sm font-medium ${isDarkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'} transition-colors`}
        >
          View All →
        </button>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {usersLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-600"></div>
          </div>
        ) : chatUsers.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              No users available
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {chatUsers.slice(0, 8).map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserClick(user.id)}
                className={`
                  flex items-center gap-3 px-6 py-3 cursor-pointer transition-colors
                  ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                `}
              >
                {/* Avatar */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold
                  ${isDarkMode ? 'bg-cyan-600' : 'bg-cyan-700'}
                `}>
                  {getInitials(user.name)}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {user.name}
                  </p>
                  {user.email && (
                    <p className={`text-xs truncate ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {user.email}
                    </p>
                  )}
                </div>

                {/* Last Message */}
                {user.lastMessage && (
                  <p className={`text-xs truncate max-w-[100px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {user.lastMessage}
                  </p>
                )}

                {/* Arrow Icon */}
                <svg 
                  className={`w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - Quick Action */}
      <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'} flex-shrink-0`}>
        <button
          onClick={handleNavigateToChat}
          className={`
            w-full py-2.5 rounded-lg text-sm font-medium transition-colors
            ${isDarkMode 
              ? 'bg-cyan-600 hover:bg-cyan-700 text-white' 
              : 'bg-cyan-600 hover:bg-cyan-700 text-white'
            }
          `}
        >
          Open Full Chat
        </button>
      </div>
    </div>
  );
};

export default TeamChat;