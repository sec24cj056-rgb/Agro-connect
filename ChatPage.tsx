import React, { useState, useEffect, useCallback } from 'react';
import { ChatSession, ChatMessage, Role, ChartData, ImageData } from './types';
import { callGemini } from './services/geminiService';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { ChatHeader } from './components/Header';

const initialMessages: ChatMessage[] = [
    {
      id: 'init-1',
      role: Role.BOT,
      content: "Welcome to the INGRES AI Assistant. I can help you with groundwater data for India, create charts, and even generate conceptual maps.",
    },
    {
      id: 'init-2',
      role: Role.BOT,
      content: "How can I assist you today?",
    }
];

const initialSession: ChatSession = {
  id: `session-${Date.now()}`,
  title: 'New Chat',
  messages: initialMessages,
  language: 'English',
};

interface ChatPageProps {
  onLogout: () => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ onLogout }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([initialSession]);
  const [activeSessionId, setActiveSessionId] = useState<string>(initialSession.id);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);
  
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  
  const updateActiveSession = (updater: (session: ChatSession) => ChatSession) => {
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === activeSessionId ? updater(session) : session
      )
    );
  };

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !activeSession) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: Role.USER,
      content: text,
    };

    updateActiveSession(session => ({
      ...session,
      messages: session.messages.length === 2 ? [userMessage] : [...session.messages, userMessage],
      title: session.title === 'New Chat' ? text.substring(0, 30) + (text.length > 30 ? '...' : '') : session.title,
    }));

    setIsLoading(true);

    try {
      const botContent = await callGemini(text, activeSession.language);
      
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: Role.BOT,
        content: botContent,
      };

      updateActiveSession(session => ({
        ...session,
        messages: [...session.messages, botMessage],
      }));

    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: Role.BOT,
        content: "Sorry, an error occurred. Please try again.",
      };
      updateActiveSession(session => ({
        ...session,
        messages: [...session.messages, errorMessage],
      }));
    } finally {
      setIsLoading(false);
    }
  }, [activeSession, activeSessionId]);
  
  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Chat',
      messages: initialMessages,
      language: 'English',
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
  };
  
  const handleLanguageChange = (language: string) => {
    updateActiveSession(session => ({ ...session, language }));
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar 
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col transition-all duration-300">
        <ChatHeader 
            sessionTitle={activeSession.title}
            currentLanguage={activeSession.language}
            onLanguageChange={handleLanguageChange}
            onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        />
        <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto overflow-hidden">
            <ChatWindow 
                messages={activeSession.messages} 
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
            />
            <div className="w-full px-4 pb-4">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;