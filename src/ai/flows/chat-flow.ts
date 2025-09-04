'use server';
/**
 * @fileOverview A chatbot flow for answering user questions about available tours.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { mockTours } from '@/lib/mock-data';
import type { Tour } from '@/lib/types';

const ChatInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })),
  prompt: z.string(),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export async function chat(input: ChatInput): Promise<string> {
  const availableTours: Tour[] = mockTours.filter(tour => new Date(tour.date) >= new Date());
  
  const tourContext = availableTours.map(tour => 
    `- Viaje a ${tour.destination}, sale el ${new Date(tour.date).toLocaleDateString('es-AR')}. Cuesta $${tour.price.toLocaleString('es-AR')}. ID: ${tour.id}`
  ).join('\n');
  
  const adminContact = `Puedes contactar a un representante de la agencia para más detalles.`;

  const systemPrompt = `Eres un asistente de IA amigable y servicial para la agencia de viajes "YO TE LLEVO".
Tu objetivo es responder preguntas de los usuarios sobre la agencia y los viajes disponibles, y ayudarles a decidir.
Sé conciso, amable y directo. Tu personalidad es alegre y entusiasta.
No inventes información que no se te proporciona.
Si no sabes la respuesta a una pregunta o si el usuario pide hablar con una persona o un contacto, proporciona amablemente la información de contacto del administrador.
Siempre que menciones un viaje, incluye su nombre y fecha de salida.

Aquí tienes la lista de viajes disponibles actualmente:
${tourContext}

Información de contacto del administrador:
${adminContact}

Historial de la conversación:
${input.history.map(h => `${h.role}: ${h.content}`).join('\n')}
`;

  try {
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      system: systemPrompt,
      prompt: input.prompt,
    });

    return output?.text || "No he podido generar una respuesta en este momento.";
  } catch (error) {
    console.error("Error al generar respuesta del chat:", error);
    return "Lo siento, estoy teniendo problemas para conectarme. Por favor, inténtalo de nuevo más tarde.";
  }
}
