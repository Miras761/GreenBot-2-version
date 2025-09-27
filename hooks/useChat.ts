
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

    const userMessage: Message = { role: Role.User, content: prompt };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    let currentBotMessage = '';
    const botMessagePlaceholder: Message = { role: Role.Model, content: '' };
    setMessages(prev => [...prev, botMessagePlaceholder]);

    const onChunk = (chunk: string) => {
      currentBotMessage = chunk;
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { role: Role.Model, content: currentBotMessage };
        return newMessages;
      });
    };

    const onError = (error: string) => {
        const errorMessage: Message = { role: Role.Error, content: error };
        setMessages(prev => {
            // Replace the bot placeholder with the error message
            const newMessages = [...prev.slice(0, -1), errorMessage];
            return newMessages;
        });
    };

    await streamChatResponse(prompt, updatedMessages, onChunk, onError);
    
    setIsLoading(false);
  }, [messages]);
  
  return { messages, isLoading, sendMessage, handleNewChat };
};
