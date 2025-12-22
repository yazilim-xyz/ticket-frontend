import React, { useEffect, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import { formatDate, formatMessageTime, ChatUser } from "../services/chatApi";
import Sidebar from "../components/layouts/Sidebar";
import { useTheme } from "../context/ThemeContext";

const ChatPage: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  const {
    messages,
    users,
    selectedUser,
    isConnected,
    isLoadingMessages,
    isLoadingUsers,
    isSending,
    error,
    selectUser,
    sendMessage,
    clearError,
  } = useChat();

  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<ChatUser[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let result = [...users];
    
    if (searchQuery.trim() !== "") {
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    result.sort((a, b) => {
      // Eğer her ikisinin de lastMessageDate'i varsa, tarihe göre sırala
      if (a.lastMessageDate && b.lastMessageDate) {
        return new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime();
      }
      // lastMessageDate olanı öne al
      if (a.lastMessageDate && !b.lastMessageDate) return -1;
      if (!a.lastMessageDate && b.lastMessageDate) return 1;
      // Her ikisinde de yoksa isme göre sırala
      return a.name.localeCompare(b.name);
    });
    
    setFilteredUsers(result);
  }, [searchQuery, users]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    await sendMessage(input);
    setInput("");
  };

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


  const ThemeToggle = () => (
    <div className="flex items-center gap-2">
      <div className="relative">
        <svg
          className={`w-5 h-5 transition-colors ${isDarkMode ? "text-gray-600" : "text-yellow-500"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
        {!isDarkMode && (
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      <button
        onClick={toggleTheme}
        className="relative w-14 h-7 rounded-full transition-colors duration-300 bg-cyan-500"
        aria-label="Toggle theme"
      >
        <span
          className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            isDarkMode ? "translate-x-7" : "translate-x-0"
          }`}
        />
      </button>

      <div className="relative">
        <svg
          className={`w-5 h-5 transition-colors ${isDarkMode ? "text-blue-400" : "text-gray-800"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
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
  );

  const ConnectionStatus = () => (
    <div className={`flex items-center gap-1.5 text-xs ${isConnected ? "text-green-500" : "text-red-500"}`}>
      <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
      {isConnected ? "Bağlı" : "Bağlantı kesildi"}
    </div>
  );

  const ErrorAlert = () =>
    error && (
      <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
        <span>{error}</span>
        <button onClick={clearError} className="hover:opacity-80">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
    </div>
  );

  return (
    <div className={`flex h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <ErrorAlert />
      <Sidebar isDarkMode={isDarkMode} />

      <div className={`w-80 border-r ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} flex flex-col`}>
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-cyan-800 text-2xl font-semibold font-['Inter'] leading-9 mb-3"}`}>Messages</h2>
          <div className="relative">
            <svg
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500"
                  : "bg-white border-gray-200 text-gray-700 placeholder-gray-400"
              }`}
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {isLoadingUsers ? (
            <LoadingSpinner />
          ) : filteredUsers.length === 0 ? (
            <div className={`text-center py-8 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
              {searchQuery ? "User not found" : "There are no users yet"}
            </div>
          ) : (
            filteredUsers.map((u) => (
              <div
                key={u.id}
                onClick={() => selectUser(u)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  selectedUser?.id === u.id
                    ? isDarkMode
                      ? "bg-gray-700"
                      : "bg-teal-50"
                    : isDarkMode
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full ${
                    isDarkMode ? "bg-gray-600" : "bg-gray-800"
                  } flex items-center justify-center font-semibold text-white text-sm`}
                >
                  {getInitials(u.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm truncate ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}>
                    {u.name}
                  </p>
                  {u.lastMessage && (
                    <p className={`text-xs truncate ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                      {u.lastMessage}
                    </p>
                  )}
                </div>

                {u.lastMessageDate && (
                  <div className={`text-xs ml-2 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                    {formatDate(u.lastMessageDate)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className={`flex-1 flex flex-col ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
        {selectedUser ? (
          <>
            <div
              className={`px-6 py-4 border-b ${
                isDarkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
              } flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${
                    isDarkMode ? "bg-gray-600" : "bg-gray-800"
                  } flex items-center justify-center font-semibold text-white text-sm`}
                >
                  {getInitials(selectedUser.name)}
                </div>
                <div>
                  <p className={`font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}>
                    {selectedUser.name}
                  </p>
                  {selectedUser.email && (
                    <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {selectedUser.email}
                    </p>
                  )}
                </div>
              </div>
              <ThemeToggle />
            </div>

            {/* Messages Area */}
            <div className={`flex-1 p-6 space-y-3 overflow-y-auto ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
              {isLoadingMessages ? (
                <LoadingSpinner />
              ) : messages.length === 0 ? (
                <div className={`text-center py-8 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                  No messages yet. Send the first message!
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-md">
                      <div
                        className={`px-5 py-2.5 rounded-3xl text-sm shadow-sm ${
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
                      <p
                        className={`text-[10px] mt-1 ${msg.sender === "me" ? "text-right" : "text-left"} ${
                          isDarkMode ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        {formatMessageTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className={`px-6 py-4 border-t ${isDarkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  className={`flex-1 px-4 py-2.5 border rounded-full text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500"
                      : "bg-white border-gray-200 text-gray-700 placeholder-gray-400"
                  }`}
                  placeholder="Type your message here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  disabled={isSending || !isConnected}
                />

                <button
                  onClick={handleSend}
                  disabled={isSending || !input.trim() || !isConnected}
                  className={`p-2.5 rounded-full transition ${
                    input.trim() && isConnected
                      ? isDarkMode
                        ? "bg-teal-600 hover:bg-teal-700"
                        : "bg-teal-700 hover:bg-teal-800"
                      : isDarkMode
                      ? "bg-gray-700 cursor-not-allowed"
                      : "bg-gray-200 cursor-not-allowed"
                  }`}
                >
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg
                      className={`w-5 h-5 ${
                        input.trim() && isConnected ? "text-white" : isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className={`flex-1 flex flex-col ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
            <div
              className={`px-6 py-4 border-b ${
                isDarkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
              } flex items-center justify-end`}
            >
              <ThemeToggle />
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <svg
                  className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? "text-gray-600" : "text-gray-300"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className={`text-lg font-medium ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                  Select a user to start chat
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;