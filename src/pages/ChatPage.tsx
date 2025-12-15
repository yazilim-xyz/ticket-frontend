import React, { useEffect, useState, useRef } from "react";
import { chatMockApi, ChatUser, ChatMessage } from "../services/chatMockApi";
import Sidebar from "../components/layouts/Sidebar";
import { useTheme } from "../context/ThemeContext";

const ChatPage: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatMockApi.getUsers().then((data) => {
      setUsers(data);
      setFilteredUsers(data);
    });
  }, []);

  useEffect(() => {
    if (selectedUser) {
      chatMockApi.getMessages(selectedUser.id).then(setMessages);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const handleSend = async () => {
    if (!selectedUser || !input.trim()) return;

    const newMsg = await chatMockApi.sendMessage(selectedUser.id, input);
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setAttachedFiles([]);
  }; 

  const handleDeleteChat = (userId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm("Bu sohbeti silmek istediğinizden emin misiniz?");
    if (confirmed) {
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
        setMessages([]);
      }
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return parts[0][0];
  };

  

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar  isDarkMode={isDarkMode} />

      <div className={`w-80 border-r ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} flex flex-col`}>
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-cyan-800 text-2xl font-semibold font-['Inter'] leading-9 mb-3"}`}>Messages</h2>
          <div className="relative">
            <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="innput"
              placeholder="Search users..."
              value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500' 
                  : 'bg-white border-gray-200 text-gray-700 placeholder-gray-400'
              }`}
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className={`flex items-center px-4 py-3 cursor-pointer border-b transition group ${
                isDarkMode
                  ? `hover:bg-gray-700 border-gray-700 ${selectedUser?.id === u.id ? 'bg-gray-700' : ''}`
                  : `hover:bg-gray-50 border-gray-100 ${selectedUser?.id === u.id ? 'bg-gray-50' : ''}`
              }`}
            >
              <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-800'} flex items-center justify-center font-semibold text-white text-sm mr-3 flex-shrink-0`}>
                {getInitials(u.name)}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{u.name}</p>
              </div>

              <div className={`text-xs ml-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{u.lastMessageDate}</div>

              <button
                onClick={(e) => handleDeleteChat(u.id, e)}
                className={`ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500 hover:bg-opacity-10 ${
                  isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'
                }`}
                title="Sohbeti Sil"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {selectedUser ? (
          <>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-800'} flex items-center justify-center font-semibold text-white text-sm`}>
                  {getInitials(selectedUser.name)}
                </div>
                <div>
                  <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{selectedUser.name}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Online · Last seen, 2.02pm
                  </p>
                </div>
              </div>

              {/* Dark/Light Mode Toggle - FIXED */}
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

            <div className={`flex-1 p-6 space-y-3 overflow-y-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-5 py-2.5 rounded-3xl text-sm max-w-md shadow-sm ${
                      msg.sender === "me"
                        ? isDarkMode
                          ? "bg-teal-600 text-white"
                          : "bg-teal-700 text-white"
                        : isDarkMode
                          ? "bg-gray-700 text-gray-200"
                          : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              {/* File Preview Area */}
              {attachedFiles.length > 0 && (
                <div className={`mb-3 pb-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex flex-wrap gap-2">
                    {attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
                          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}
                      >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="max-w-[100px] truncate">{file.name}</span>
                      <span className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        ({formatFileSize(file.size)})
                      </span>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className={`ml-1 hover:text-red-500 transition-colors ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        
            <div className="flex items-center gap-3">
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Attachment Button */}
              <button 
                onClick={handleAttachmentClick}
                  className={`p-2 transition ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                {/* Message Input */}
                <input
                  type="text"
                  className={`flex-1 px-4 py-2.5 border rounded-full text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500'
                      : 'bg-white border-gray-200 text-gray-700 placeholder-gray-400'
                  }`}
                  placeholder="Type your message here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                />

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={!input.trim() && attachedFiles.length === 0}
                  className={`p-2.5 rounded-full transition ${
                    input.trim() || attachedFiles.length > 0
                      ? isDarkMode
                        ? 'bg-teal-600 hover:bg-teal-700'
                        : 'bg-teal-700 hover:bg-teal-800'
                      : isDarkMode
                        ? 'bg-gray-700 cursor-not-allowed'
                        : 'bg-gray-200 cursor-not-allowed'
                  }`}
                >
                  <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} flex items-center justify-end`}>
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

            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <svg className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Select a user to start chat</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;