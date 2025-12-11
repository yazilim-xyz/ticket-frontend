import React, { useState, useRef, useEffect } from 'react';
import { TeamChatMessage } from '../../types';
import { useNavigate } from 'react-router-dom';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !onSendMessage) return;

    try {
      // Recipient ID - gerçek uygulamada seçili kullanıcıdan gelecek
      const recipientId = 'user_456'; // Ezgi Yücel
      await onSendMessage(recipientId, inputMessage);
      setInputMessage('');
      setAttachedFiles([]); // Clear attached files after sending
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

  // Get current chat user info (first message sender)
  const chatUser = messages.find(m => !m.isOwn);
  const userAvatar = chatUser?.senderAvatar || 'EY';
  const userName = chatUser?.senderName || 'Ezgi Yücel';

  return (
    <div className={`
      rounded-lg border h-[550px] flex flex-col
      ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}
    `}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'} flex items-center justify-between flex-shrink-0`}>
        <div className="flex items-center gap-3">
          <h3 className={`text-lg font-semibold font-['Inter'] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Team Chat
          </h3>
          <span className={`text-xs font-medium ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
            3 online
          </span>
        </div>
        
         {/* Three dots menu - Navigate to Chat Page */}
        <button 
          onClick={handleNavigateToChat}
          className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'} transition-colors`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* User Info */}
      <div className={`px-6 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'} flex items-center gap-3 flex-shrink-0`}>
        <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white text-sm font-semibold">
          {userAvatar}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {userName}
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
            Online - Last seen, 2:02pm
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              No messages yet
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                    message.isOwn
                      ? 'bg-cyan-500 text-white rounded-br-none'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-100 rounded-bl-none'
                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Attached Files Preview */}
      {attachedFiles.length > 0 && (
        <div className={`px-6 py-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'} flex-shrink-0`}>
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
                  isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span className="max-w-[100px] truncate">{file.name}</span>
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  ({formatFileSize(file.size)})
                </span>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className={`ml-1 ${isDarkMode ? 'hover:text-red-400' : 'hover:text-red-600'}`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'} flex items-center gap-3 flex-shrink-0`}>
        {/* Attachment Button */}
        <button 
          onClick={handleAttachmentClick}
          className={`p-2 rounded-lg transition-colors ${
            isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
          disabled={sending}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Input */}
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          disabled={sending}
          className={`flex-1 px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
          } ${sending ? 'opacity-50 cursor-not-allowed' : ''}`}
        />

        {/* Send Button */}
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || sending}
          className={`p-2 rounded-lg transition-colors ${
            inputMessage.trim() && !sending
              ? 'bg-cyan-600 text-white hover:bg-cyan-700'
              : isDarkMode
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {sending ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default TeamChat;