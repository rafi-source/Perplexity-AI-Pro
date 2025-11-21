import { GoogleGenAI } from "@google/genai";
import { FocusMode, Attachment } from '../types';

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface GeminiResponse {
  text: string;
  sources: { title: string; url: string }[];
}

/**
 * Maps the selected focus mode to a specific system instruction and tools configuration.
 */
const getSystemInstructionAndTools = (mode: FocusMode, isProMode: boolean) => {
  // Base instruction emphasizing Recency and Grounding
  let instruction = `
    You are Perplexica, an advanced AI search engine capable of deep research.
    Your primary goal is to provide answers based on the LATEST information available on the web.
    
    CRITICAL RULES:
    1. PRIORITIZE SEARCH RESULTS: Always prefer information found in the Google Search tools over your internal knowledge cutoff.
    2. BE UP-TO-DATE: If the user asks for news, weather, stock prices, or recent events, use the search tool to find the exact current status.
    3. CITE SOURCES: You must base your answers on the search results provided.
    4. DATE AWARENESS: Today's date is ${new Date().toLocaleDateString()}.
  `;
  
  if (isProMode) {
      instruction += `
      ==================================================
      MODE: PURE DEEP RESEARCH (GROUND UP)
      ==================================================
      You are currently in "Deep Research" mode. The user expects an EXHAUSTIVE, ACADEMIC, and FIRST-PRINCIPLES analysis.
      
      MANDATORY PROCESS (FROM GROUND UP):
      1. **First Principles:** Do not assume common knowledge. Start from the fundamental truths of the query.
      2. **Exhaustive Search:** If you find a fact, verifying it against a second source. If sources conflict, find a third.
      3. **Recursive Reasoning:** Think about the "Why" and "How" deeply. Spend significant tokens on the reasoning process.
      4. **Counter-Arguments:** Actively look for evidence that disproves your initial findings.
      5. **No Shortcuts:** Do not summarize until you have analyzed the entire context.
      
      OUTPUT FORMAT:
      - Provide a "Deep Dive" structured response.
      - Use multiple headers.
      - Cite every single claim.
      - Include a "Methodology" or "Reasoning" section if the topic is complex.
      `;
  }

  let useSearch = true;

  switch (mode) {
    case FocusMode.ACADEMIC:
      instruction += " Focus on academic papers, research, and scientific consensus. Prioritize .edu and .org sources.";
      break;
    case FocusMode.WRITING:
      instruction += " You are a creative writing assistant. Do not use web search unless explicitly asked for facts. Focus on style, tone, and structure.";
      useSearch = false;
      break;
    case FocusMode.YOUTUBE:
      instruction += " Focus on finding educational or relevant YouTube videos. Summarize video content if possible.";
      break;
    case FocusMode.REDDIT:
      instruction += " Focus on searching Reddit threads to find community opinions, personal experiences, and discussions.";
      break;
    case FocusMode.WEB:
    default:
      instruction += " Provide comprehensive, accurate, and LATEST answers.";
      break;
  }

  // Config for Grounding
  // We explicitly add googleSearch. 
  const tools = useSearch ? [{ googleSearch: {} }] : [];
  
  return { instruction, tools };
};

export const generateAnswer = async (
  query: string, 
  attachments: Attachment[],
  mode: FocusMode,
  isProMode: boolean,
  history: { role: string, content: string, parts?: any[] }[]
): Promise<GeminiResponse> => {
  
  const { instruction, tools } = getSystemInstructionAndTools(mode, isProMode);

  try {
    const chatConfig: any = {
        systemInstruction: instruction,
        tools: tools,
    };

    // Enable Thinking Config for Pro Mode (Deep Research)
    // We maximize the budget to 32768 (Max for 2.5/3.0 Pro) to simulate "10 minute" depth.
    if (isProMode) {
        chatConfig.thinkingConfig = { thinkingBudget: 32768 }; 
    }

    // Convert simple history to SDK format
    // Note: The API expects { role: 'user' | 'model', parts: [{ text: string }] }
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chat = ai.chats.create({
        model: 'gemini-3-pro-preview', // Using Gemini 3 Pro Preview
        config: chatConfig,
        history: formattedHistory
    });

    // Construct the message parts
    const parts: any[] = [];
    
    // Add Text
    if (query) {
        parts.push({ text: query });
    }

    // Add Attachments (Images)
    if (attachments && attachments.length > 0) {
        attachments.forEach(att => {
            if (att.type === 'image') {
                parts.push({
                    inlineData: {
                        mimeType: att.mimeType,
                        data: att.data
                    }
                });
            }
        });
    }

    // Ensure there is at least one part to avoid errors
    if (parts.length === 0) {
        parts.push({ text: " " });
    }

    // Send message using correct SDK signature: { message: ... }
    const response = await chat.sendMessage({ message: parts });

    // Extract Text
    const text = response.text || "I couldn't generate a text response.";

    // Extract Grounding (Sources)
    const sources: { title: string; url: string }[] = [];
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
        chunks.forEach((chunk: any) => {
            if (chunk.web) {
                sources.push({
                    title: chunk.web.title || "Web Source",
                    url: chunk.web.uri
                });
            }
        });
    }

    return { text, sources };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return {
      text: `Error: ${error.message || "Something went wrong while searching."}`,
      sources: []
    };
  }
};