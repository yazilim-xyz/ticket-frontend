import React, { useState, useRef, useEffect } from "react";
import { aiChatMockApi, AIChatMessage, ChatSession } from "../services/aiChatMockApi";
import { Sparkles, Send, Plus, MessageSquare } from "lucide-react";
import Sidebar from "../components/layouts/Sidebar";
import logo from "../assets/logo.png";

const AiChatBotPage: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    aiChatMockApi.getChatSessions().then(setSessions);
  }, []);

  useEffect(() => {
    if (currentSession) {
      aiChatMockApi.getSessionMessages(currentSession.id).then(setMessages);
    }
  }, [currentSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    let sessionToUse = currentSession;

    if (!sessionToUse) {
      sessionToUse = await aiChatMockApi.createNewSession(input);
      setCurrentSession(sessionToUse);
      setSessions((prev) => [sessionToUse!, ...prev]);
    }

    const userMessage = await aiChatMockApi.sendMessage(sessionToUse.id, input);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const aiResponse = await aiChatMockApi.getAIResponse(sessionToUse.id, input);
    setMessages((prev) => [...prev, aiResponse]);
    setIsTyping(false);
  };

  const handleNewChat = async () => {
    const newSession = await aiChatMockApi.createNewSession();
    setCurrentSession(newSession);
    setSessions((prev) => [newSession, ...prev]);
    setMessages([]);
  };

  const handleSelectSession = (session: ChatSession) => {
    setCurrentSession(session);
  };

  const groupedSessions = sessions.reduce((acc, session) => {
    if (!acc[session.category]) {
      acc[session.category] = [];
    }
    acc[session.category].push(session);
    return acc;
  }, {} as Record<string, ChatSession[]>);


  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <Sidebar isDarkMode={darkMode} />

      {/* Chat Geçmişi Sİdebar */}
      <div className={`w-80 border-r ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} flex flex-col`}>
        <div className={`p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="mb-4">
            <h2 className={`text-xl font-bold ${darkMode ? "text-gray-200" : "text-gray-900"}`}>
              ENTERPRISE
              <br />
              <span className="text-sm font-normal">CHATBOT</span>
            </h2>
          </div>

          <button 
            onClick={handleNewChat}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full font-medium transition ${darkMode ? "bg-teal-600 hover:bg-teal-700 text-white" : "bg-teal-700 hover:bg-teal-800 text-white"}`}
          >
            <Plus className="w-5 h-5" />
            New Chat
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-2">
          {Object.entries(groupedSessions).map(([category, sessionList]) => (
            <div key={category} className="mb-4">
              <h3 className={`text-xs font-semibold mb-2 px-2 ${darkMode ? "text-teal-400" : "text-teal-700"}`}>
                {category}
              </h3>
              {sessionList.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSelectSession(session)}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg transition text-left mb-1 ${
                    currentSession?.id === session.id
                      ? darkMode
                        ? "bg-gray-700"
                        : "bg-gray-100"
                      : darkMode
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-100"
                  }`}
                >
                  <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {session.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Ana Chat Kısmı*/}
      <div className={`flex-1 flex flex-col ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className={`px-6 py-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} flex items-center justify-between`}>
          <div className="flex-1"></div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className={`w-6 h-6 ${darkMode ? "text-teal-400" : "text-teal-600"}`} />
              <h1 className={`text-2xl font-bold ${darkMode ? "text-gray-200" : "text-gray-900"}`}>
                Ask our AI anything
              </h1>
            </div>
          </div>
          <div className="flex-1 flex justify-end">
            <div className={`flex items-center rounded-full p-1 ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
              <button
                onClick={() => setDarkMode(false)}
                className={`p-1.5 rounded-full transition ${!darkMode ? (darkMode ? "bg-gray-600 shadow-sm" : "bg-white shadow-sm") : ""}`}
              >
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setDarkMode(true)}
                className={`p-1.5 rounded-full transition ${darkMode ? (darkMode ? "bg-gray-600 shadow-sm" : "bg-white shadow-sm") : ""}`}
              >
                <svg className={`w-4 h-4 ${darkMode ? "text-blue-400" : "text-gray-600"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mesajlar Kısmı */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          {messages.length > 0 ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="flex items-start gap-3 max-w-2xl">
                    {msg.sender === "ai" && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${darkMode ? "bg-teal-600" : "bg-teal-700"}`}>
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div>
                      <div className={`text-xs font-semibold mb-1 ${msg.sender === "user" ? "text-right" : ""} ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {msg.sender === "user" ? "ME" : "OUR AI"}
                      </div>
                      <div
                        className={`px-5 py-3 rounded-2xl ${
                          msg.sender === "user"
                            ? darkMode
                              ? "bg-gray-800 text-gray-200"
                              : "bg-white text-gray-800 shadow-sm"
                            : darkMode
                              ? "bg-teal-900/30 text-gray-200"
                              : "bg-teal-50 text-gray-800"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                      </div>
                    </div>
                    {msg.sender === "user" && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${darkMode ? "bg-gray-700" : "bg-gray-300"}`}>
                        <span className="text-xs font-semibold text-gray-600">ME</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${darkMode ? "bg-teal-600" : "bg-teal-700"}`}>
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className={`px-5 py-3 rounded-2xl ${darkMode ? "bg-teal-900/30" : "bg-teal-50"}`}>
                      <div className="flex gap-1">
                        <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? "bg-teal-400" : "bg-teal-600"}`} style={{ animationDelay: "0ms" }}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? "bg-teal-400" : "bg-teal-600"}`} style={{ animationDelay: "150ms" }}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? "bg-teal-400" : "bg-teal-600"}`} style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="text-center">
                <Sparkles className={`w-16 h-16 mx-auto mb-4 ${darkMode ? "text-teal-500" : "text-teal-600"}`} />
                <p className={`text-lg font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Start a conversation with AI
                </p>
                <p className={`text-sm mt-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  Ask me anything about your projects
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Input Kısmı */}
        <div className={`px-6 py-6 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="max-w-4xl mx-auto">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-full border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-sm"}`}>
              <input
                type="text"
                className={`flex-1 bg-transparent outline-none text-sm ${darkMode ? "text-gray-200 placeholder-gray-500" : "text-gray-700 placeholder-gray-400"}`}
                placeholder="Ask me anything about your projects"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={`p-2 rounded-full transition ${
                  input.trim()
                    ? darkMode
                      ? "bg-teal-600 hover:bg-teal-700 text-white"
                      : "bg-teal-700 hover:bg-teal-800 text-white"
                    : darkMode
                      ? "bg-gray-700 text-gray-500"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiChatBotPage;