
import React, { useEffect, useRef } from 'react';
import { Message, Role } from '../types';
import MessageComponent from './Message';
import { GreenBotIcon } from './icons/GreenBotIcon';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

const TypingIndicator: React.FC = () => (
  <div className="w-full flex justify-start mb-6 animate-fade-in-up">
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 flex-shrink-0 bg-emerald-500 rounded-full flex items-center justify-center">
        <GreenBotIcon className="w-5 h-5 text-white" />
      </div>
      <div className="px-4 py-3 rounded-2xl bg-gray-700/50 text-white flex items-center space-x-1">
        <span className="typing-dot animate-bounce">.</span>
        <span className="typing-dot animate-bounce delay-150">.</span>
        <span className="typing-dot animate-bounce delay-300">.</span>
      </div>
    </div>
    <style>{`
        .typing-dot { animation-duration: 1.2s; }
    `}</style>
  </div>
);


const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.length === 0 && !isLoading && (
        <div className="text-center text-gray-300 h-full flex flex-col items-center justify-center">
             <div className="w-24 h-24 mb-4 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <GreenBotIcon className="w-12 h-12 text-emerald-400" />
            </div>
          <h1 className="text-3xl font-bold text-white">GreenBot</h1>
          <p className="mt-2">Your friendly assistant from GreenGamesStudio.</p>
        </div>
      )}
      {messages.map((msg, index) => (
        <MessageComponent key={index} message={msg} />
      ))}
      {isLoading && messages[messages.length -1]?.role === Role.User && <TypingIndicator />}
    </div>
  );
};

export default ChatWindow;
