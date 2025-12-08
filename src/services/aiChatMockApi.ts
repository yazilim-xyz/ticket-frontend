export interface AIChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  preview: string;
  date: string;
  category: "YESTERDAY" | "LAST WEEK" | "LAST MONTH";
  messages: AIChatMessage[];
}

class AIChatMockApi {
  private sessions: ChatSession[] = [
    {
      id: "1",
      title: "Platform Marketplace 101...",
      preview: "Platform Marketplace 101",
      date: "2:30 PM",
      category: "YESTERDAY",
      messages: [
        {
          id: "m1",
          text: "Can you explain the Platform Marketplace to me?",
          sender: "user",
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          id: "m2",
          text: "Of course! The Platform Marketplace is a comprehensive ecosystem where you can discover, evaluate, and integrate various third-party applications and services into our platform. It's designed to extend the functionality of your system and meet specific business needs.",
          sender: "ai",
          timestamp: new Date(Date.now() - 3500000),
        },
      ],
    },
    {
      id: "2",
      title: "Give me a proposal for...",
      preview: "Give me a proposal for",
      date: "11:45 AM",
      category: "YESTERDAY",
      messages: [
        {
          id: "m3",
          text: "Give me a proposal for improving our customer support workflow",
          sender: "user",
          timestamp: new Date(Date.now() - 25200000),
        },
        {
          id: "m4",
          text: "Here's a comprehensive proposal for improving your customer support workflow:\n\n1. Implement AI-powered ticket routing\n2. Create a knowledge base with self-service options\n3. Set up automated responses for common queries\n4. Integrate live chat with chatbot support\n5. Establish SLA tracking and reporting\n\nWould you like me to elaborate on any of these points?",
          sender: "ai",
          timestamp: new Date(Date.now() - 25100000),
        },
      ],
    },
    {
      id: "3",
      title: "Can you write a short...",
      preview: "Can you write a short",
      date: "9:20 AM",
      category: "YESTERDAY",
      messages: [
        {
          id: "m5",
          text: "Can you write a short summary of our Q3 performance?",
          sender: "user",
          timestamp: new Date(Date.now() - 34200000),
        },
        {
          id: "m6",
          text: "Based on the available data, here's a summary of Q3 performance:\n\n• Revenue increased by 23% compared to Q2\n• Customer satisfaction score reached 4.7/5\n• Ticket resolution time improved by 15%\n• New feature adoption rate: 67%\n• Active user base grew by 18%\n\nOverall, Q3 showed strong growth across all key metrics.",
          sender: "ai",
          timestamp: new Date(Date.now() - 34100000),
        },
      ],
    },
    {
      id: "4",
      title: "Research about ui ux",
      preview: "Research about ui ux",
      date: "Yesterday",
      category: "YESTERDAY",
      messages: [
        {
          id: "m7",
          text: "Research about ui ux best practices for enterprise software",
          sender: "user",
          timestamp: new Date(Date.now() - 86400000),
        },
        {
          id: "m8",
          text: "Here are the key UI/UX best practices for enterprise software:\n\n1. **Consistency**: Maintain uniform design patterns across the application\n2. **Accessibility**: Ensure WCAG 2.1 compliance\n3. **Efficiency**: Minimize clicks to complete common tasks\n4. **Scalability**: Design for various screen sizes and devices\n5. **Feedback**: Provide clear system status and error messages\n6. **Customization**: Allow users to personalize their workspace\n7. **Training**: Include onboarding and contextual help",
          sender: "ai",
          timestamp: new Date(Date.now() - 86300000),
        },
      ],
    },
    {
      id: "5",
      title: "Platform Marketplace 101...",
      preview: "Platform Marketplace 101",
      date: "3 days ago",
      category: "LAST WEEK",
      messages: [
        {
          id: "m9",
          text: "How do I integrate apps from the marketplace?",
          sender: "user",
          timestamp: new Date(Date.now() - 259200000),
        },
        {
          id: "m10",
          text: "Integrating apps from the marketplace is straightforward:\n\n1. Browse the marketplace and select your desired app\n2. Click 'Install' or 'Connect'\n3. Authorize the necessary permissions\n4. Configure the integration settings\n5. Test the connection\n6. Activate the integration\n\nMost integrations are ready to use within minutes!",
          sender: "ai",
          timestamp: new Date(Date.now() - 259100000),
        },
      ],
    },
    {
      id: "6",
      title: "Give me a proposal for ...",
      preview: "Give me a proposal for",
      date: "5 days ago",
      category: "LAST WEEK",
      messages: [
        {
          id: "m11",
          text: "Give me a proposal for automating our reporting process",
          sender: "user",
          timestamp: new Date(Date.now() - 432000000),
        },
        {
          id: "m12",
          text: "Here's a proposal for automating your reporting process:\n\n**Phase 1: Data Collection**\n- Automate data aggregation from multiple sources\n- Set up real-time data synchronization\n\n**Phase 2: Report Generation**\n- Create customizable report templates\n- Schedule automatic report generation\n\n**Phase 3: Distribution**\n- Automated email distribution\n- Dashboard integration\n\nEstimated implementation time: 4-6 weeks",
          sender: "ai",
          timestamp: new Date(Date.now() - 431900000),
        },
      ],
    },
    {
      id: "7",
      title: "Platform Marketplace 101...",
      preview: "Platform Marketplace 101",
      date: "2 weeks ago",
      category: "LAST MONTH",
      messages: [
        {
          id: "m13",
          text: "What are the security features of the marketplace?",
          sender: "user",
          timestamp: new Date(Date.now() - 1209600000),
        },
        {
          id: "m14",
          text: "Our marketplace prioritizes security with these features:\n\n• End-to-end encryption for all data transfers\n• OAuth 2.0 authentication\n• Regular security audits of all listed apps\n• Granular permission controls\n• SOC 2 Type II compliance\n• 24/7 security monitoring\n• Automatic vulnerability scanning\n\nAll apps undergo a rigorous vetting process before listing.",
          sender: "ai",
          timestamp: new Date(Date.now() - 1209500000),
        },
      ],
    },
    {
      id: "8",
      title: "Give me a proposal for...",
      preview: "Give me a proposal for",
      date: "3 weeks ago",
      category: "LAST MONTH",
      messages: [
        {
          id: "m15",
          text: "Give me a proposal for improving team collaboration",
          sender: "user",
          timestamp: new Date(Date.now() - 1814400000),
        },
        {
          id: "m16",
          text: "Here's a comprehensive collaboration improvement proposal:\n\n**Communication Tools**\n- Integrate Slack/Teams for instant messaging\n- Set up video conferencing capabilities\n\n**Project Management**\n- Implement shared task boards\n- Create project timelines and milestones\n\n**Document Collaboration**\n- Real-time document editing\n- Version control system\n\n**Knowledge Sharing**\n- Internal wiki/knowledge base\n- Regular team sync meetings\n\nExpected outcome: 30% improvement in team productivity",
          sender: "ai",
          timestamp: new Date(Date.now() - 1814300000),
        },
      ],
    },
  ];

  private currentSession: ChatSession | null = null;

  // Tüm chat session'larını getir
  async getChatSessions(): Promise<ChatSession[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.sessions);
      }, 300);
    });
  }

  // Belirli bir session'ın mesajlarını getir
  async getSessionMessages(sessionId: string): Promise<AIChatMessage[]> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const session = this.sessions.find((s) => s.id === sessionId);
        if (session) {
          this.currentSession = session;
          resolve(session.messages);
        } else {
          reject(new Error("Session not found"));
        }
      }, 300);
    });
  }

  // Yeni mesaj gönder
  async sendMessage(sessionId: string, text: string): Promise<AIChatMessage> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userMessage: AIChatMessage = {
          id: `m${Date.now()}`,
          text,
          sender: "user",
          timestamp: new Date(),
        };

        const session = this.sessions.find((s) => s.id === sessionId);
        if (session) {
          session.messages.push(userMessage);
        }

        resolve(userMessage);
      }, 300);
    });
  }

  // AI cevabı simülasyonu
  async getAIResponse(sessionId: string, userMessage: string): Promise<AIChatMessage> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const responses = [
          "I understand your question. Let me help you with that. Based on your query, I can provide detailed information about our system features and how to best utilize them for your needs.",
          "Great question! Here's what I found: Our platform offers comprehensive tools to address this. Would you like me to walk you through the specific steps?",
          "Based on the data available, here's my analysis: This is a common scenario that can be resolved efficiently. Let me explain the recommended approach.",
          "I can definitely assist with that. Here are some key points to consider: 1) System capabilities, 2) Best practices, 3) Implementation steps. Which would you like to explore first?",
          "Excellent inquiry! The solution involves several components working together. I'll break this down into manageable steps for you.",
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        const aiMessage: AIChatMessage = {
          id: `m${Date.now()}`,
          text: randomResponse,
          sender: "ai",
          timestamp: new Date(),
        };

        const session = this.sessions.find((s) => s.id === sessionId);
        if (session) {
          session.messages.push(aiMessage);
        }

        resolve(aiMessage);
      }, 1500);
    });
  }

  // Yeni chat session oluştur
  async createNewSession(firstMessage?: string): Promise<ChatSession> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newSession: ChatSession = {
          id: `session_${Date.now()}`,
          title: firstMessage ? firstMessage.substring(0, 30) + "..." : "New Chat",
          preview: firstMessage ? firstMessage.substring(0, 30) : "New Chat",
          date: "Just now",
          category: "YESTERDAY",
          messages: firstMessage
            ? [
                {
                  id: `m${Date.now()}`,
                  text: firstMessage,
                  sender: "user",
                  timestamp: new Date(),
                },
              ]
            : [],
        };

        this.sessions.unshift(newSession);
        this.currentSession = newSession;
        resolve(newSession);
      }, 300);
    });
  }

  // Session sil
  async deleteSession(sessionId: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.sessions.findIndex((s) => s.id === sessionId);
        if (index !== -1) {
          this.sessions.splice(index, 1);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 300);
    });
  }

  // Mevcut session'ı getir
  getCurrentSession(): ChatSession | null {
    return this.currentSession;
  }
}

export const aiChatMockApi = new AIChatMockApi();