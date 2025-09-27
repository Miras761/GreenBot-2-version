import { useState, useEffect, useCallback } from 'react';
import { Message, Role } from '../types';
import { streamChatResponse, clearChatSession } from '../services/geminiService';

const CHAT_HISTORY_KEY = 'greenbot_chat_history';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      if (storedHistory) {
        setMessages(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
      localStorage.removeItem(CHAT_HISTORY_KEY);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  }, [messages]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    clearChatSession();
    localStorage.removeItem(CHAT_HISTORY_KEY);
  }, []);

  const sendMessage = useCallback(async (prompt: string) => {
    if (!prompt) return;

    setIsLoading(true);
    const userMessage: Message = { role: Role.User, content: prompt };
    
    // Add user message and a placeholder for the bot's response in a single state update
    setMessages(prev => [...prev, userMessage, { role: Role.Model, content: '' }]);

    const onChunk = (chunk: string) => {
      setMessages(prev => {
        // Replace the last message (the bot's response) with the updated content.
        // This is a safer, immutable update pattern.
        return [...prev.slice(0, -1), { role: Role.Model, content: chunk }];
      });
    };

    const onError = (error: string) => {
        const errorMessage: Message = { role: Role.Error, content: error };
        setMessages(prev => {
            // Replace the bot placeholder with the error message
            return [...prev.slice(0, -1), errorMessage];
        });
    };

    try {
      await streamChatResponse(prompt, onChunk, onError);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return { messages, isLoading, sendMessage, handleNewChat };
};