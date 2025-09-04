"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, X, Loader2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { chat } from '@/ai/flows/chat-flow';
import Textarea from 'react-textarea-autosize';
import type { Tour, GeneralSettings } from '@/lib/types';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
        setMessages([
            { role: 'model', content: '¡Hola! Soy tu asistente de IA. Puedo ayudarte con información sobre nuestros viajes o la agencia. ¿En qué puedo ayudarte hoy?' }
        ]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const getAppContext = (): string => {
    try {
        const tours: Tour[] = JSON.parse(localStorage.getItem("ytl_tours") || "[]");
        const settings: GeneralSettings = JSON.parse(localStorage.getItem("ytl_general_settings") || "{}");
        
        const activeTours = tours.filter(tour => new Date(tour.date) >= new Date());

        let context = "### Información de Viajes Disponibles:\n";
        if (activeTours.length > 0) {
            context += activeTours.map(tour => 
                `- Viaje a ${tour.destination}, sale el ${new Date(tour.date).toLocaleDateString('es-AR')}. Cuesta $${tour.price.toLocaleString('es-AR')}.`
            ).join('\n');
        } else {
            context += "No hay viajes disponibles en este momento.";
        }

        context += "\n\n### Información de Contacto de la Agencia:\n";
        if (settings.contact) {
            context += `Dirección: ${settings.contact.address || 'No especificada'}\n`;
            context += `Teléfono: ${settings.contact.phone || 'No especificado'}\n`;
            context += `Email: ${settings.contact.email || 'No especificado'}\n`;
            context += `Horario: ${settings.contact.hours || 'No especificado'}\n`;
        } else {
             context += `Para más detalles, puedes contactar a un representante de la agencia.`;
        }
         context += `\nEl número de WhatsApp principal es: ${settings.mainWhatsappNumber || 'No especificado'}`;


        return context;
    } catch (error) {
        console.error("Error al obtener contexto del localStorage:", error);
        return "No se pudo cargar la información de la página.";
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const pageContext = getAppContext();
      const modelResponse = await chat({
        history: messages,
        prompt: input,
        context: pageContext,
      });
      
      const modelMessage: Message = { role: 'model', content: modelResponse };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Error calling chat flow:", error);
      const errorMessage: Message = { role: 'model', content: "Lo siento, tuve un problema para conectarme. Por favor, intenta de nuevo más tarde." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={cn(
        "fixed bottom-4 right-4 z-50 transition-all duration-300",
        isOpen ? "w-[calc(100%-2rem)] max-w-md h-[70vh] max-h-[600px]" : "w-16 h-16"
      )}>
        <Card className={cn(
          "h-full w-full flex flex-col shadow-2xl transition-all duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="w-6 h-6 text-primary" />
              Asistente de Viaje IA
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={cn(
                    "flex gap-3 text-sm",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}>
                    {message.role === 'model' && <Bot className="w-6 h-6 text-primary flex-shrink-0" />}
                    <div className={cn(
                      "p-3 rounded-lg max-w-[80%]",
                      message.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      {message.content}
                    </div>
                     {message.role === 'user' && <User className="w-6 h-6 text-muted-foreground flex-shrink-0" />}
                  </div>
                ))}
                {isLoading && (
                   <div className="flex justify-start gap-3 text-sm">
                      <Bot className="w-6 h-6 text-primary flex-shrink-0" />
                      <div className="p-3 rounded-lg bg-muted flex items-center">
                        <Loader2 className="w-5 h-5 animate-spin"/>
                      </div>
                   </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 border-t">
            <div className="flex w-full items-center gap-2">
               <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Escribe tu consulta..."
                className="flex-1 resize-none"
                minRows={1}
                maxRows={4}
              />
              <Button onClick={handleSend} size="icon" disabled={isLoading}>
                <Send className="w-5 h-5"/>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {!isOpen && (
        <Button
          className="fixed bottom-4 right-4 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center"
          onClick={() => setIsOpen(true)}
        >
          <Bot className="w-8 h-8" />
        </Button>
      )}
    </>
  );
}
