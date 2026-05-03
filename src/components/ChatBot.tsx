import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, X, MessageSquare, Loader2 } from 'lucide-react';
import { getAnalystResponse } from '../services/geminiService';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Welcome, Captain. I am your Elite Strategist. Need a pitch report or player recommendations?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    const history = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text }));
    const aiResponse = await getAnalystResponse(userMessage, history);

    setMessages(prev => [...prev, { role: 'ai', text: aiResponse || 'No response' }]);
    setIsLoading(false);
  };

  return (
    <div id="ai-chatbot" className="fixed bottom-6 right-6 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 sm:w-96 h-[500px] glass backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-stadium-red/20 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-stadium-red flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase italic tracking-tighter">Elite Strategist</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] text-white/40 font-bold uppercase">AI ANALYST ONLINE</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div 
                  key={i} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-championship-gold text-black font-bold rounded-tr-none shadow-lg shadow-championship-gold/10' 
                      : 'bg-white/5 border border-white/10 text-white rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 text-white p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-stadium-red" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Analyzing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-black/20">
              <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask for strategy..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-xs focus:border-championship-gold outline-none transition-colors placeholder:text-white/20"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-championship-gold hover:text-white disabled:opacity-20 transition-all"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-stadium-red rounded-full flex items-center justify-center shadow-xl shadow-stadium-red/20 border border-white/20 text-white hover:bg-stadium-red/90 transition-all"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
}
