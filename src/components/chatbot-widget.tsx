
"use client"

import { useState, useEffect, useRef, FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, Send, X, Loader2, MessageSquare } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type Message = {
  role: "user" | "model"
  content: string
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const isDashboard = pathname.startsWith("/admin") || pathname.startsWith("/employee") || pathname.startsWith("/login")

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])
  
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "model",
          content: "¡Hola! Soy tu asistente de viajes de YO TE LLEVO. ¿En qué puedo ayudarte hoy?",
        },
      ])
    }
  }, [isOpen, messages.length])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: [...messages, userMessage] })
      })

      if (!response.ok) {
        throw new Error("La respuesta de la red no fue exitosa.")
      }

      const data = await response.json()
      setMessages((prev) => [...prev, data.message])

    } catch (error) {
      console.error("Error al obtener la respuesta del chatbot:", error)
      const errorMessage: Message = { role: 'model', content: 'Lo siento, estoy teniendo problemas para conectarme. Por favor, intenta de nuevo más tarde.' }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isDashboard) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-[calc(100vw-2rem)] sm:w-96 h-[70vh] bg-card border shadow-2xl rounded-2xl flex flex-col origin-bottom-right"
          >
            <header className="flex items-center justify-between p-4 border-b bg-primary/90 text-primary-foreground rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-full bg-primary-foreground/20">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Asistente Virtual</h3>
                  <p className="text-xs text-primary-foreground/80">YO TE LLEVO</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-primary-foreground/80 hover:text-white hover:bg-primary-foreground/20">
                <X className="w-5 h-5" />
              </Button>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {messages.map((message, index) => (
                <div key={index} className={cn("flex items-start gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
                  {message.role === 'model' && <div className="p-1.5 rounded-full bg-muted text-primary"><Bot className="w-6 h-6" /></div>}
                  <div className={cn(
                      "p-3 rounded-2xl max-w-[85%] text-sm",
                      message.role === 'user'
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted rounded-bl-none"
                  )}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-3 justify-start">
                   <div className="p-1.5 rounded-full bg-muted text-primary"><Bot className="w-6 h-6" /></div>
                   <div className="p-3 rounded-2xl max-w-[85%] text-sm bg-muted rounded-bl-none flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground"/>
                      <span className="text-muted-foreground">Escribiendo...</span>
                   </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 border-t bg-background rounded-b-2xl">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu consulta..."
                autoComplete="off"
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
       <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.5,
        }}
      >
         <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 rounded-full shadow-2xl"
          aria-label="Abrir chatbot"
        >
         {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8"/>}
        </Button>
      </motion.div>
    </div>
  )
}
