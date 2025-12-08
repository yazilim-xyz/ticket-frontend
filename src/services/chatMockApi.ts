export interface ChatUser {
  id: number;
  name: string;
  lastMessageDate: string;
}

export interface ChatMessage {
  id: number;
  sender: "me" | "other";
  text: string;
}

// ------ MOCK DATA ------
export const mockUsers: ChatUser[] = [
  { id: 1, name: "Ezgi Yücel", lastMessageDate: "Oct 16" },
  { id: 2, name: "Ezgi Yücel", lastMessageDate: "Oct 16" },
  { id: 3, name: "Nisa Öztürk", lastMessageDate: "Oct 16" },
  { id: 4, name: "Beyzanur Aslan", lastMessageDate: "Oct 16" },
  { id: 5, name: "Türker Kıvılcım", lastMessageDate: "Oct 16" },
  { id: 6, name: "Beyda Ertek", lastMessageDate: "Oct 16" },
  { id: 7, name: "Vedat Tatlı", lastMessageDate: "Oct 16" },
  { id: 8, name: "Türker Kıvılcım", lastMessageDate: "Oct 16" },
  { id: 9, name: "Beyzanur Aslan", lastMessageDate: "Oct 16" },
  { id: 10, name: "Nisa Öztürk", lastMessageDate: "Oct 16" },
];

const mockMessages: Record<number, ChatMessage[]> = {
  1: [
    { id: 1, sender: "other", text: "Hey There!" },
    { id: 2, sender: "other", text: "How are you?" },
    { id: 3, sender: "me", text: "Hello!" },
    { id: 4, sender: "me", text: "I am fine and how are you?" },
    { id: 5, sender: "other", text: "I am doing well, Can we meet tomorrow?" },
    { id: 6, sender: "me", text: "Yes Sure!" }
  ],
  2: [
    { id: 7, sender: "other", text: "Merhaba!" },
    { id: 8, sender: "me", text: "Selam, nasılsın?" }
  ],
  3: [
    { id: 9, sender: "other", text: "Hey!" },
    { id: 10, sender: "me", text: "Hi there!" }
  ]
};

export const chatMockApi = {
  /*Get all users*/
  getUsers(): Promise<ChatUser[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockUsers), 300);
    });
  },

  /*Get messages for a specific user*/
  getMessages(userId: number): Promise<ChatMessage[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockMessages[userId] || []), 300);
    });
  },

  /*Send a new message*/
  sendMessage(userId: number, text: string): Promise<ChatMessage> {
    return new Promise((resolve) => {
      const msg: ChatMessage = {
        id: Date.now(),
        sender: "me",
        text
      };

      if (!mockMessages[userId]) {
        mockMessages[userId] = [];
      }
      mockMessages[userId].push(msg);

      resolve(msg);
    });
  }
};