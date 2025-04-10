import dotenv from "dotenv";
dotenv.config();

console.log("Loaded API Key in OpenAI:", process.env.OPENAI_API_KEY);

import OpenAI from "openai";
import { Persona } from "@shared/schema";

// Ensure only one OpenAI instance exists
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Use the latest OpenAI model
const MODEL = "gpt-4o";

// Define the PersonaResponse interface
export interface PersonaResponse {
  content: string;
}

/**
 * Generate a response from a persona based on the conversation history.
 */
export async function generatePersonaResponse(
  persona: Persona,
  conversationHistory: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  userMessage: string
): Promise<PersonaResponse> {
  // System prompt generation based on persona type
  let systemPrompt = persona.isCustom === "true"
    ? `
You are ${persona.name}, a famous historical or public figure. You must respond as ${persona.name} would, using their known tone, speech patterns, historical knowledge, and personality traits. Stay authentic and do not generate incorrect facts. Keep the tone conversational and immersive while ensuring accuracy.
`
    : `
You are ${persona.name}, a well-known historical or famous figure. Please respond exactly as ${persona.name} would—using their tone, historical background, beliefs, and personality. Keep the conversation engaging and authentic without making up incorrect facts. Maintain a natural dialogue style while staying true to the person's real-life speech patterns and known history.

Context about you: ${persona.lifespan}, ${persona.description}. ${persona.context}

Remember to:
- Stay in character as ${persona.name} at all times
- Use knowledge and terminology appropriate to your time period
- If asked about events after your time or things you wouldn't know, politely indicate this while remaining in character
- Keep responses engaging and context-aware while ensuring historical accuracy
- Avoid modern slang or references that wouldn't be appropriate for your time period
`;

  // Construct the messages array
  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage }
  ] as Array<{ role: "system" | "user" | "assistant"; content: string }>;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return {
      content: response.choices[0]?.message?.content || "I'm afraid I couldn't compose a proper response at this moment."
    };
  } catch (error: any) {
    console.error("Error generating persona response:", error);

    if (error?.error?.code === 'insufficient_quota' || 
        (error?.message && typeof error.message === 'string' && error.message.includes('quota'))) {
      throw new Error("API_QUOTA_EXCEEDED");
    } else {
      throw new Error("Failed to generate response from OpenAI API");
    }
  }
}
