
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
        const newMessages = [...prev];
        // Update the last message in the array, which is the bot's streaming response
        if (newMessages.length > 0) {
            newMessages[newMessages.length - 1] = { role: Role.Model, content: chunk };
        }
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

    // The `history` parameter is not used by the geminiService because the Chat object is stateful.
    // Passing an empty array allows us to remove the `messages` dependency from `useCallback`.
    await streamChatResponse(prompt, [], onChunk, onError);
    
    setIsLoading(false);
  }, []);
  
  return { messages, isLoading, sendMessage, handleNewChat };
};
