'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X, Send, Sparkles, Bot, Loader2 } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatHistory {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "👋 Hello! I'm ExoQuark AI Assistant. Ask me anything about exoplanets!",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading) return;

    const userMessageText = inputValue;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: userMessageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Create initial bot message for streaming
    const botMessageId = Date.now() + 1;
    const botMessage: Message = {
      id: botMessageId,
      text: '',
      sender: 'bot',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, botMessage]);

    try {
      // Call API route for streaming
      console.log('Sending message to API...');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessageText,
          history: chatHistory,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers.get('content-type'));

      if (!response.ok) {
        let errorMessage = 'Failed to get response';
        try {
          const errorData = await response.json();
          console.error('API Error:', errorData);
          errorMessage = errorData.details || errorData.error || errorMessage;
        } catch (e) {
          console.error('Could not parse error response');
        }
        throw new Error(errorMessage);
      }

      // Check if it's a streaming response
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('text/event-stream')) {
        console.error('Unexpected content type:', contentType);
        throw new Error('Invalid response type');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (!reader) {
        throw new Error('No response reader available');
      }

      console.log('Starting to read stream...');

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('Stream reading complete');
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            
            if (data === '[DONE]') {
              console.log('Received [DONE] signal');
              break;
            }
            
            if (!data) continue;
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.error) {
                console.error('Stream error:', parsed.error);
                throw new Error(parsed.error);
              }
              
              if (parsed.text) {
                fullText += parsed.text;
                
                // Update the bot message with streamed text
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botMessageId
                      ? { ...msg, text: fullText }
                      : msg
                  )
                );
              }
            } catch (e) {
              if (e instanceof SyntaxError) {
                // Ignore JSON parsing errors for incomplete chunks
                console.warn('JSON parse error (expected for partial chunks):', data.substring(0, 50));
              } else {
                throw e;
              }
            }
          }
        }
      }

      console.log('Full response received:', fullText.substring(0, 100));

      // Update chat history
      setChatHistory((prev) => [
        ...prev,
        { role: 'user', parts: [{ text: userMessageText }] },
        { role: 'model', parts: [{ text: fullText }] },
      ]);

      // Mark streaming as complete
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? { ...msg, isStreaming: false }
            : msg
        )
      );

    } catch (error) {
      console.error('Chat error:', error);
      
      // Show error message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? { 
                ...msg, 
                text: '🌌 Sorry, I encountered an error. Please try again!',
                isStreaming: false 
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating AI Icon Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="relative h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 hover:from-blue-600 hover:via-purple-600 hover:to-cyan-600 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 border-2 border-white/20 group"
            >
              {/* Pulsing glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 opacity-50 blur-xl group-hover:opacity-75 transition-opacity duration-300 animate-pulse"></div>
              
              {/* AI Icon */}
              <div className="relative z-10">
                <Sparkles className="h-7 w-7 text-white animate-pulse" />
              </div>
              
              {/* Orbiting particles */}
              <div className="absolute inset-0 rounded-full">
                <div className="absolute top-0 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2 animate-[spin_3s_linear_infinite]"></div>
              </div>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
          >
            <Card className="bg-black/90 border-slate-700/50 backdrop-blur-xl shadow-2xl shadow-blue-500/20 overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 p-4">
                {/* Animated stars in header */}
                <div className="absolute inset-0 overflow-hidden">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                      style={{
                        left: `${(i * 7) % 100}%`,
                        top: `${(i * 13) % 100}%`,
                        animationDelay: `${(i % 3) * 0.5}s`,
                      }}
                    />
                  ))}
                </div>

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">ExoQuark AI</h3>
                      <p className="text-xs text-blue-100">Powered by Gemini</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages Container */}
              <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-950 to-black scrollbar-custom">
                {/* Space background effect */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/10 via-transparent to-transparent pointer-events-none"></div>

                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 backdrop-blur-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.text}
                        {message.isStreaming && (
                          <span className="inline-block ml-1 w-1 h-4 bg-blue-400 animate-pulse" />
                        )}
                      </p>
                      <p className="text-xs opacity-60 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-slate-900/80 border-t border-slate-700/50 backdrop-blur-sm">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about exoplanets..."
                    disabled={isLoading}
                    className="flex-1 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20 disabled:opacity-50"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || inputValue.trim() === ''}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .scrollbar-custom::-webkit-scrollbar {
          width: 8px;
        }

        .scrollbar-custom::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 4px;
        }

        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: linear-gradient(
            to bottom,
            rgba(59, 130, 246, 0.4),
            rgba(139, 92, 246, 0.4)
          );
          border-radius: 4px;
          border: 2px solid rgba(15, 23, 42, 0.3);
        }

        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            to bottom,
            rgba(59, 130, 246, 0.6),
            rgba(139, 92, 246, 0.6)
          );
        }

        /* Firefox scrollbar */
        .scrollbar-custom {
          scrollbar-width: thin;
          scrollbar-color: rgba(59, 130, 246, 0.4) rgba(15, 23, 42, 0.3);
        }
      `}</style>
    </>
  );
}
