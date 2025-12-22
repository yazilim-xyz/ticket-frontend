// ============================================
// useChat Hook - WebSocket + REST Chat Management
// ============================================

import { useState, useEffect, useCallback, useRef } from "react";
import {
  chatApi,
  wsService,
  ChatMessage,
  ChatUser,
  getCurrentUserId,
} from "../services/chatApi";

interface UseChatOptions {
  autoConnect?: boolean;
}

interface UseChatReturn {
  // State
  messages: ChatMessage[];
  users: ChatUser[];
  selectedUser: ChatUser | null;
  isConnected: boolean;
  isLoadingMessages: boolean;
  isLoadingUsers: boolean;
  isSending: boolean;
  error: string | null;

  // Actions
  selectUser: (user: ChatUser) => void;
  sendMessage: (text: string) => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshUsers: () => Promise<void>;
  clearError: () => void;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { autoConnect = true } = options;

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref to track selected user in callbacks
  const selectedUserRef = useRef<ChatUser | null>(null);

  // Update ref when selectedUser changes
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // WebSocket bağlantısı
  const connect = useCallback(async () => {
    try {
      setError(null);
      await wsService.connect();
      setIsConnected(true);
    } catch (err: any) {
      setError(err.message || "WebSocket bağlantısı başarısız");
      setIsConnected(false);
    }
  }, []);

  // WebSocket bağlantısını kes
  const disconnect = useCallback(() => {
    wsService.disconnect();
    setIsConnected(false);
  }, []);

  // Kullanıcıları yükle
  const refreshUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true);
      setError(null);
      const data = await chatApi.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Kullanıcılar yüklenemedi");
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  // Kullanıcı seç ve mesajları yükle
  const selectUser = useCallback(async (user: ChatUser) => {
    setSelectedUser(user);
    setMessages([]);

    try {
      setIsLoadingMessages(true);
      setError(null);
      const data = await chatApi.getMessages(user.id);
      setMessages(data);
    } catch (err: any) {
      setError(err.message || "Mesajlar yüklenemedi");
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Mesaj gönder
  const sendMessage = useCallback(
    async (text: string) => {
      if (!selectedUserRef.current || !text.trim()) return;

      try {
        setIsSending(true);
        setError(null);

        // WebSocket ile gönder
        wsService.sendMessage(selectedUserRef.current.id, text);

        // Optimistic update - mesajı hemen ekle
        const currentUserId = getCurrentUserId();
        const optimisticMessage: ChatMessage = {
          id: Date.now(), // Geçici ID
          sender: "me",
          senderId: currentUserId,
          senderName: "Ben",
          text: text,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, optimisticMessage]);

        // Kullanıcı listesinde son mesajı güncelle
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUserRef.current?.id
              ? { ...u, lastMessage: text, lastMessageDate: new Date().toISOString() }
              : u
          )
        );
      } catch (err: any) {
        setError(err.message || "Mesaj gönderilemedi");
      } finally {
        setIsSending(false);
      }
    },
    []
  );

  // Error'u temizle
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Component mount - WebSocket bağlan ve kullanıcıları yükle
  useEffect(() => {
    if (autoConnect) {
      connect();
      refreshUsers();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect, refreshUsers]);

  // Gelen mesajları dinle
  useEffect(() => {
    const unsubscribe = wsService.onMessage((message: ChatMessage) => {
      // Eğer mesaj şu anki sohbetten geliyorsa, listeye ekle
      const currentSelected = selectedUserRef.current;

      if (
        currentSelected &&
        (message.senderId === currentSelected.id ||
          message.senderId === getCurrentUserId())
      ) {
        setMessages((prev) => {
          // Duplicate kontrolü (optimistic update ile gelen mesaj)
          const exists = prev.some(
            (m) =>
              m.text === message.text &&
              Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 5000
          );

          if (exists && message.sender === "me") {
            // Optimistic update'i gerçek mesajla değiştir
            return prev.map((m) =>
              m.text === message.text && m.sender === "me" && m.id > 1000000000
                ? message
                : m
            );
          }

          return [...prev, message];
        });
      }

      // Kullanıcı listesinde son mesajı güncelle
      const otherUserId =
        message.senderId === getCurrentUserId()
          ? currentSelected?.id
          : message.senderId;

      if (otherUserId) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === otherUserId
              ? { ...u, lastMessage: message.text, lastMessageDate: message.createdAt }
              : u
          )
        );
      }
    });

    return unsubscribe;
  }, []);

  return {
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
    connect,
    disconnect,
    refreshUsers,
    clearError,
  };
}

export default useChat;