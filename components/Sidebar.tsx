
import React from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { GreenBotIcon } from './icons/GreenBotIcon';

interface SidebarProps {
  onNewChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNewChat }) => {
  return (
    <div className="bg-black/20 w-64 p-4 flex-col hidden md:flex">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-500/80 rounded-lg flex items-center justify-center">
            <GreenBotIcon className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-xl font-bold text-white">GreenBot</h1>
      </div>
      <button
        onClick={onNewChat}
        className="w-full flex items-center gap-3 px-3 py-2 text-white text-sm rounded-lg hover:bg-white/10 transition-colors"
      >
        <PlusIcon className="w-5 h-5" />
        New Chat
      </button>
    </div>
  );
};

export default Sidebar;
