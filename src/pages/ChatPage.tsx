import React, { useEffect, useState } from "react";
import { chatMockApi, ChatUser, ChatMessage } from "../services/chatMockApi";
import logo from "../assets/logo.png";

const ChatPage: React.FC = () => {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    chatMockApi.getUsers().then(setUsers);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      chatMockApi.getMessages(selectedUser.id).then(setMessages);
    }
  }, [selectedUser]);

  const handleSend = async () => {
    if (!selectedUser || !input.trim()) return;

    const newMsg = await chatMockApi.sendMessage(selectedUser.id, input);
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return parts[0][0];
  };

  const menuItems = [
    "Dashboard",
    "Active Tickets",
    "All Tickets",
    "Performance",
    "Chat",
    "Excel Reports",
    "AI Bot",
    "Calendar",
    "Admin Panel",
    "Settings"
  ];

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`flex items-start p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
        >
          <svg className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className={`${sidebarOpen ? 'w-56' : 'w-0'} ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col shadow-sm transition-all duration-300 overflow-hidden`}>
        <div className="flex flex-col items-center py-6 px-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
            <img 
              src={logo} 
              alt="Logo" 
              className="w-full h-full object-contain p-1"
            />
          </div>
          <h1 className={`text-base font-bold mt-3 text-center leading-tight ${darkMode ? 'text-teal-400' : 'text-teal-800'}`}>
            Enterprise<br />Ticket System
          </h1>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item}
              className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg transition text-sm ${
                item === "Chat"
                  ? darkMode 
                    ? "bg-teal-600 text-white shadow-md"
                    : "bg-teal-700 text-white shadow-md"
                  : darkMode
                    ? "hover:bg-gray-700 text-gray-300"
                    : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <span className="font-medium">{item}</span>
              <span className={`text-xs ${item === "Chat" ? "text-white" : darkMode ? "text-gray-500" : "text-gray-400"}`}>
                →
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className={`w-80 border-r ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} flex flex-col`}>
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Messages</h2>
          <div className="relative">
            <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search users..."
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500' 
                  : 'bg-white border-gray-200 text-gray-700 placeholder-gray-400'
              }`}
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {users.map((u) => (
            <div
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className={`flex items-center px-4 py-3 cursor-pointer border-b transition ${
                darkMode
                  ? `hover:bg-gray-700 border-gray-700 ${selectedUser?.id === u.id ? 'bg-gray-700' : ''}`
                  : `hover:bg-gray-50 border-gray-100 ${selectedUser?.id === u.id ? 'bg-gray-50' : ''}`
              }`}
            >
              <div className={`w-10 h-10 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-800'} flex items-center justify-center font-semibold text-white text-sm mr-3 flex-shrink-0`}>
                {getInitials(u.name)}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm truncate ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{u.name}</p>
              </div>

              <div className={`text-xs ml-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{u.lastMessageDate}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={`flex-1 flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {selectedUser ? (
          <>
            <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-800'} flex items-center justify-center font-semibold text-white text-sm`}>
                  {getInitials(selectedUser.name)}
                </div>
                <div>
                  <p className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{selectedUser.name}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Online · Last seen, 2.02pm
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <svg className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                <div className={`flex items-center rounded-full p-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <button 
                    onClick={() => setDarkMode(false)}
                    className={`p-1.5 rounded-full transition ${!darkMode ? darkMode ? "bg-gray-600 shadow-sm" : "bg-white shadow-sm" : ""}`}
                  >
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setDarkMode(true)}
                    className={`p-1.5 rounded-full transition ${darkMode ? darkMode ? "bg-gray-600 shadow-sm" : "bg-white shadow-sm" : ""}`}
                  >
                    <svg className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className={`flex-1 p-6 space-y-3 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
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
                        ? darkMode
                          ? "bg-teal-600 text-white"
                          : "bg-teal-700 text-white"
                        : darkMode
                          ? "bg-gray-700 text-gray-200"
                          : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center gap-3">
                <button className={`p-2 transition ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <input
                  type="text"
                  className={`flex-1 px-4 py-2.5 border rounded-full text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500'
                      : 'bg-white border-gray-200 text-gray-700 placeholder-gray-400'
                  }`}
                  placeholder="Type your message here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                />
                <button
                  onClick={handleSend}
                  className={`p-2.5 rounded-full transition ${
                    darkMode
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  <svg className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <svg className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className={`text-lg font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Select a user to start chat</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;