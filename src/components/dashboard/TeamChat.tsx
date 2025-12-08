import React, { useState } from 'react';

interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  isOwn: boolean;
}

interface TeamChatProps {
  isDarkMode?: boolean;
}

const TeamChat: React.FC<TeamChatProps> = ({ isDarkMode = false }) => {
  const [message, setMessage] = useState('');
  
  // TODO: Backend'den gelecek gerçek mesajlar
  const [messages] = useState<Message[]>([
    { id: 1, sender: 'Ezgi Yücel', text: 'Hey There!', time: '2:02pm', isOwn: false },
    { id: 2, sender: 'Ezgi Yücel', text: 'How are you?', time: '2:02pm', isOwn: false },
    { id: 3, sender: 'You', text: 'Hello!', time: '2:03pm', isOwn: true },
    { id: 4, sender: 'You', text: 'I am fine and how are you?', time: '2:03pm', isOwn: true },
    { id: 5, sender: 'Ezgi Yücel', text: 'I am doing well, Can we meet tomorrow?', time: '2:04pm', isOwn: false },
    { id: 6, sender: 'You', text: 'Yes Sure!', time: '2:04pm', isOwn: true }
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      // TODO: Backend'e mesaj gönder
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <div className={`
      rounded-lg border flex flex-col h-[450px]
      ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}
    `}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'}`}>
        <div className="flex items-center gap-3">
          <h3 className={`text-lg font-semibold font-['Inter'] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Team Chat
          </h3>
          <span className="text-xs text-emerald-500 font-medium">3 online</span>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* User Info */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
            EY
          </div>
          <div>
            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Ezgi Yücel</p>
            <p className="text-xs text-emerald-500">Online - Last seen, 2.02pm</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[70%] px-4 py-2 rounded-2xl
              ${msg.isOwn 
                ? 'bg-cyan-600 text-white rounded-br-none' 
                : isDarkMode 
                  ? 'bg-gray-700 text-white rounded-bl-none'
                  : 'bg-gray-100 text-gray-900 rounded-bl-none'
              }
            `}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'}`}>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message here..."
            className={`
              flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-cyan-500
              ${isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }
            `}
          />
          <button 
            onClick={handleSendMessage}
            className="p-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamChat;