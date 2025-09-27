import { GoogleGenAI, Chat } from "@google/genai";

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
    onChunk: (chunk: string) => void,
    onError: (error: string) => void
): Promise<void> => {
    try {
        const currentChat = getChat();
        
        // Note: The gemini 'Chat' object maintains its own history. 
        // We don't need to pass the full history on every call if we reuse the chat object.
        // For this implementation, we rely on the stateful `Chat` object.

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
        // Log the full error for debugging purposes
        console.error("Error streaming chat response:", error);

        let userFriendlyMessage = "Sorry, something went wrong. Please try again later.";
        
        let errorMessage = '';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string') {
            errorMessage = (error as any).message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }

        if (errorMessage) {
            const lowerCaseMessage = errorMessage.toLowerCase();
            if (lowerCaseMessage.includes('api key not valid')) {
                userFriendlyMessage = "The API key is not valid. Please check your project settings and ensure the key is correct and has not expired.";
            } else if (lowerCaseMessage.includes('quota')) {
                userFriendlyMessage = "You have exceeded your API quota. Please check your usage and billing information.";
            } else if (lowerCaseMessage.includes('400')) { // Bad Request can be due to many things, including safety filters
                userFriendlyMessage = "Your request was blocked. This may be due to safety settings or an invalid prompt. Please try rephrasing.";
            } else if (lowerCaseMessage.includes('500') || lowerCaseMessage.includes('503')) { // Server errors
                userFriendlyMessage = "The AI service is temporarily unavailable. Please try again in a few moments.";
            }
        }
        
        onError(userFriendlyMessage);
    }
};