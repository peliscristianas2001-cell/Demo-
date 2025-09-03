'use server';
/**
 * @fileOverview A chatbot flow for answering user questions about available tours.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { mockTours } from '@/lib/mock-data';
import type { Tour } from '@/lib/types';

// In a real app, you would fetch this from a database or live API.
// For now, we use the mock data.
const getAvailableTours = (): Tour[] => {
    try {
        // Attempt to read from localStorage if in a browser-like environment (might not work server-side)
        if (typeof localStorage !== 'undefined') {
            const storedTours = localStorage.getItem("ytl_tours");
            if (storedTours) {
                const parsedTours: Tour[] = JSON.parse(storedTours);
                return parsedTours.filter(tour => new Date(tour.date) >= new Date());
            }
        }
    } catch (e) {
        console.error("Could not access localStorage, falling back to mock data.", e);
    }
    // Fallback to mock data
    return mockTours.filter(tour => new Date(tour.date) >= new Date());
};


const ChatInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })),
  prompt: z.string(),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export async function chat(input: ChatInput): Promise<string> {
  const availableTours = getAvailableTours();
  
  // Create a simplified text representation of the tours for the LLM context.
  const tourContext = availableTours.map(tour => 
    `- Viaje a ${tour.destination}, sale el ${new Date(tour.date).toLocaleDateString('es-AR')}. Cuesta $${tour.price.toLocaleString('es-AR')}. Noches: ${tour.nights || 'N/A'}. ID: ${tour.id}`
  ).join('\n');
  
  const systemPrompt = `Eres un asistente de viajes amigable y servicial para la agencia "YO TE LLEVO".
Tu objetivo es responder preguntas de los usuarios sobre los viajes disponibles y ayudarles a decidir.
Sé conciso, amable y directo.
No inventes información. Si no sabes algo, di que no tienes esa información y que pueden contactar a un vendedor.
Siempre que menciones un viaje, incluye su nombre y fecha de salida.

Aquí tienes la lista de viajes disponibles actualmente:
${tourContext}

Historial de la conversación:
${input.history.map(h => `${h.role}: ${h.content}`).join('\n')}
`;

  const { output } = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    system: systemPrompt,
    prompt: input.prompt,
  });

  return output?.text!;
}
