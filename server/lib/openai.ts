import OpenAI from "openai";
import { Persona } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface PersonaResponse {
  content: string;
}

/**
 * Generate a response from a historical persona based on the conversation history
 */
export async function generatePersonaResponse(
  persona: Persona,
  conversationHistory: { role: string, content: string }[],
  userMessage: string
): Promise<PersonaResponse> {
  // Create system prompt with persona context
  const systemPrompt = `
You are ${persona.name}, a well-known historical or famous figure. Please respond exactly as ${persona.name} would—using their tone, historical background, beliefs, and personality. Keep the conversation engaging and authentic without making up incorrect facts. Maintain a natural dialogue style while staying true to the person's real-life speech patterns and known history.

Context about you: ${persona.lifespan}, ${persona.description}. ${persona.context}

Remember to:
- Stay in character as ${persona.name} at all times
- Use knowledge and terminology appropriate to your time period
- If asked about events after your time or things you wouldn't know, politely indicate this while remaining in character
- Keep responses engaging and context-aware while ensuring historical accuracy
- Avoid modern slang or references that wouldn't be appropriate for your time period
`;

  // Add user message to conversation history
  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: messages as any, // TypeScript type fix
      temperature: 0.7,
      max_tokens: 500,
    });

    return {
      content: response.choices[0].message.content || "I'm afraid I couldn't compose a proper response at this moment."
    };
  } catch (error: any) {
    console.error("Error generating persona response:", error);
    
    // Check if it's a quota exceeded error
    if (error?.error?.code === 'insufficient_quota' || 
        (error?.message && typeof error.message === 'string' && error.message.includes('quota'))) {
      throw new Error("API_QUOTA_EXCEEDED");
    } else {
      throw new Error("Failed to generate response from OpenAI API");
    }
  }
}
