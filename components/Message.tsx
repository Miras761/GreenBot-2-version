
import React from 'react';
import { Message, Role } from '../types';
import { GreenBotIcon } from './icons/GreenBotIcon';
import MarkdownRenderer from './MarkdownRenderer';

interface MessageProps {
  message: Message;
}

const MessageComponent: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === Role.User;
  const isBot = message.role === Role.Model;
  const isError = message.role === Role.Error;

  const wrapperClasses = isUser ? 'justify-end' : 'justify-start';
  const messageClasses = isUser
    ? 'bg-emerald-600 rounded-br-none'
    : isBot
    ? 'bg-gray-700/50 rounded-bl-none'
    : 'bg-red-500/50 rounded-bl-none text-red-300';

  return (
    <div className={`w-full flex ${wrapperClasses} mb-6 animate-fade-in-up`}>
      <div className="flex items-start gap-3 max-w-full md:max-w-3xl">
        {!isUser && (
          <div className="w-8 h-8 flex-shrink-0 bg-emerald-500 rounded-full flex items-center justify-center">
            <GreenBotIcon className="w-5 h-5 text-white" />
          </div>
        )}
        <div
          className={`px-4 py-3 rounded-2xl text-white ${messageClasses}`}
        >
          {isBot ? <MarkdownRenderer content={message.content} /> : <p>{message.content}</p>}
          {isError && <p><strong>Error:</strong> {message.content}</p>}
        </div>
      </div>
    </div>
  );
};

export default MessageComponent;
