import React, { useState, useRef, useEffect } from "react";
import { aiChatMockApi, AIChatMessage, ChatSession } from "../services/aiChatMockApi";
import { Sparkles, Send, Plus, MessageSquare,Trash2} from "lucide-react";
import Sidebar from "../components/layouts/Sidebar";
import { useTheme } from "../context/ThemeContext";

const AiChatBotPage: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState("");
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

  const handleDeleteSession = async (
  sessionId: string,
  e: React.MouseEvent
) => {
  e.stopPropagation();

  const confirmed = window.confirm("Bu sohbeti silmek istediğinize emin misiniz?");
  if (!confirmed) return;

  await aiChatMockApi.deleteSession(sessionId);

  setSessions((prev) => prev.filter((s) => s.id !== sessionId));

  if (currentSession?.id === sessionId) {
    setCurrentSession(null);
    setMessages([]);
  }
};

  const groupedSessions = sessions.reduce((acc, session) => {
    if (!acc[session.category]) {
      acc[session.category] = [];
    }
    acc[session.category].push(session);
    return acc;
  }, {} as Record<string, ChatSession[]>);


  return (
    <div className={`flex h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <Sidebar isDarkMode={isDarkMode} />

      {/* Chat Geçmişi Sİdebar */}
      <div className={`w-80 border-r ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} flex flex-col`}>
        <div className={`p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="mb-4">
            <h2 className={`text-xl font-bold ${isDarkMode? "text-gray-200" : "text-gray-900"}`}>
              ENTERPRISE
              <br />
              <span className="text-sm font-normal">CHATBOT</span>
            </h2>
          </div>

          <button 
            onClick={handleNewChat}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full font-medium transition ${isDarkMode ? "bg-teal-600 hover:bg-teal-700 text-white" : "bg-teal-700 hover:bg-teal-800 text-white"}`}
          >
            <Plus className="w-5 h-5" />
            New Chat
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-2">
          {Object.entries(groupedSessions).map(([category, sessionList]) => (
            <div key={category} className="mb-4">
              <h3 className={`text-xs font-semibold mb-2 px-2 ${isDarkMode ? "text-teal-400" : "text-teal-700"}`}>
                {category}
              </h3>
              {sessionList.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session)}
                  className={`group w-full flex items-start gap-3 px-3 py-2.5 rounded-lg transition text-left mb-1 ${
                    currentSession?.id === session.id
                      ? isDarkMode
                        ? "bg-gray-700"
                        : "bg-gray-100"
                      : isDarkMode
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-100"
                  }`}
                >
                  <button
                    onClick={() => handleSelectSession(session)}
                    className="flex items-start gap-3 flex-1 min-w-0 text-left"
                  >
                  <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {session.title}
                    </p>
                  </div>
                </button>
                <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/10 ${isDarkMode ? "text-gray-400 hover:text-red-400" : "text-gray-500 hover:text-red-600"}`}
                    title="Sohbeti sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Ana Chat Kısmı*/}
      <div className={`flex-1 flex flex-col ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className={`px-6 py-4 border-b ${isDarkMode? "border-gray-700" : "border-gray-200"} flex items-center justify-between`}>
          <div className="flex-1"></div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className={`w-6 h-6 ${isDarkMode ? "text-teal-400" : "text-teal-600"}`} />
              <h1 className={`text-2xl font-bold ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}>
                Ask our AI anything
              </h1>
            </div>
          </div>

          {/* Dark/Light Mode Toggle - FIXED */}
          <div className="flex-1 flex justify-end items-center gap-2">
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

        {/* Mesajlar Kısmı */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          {messages.length > 0 ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="flex items-start gap-3 max-w-2xl">
                    {msg.sender === "ai" && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDarkMode ? "bg-teal-600" : "bg-teal-700"}`}>
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div>
                      <div className={`text-xs font-semibold mb-1 ${msg.sender === "user" ? "text-right" : ""} ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {msg.sender === "user" ? "ME" : "OUR AI"}
                      </div>
                      <div
                        className={`px-5 py-3 rounded-2xl ${
                          msg.sender === "user"
                            ? isDarkMode
                              ? "bg-gray-800 text-gray-200"
                              : "bg-white text-gray-800 shadow-sm"
                            : isDarkMode
                              ? "bg-teal-900/30 text-gray-200"
                              : "bg-teal-50 text-gray-800"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                      </div>
                    </div>
                    {msg.sender === "user" && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}>
                        <span className="text-xs font-semibold text-gray-600">ME</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDarkMode ? "bg-teal-600" : "bg-teal-700"}`}>
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className={`px-5 py-3 rounded-2xl ${isDarkMode ? "bg-teal-900/30" : "bg-teal-50"}`}>
                      <div className="flex gap-1">
                        <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? "bg-teal-400" : "bg-teal-600"}`} style={{ animationDelay: "0ms" }}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? "bg-teal-400" : "bg-teal-600"}`} style={{ animationDelay: "150ms" }}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? "bg-teal-400" : "bg-teal-600"}`} style={{ animationDelay: "300ms" }}></div>
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
                <Sparkles className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? "text-teal-500" : "text-teal-600"}`} />
                <p className={`text-lg font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Start a conversation with AI
                </p>
                <p className={`text-sm mt-2 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                  Ask me anything about your projects
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Input Kısmı */}
        <div className={`px-6 py-6 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="max-w-4xl mx-auto">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-full border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-sm"}`}>
              <input
                type="text"
                className={`flex-1 bg-transparent outline-none text-sm ${isDarkMode ? "text-gray-200 placeholder-gray-500" : "text-gray-700 placeholder-gray-400"}`}
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
                    ? isDarkMode
                      ? "bg-teal-600 hover:bg-teal-700 text-white"
                      : "bg-teal-700 hover:bg-teal-800 text-white"
                    : isDarkMode
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