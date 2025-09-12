
'use server';
/**
 * @fileOverview A chatbot flow for answering user questions about the travel agency.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ChatInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })),
  prompt: z.string(),
  context: z.string().optional(),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export async function chat(input: ChatInput): Promise<string> {
  try {
    const systemPrompt = `Eres un asistente de IA amigable y servicial para una agencia de viajes.
Tu objetivo es responder preguntas de los usuarios sobre la agencia y los viajes disponibles, y ayudarles a decidir.
Sé conciso, amable y directo. Tu personalidad es alegre y entusiasta.
Utiliza la información de contexto proporcionada como tu principal fuente de verdad. No inventes información que no se te proporciona.
Si no sabes la respuesta a una pregunta, o si la información no está en el contexto, o si el usuario pide hablar con una persona, proporciona amablemente la información de contacto que se te da en el contexto.

### CONTEXTO DE LA PÁGINA ###
${input.context || 'No se proporcionó contexto adicional.'}
############################`;

    const { output } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      system: systemPrompt,
      prompt: `Historial de la conversación:
${input.history.map(h => `${h.role}: ${h.content}`).join('\n')}
user: ${input.prompt}`,
    });

    return output?.text || "No he podido generar una respuesta en este momento. Por favor, intenta de nuevo.";
  } catch (error) {
    console.error("Error al generar respuesta del chat:", error);
    return "Lo siento, estoy teniendo problemas para conectarme. Por favor, inténtalo de nuevo más tarde.";
  }
}
