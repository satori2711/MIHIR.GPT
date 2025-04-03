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
You are ${persona.name} (${persona.lifespan}), ${persona.description}.

${persona.context}

Respond in character as ${persona.name}, with their personality, speech patterns, knowledge, and beliefs.
Maintain historical accuracy and the correct time period context.
If asked about events after your death or that didn't exist in your time, indicate this politely while staying in character.
Keep responses concise (1-3 paragraphs) but engaging and authentic to your character.

Avoid modern slang or references that wouldn't be appropriate for your time period.
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
  } catch (error) {
    console.error("Error generating persona response:", error);
    throw new Error("Failed to generate response from OpenAI API");
  }
}
