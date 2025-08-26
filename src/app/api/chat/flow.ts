'use server';
/**
 * @fileOverview The main flow for the customer-facing chatbot.
 * It uses tools to get real-time information about tours and contact details.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {getAvailableTours, getContactInfo} from './tools';

export const chatInputSchema = z.object({
  history: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      content: z.string(),
    })
  ),
});

export const chatOutputSchema = z.string();

export async function chat(
  input: z.infer<typeof chatInputSchema>
): Promise<z.infer<typeof chatOutputSchema>> {
  const llm = ai.model('googleai/gemini-2.0-flash');

  const prompt = `You are a friendly and helpful travel agent for a company called "YO TE LLEVO".
Your goal is to answer customer questions about available trips and help them get in touch with the right person if needed.

- Use the 'getAvailableTours' tool to answer questions about destinations, dates, and prices.
- If you cannot answer a question or if the user asks to speak with a person, use the 'getContactInfo' tool.
- Provide the WhatsApp numbers clearly to the user.
- Keep your answers concise and friendly.
- Always respond in Spanish.`;

  const response = await ai.generate({
    model: llm,
    history: input.history,
    prompt: prompt,
    tools: [getAvailableTours, getContactInfo],
    config: {
      temperature: 0.3,
    },
  });

  return response.text;
}
