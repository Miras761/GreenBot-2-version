
import React from 'react';
import ChatInput from './components/ChatInput';
import ChatWindow from './components/ChatWindow';
import Sidebar from './components/Sidebar';
import { useChat } from './hooks/useChat';

function App() {
  const { messages, isLoading, sendMessage, handleNewChat } = useChat();

  return (
    <div className="flex h-screen w-screen bg-[#0a5c36] text-white font-sans">
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
      
      <Sidebar onNewChat={handleNewChat} />
      
      <main className="flex flex-1 flex-col h-full overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0">
          <ChatWindow messages={messages} isLoading={isLoading} />
          <div className="w-full border-t border-white/20">
            <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
            <footer className="text-center text-xs text-gray-300/60 pb-2">
              Created by GreenGamesStudio
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
