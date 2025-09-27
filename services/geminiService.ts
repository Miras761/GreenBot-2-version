
import { GoogleGenAI, Chat } from "@google/genai";
import { Message, Role } from '../types';

let ai: GoogleGenAI | null = null;
let chat: Chat | null = null;

// FIX: Use process.env.API_KEY as per the guidelines, which also resolves the TypeScript error.
// Access the API key from environment variables
const apiKey = process.env.API_KEY;

const getAI = (): GoogleGenAI => {
    if (!ai) {
        if (!apiKey) {
            throw new Error("API_KEY environment variable not set. Please set it in your Vercel project settings.");
        }
        ai = new GoogleGenAI({ apiKey: apiKey });
    }
    return ai;
};

const initializeChat = (): Chat => {
    const genAI = getAI();
    chat = genAI.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'You are GreenBot, a helpful assistant for GreenGamesStudio. Your responses should be helpful and friendly. You support markdown formatting.',
        },
    });
    return chat;
};

export const getChat = (): Chat => {
    if (!chat) {
        return initializeChat();
    }
    return chat;
};

export const clearChatSession = (): void => {
    chat = null;
    initializeChat();
};

export const streamChatResponse = async (
    prompt: string,
    history: Message[],
    onChunk: (chunk: string) => void,
    onError: (error: string) => void
): Promise<void> => {
    try {
        const currentChat = getChat();
        
        // Note: The gemini 'Chat' object maintains its own history. 
        // We don't need to pass the full history on every call if we reuse the chat object.
        // However, if we re-initialize chat for every session (like with `clearChatSession`),
        // this is where we would inject the history. For this implementation, we rely on the stateful `Chat` object.

        const responseStream = await currentChat.sendMessageStream({ message: prompt });
        
        let accumulatedText = "";
        for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) {
                accumulatedText += text;
                onChunk(accumulatedText);
            }
        }
    } catch (error) {
        console.error("Error streaming chat response:", error);
        let errorMessage = "An unknown error occurred.";
        if (error instanceof Error) {
            errorMessage = `Sorry, I ran into an error: ${error.message}`;
             if (error.message.includes('API key not valid')) {
                errorMessage = "The API key is invalid or not configured correctly in Vercel project settings.";
            }
        }
        onError(errorMessage);
    }
};
