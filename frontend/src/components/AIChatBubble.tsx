/**
 * AIChatBubble.tsx — Floating AI assistant bubble (WhatsApp Meta AI style).
 *
 * Always visible in the bottom-right corner of the dashboard.
 * Click to expand into a mini chat window. Click again (or the X) to collapse.
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Minimize2 } from "lucide-react";
import api from "../api";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

export default function AIChatBubble() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      content: "Bonjour ! Je suis l'assistant IA UcarOS. Comment puis-je vous aider ? 🎓",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: Date.now(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/api/chat", { message: text });
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: res.data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: "Désolé, une erreur s'est produite." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Expanded Chat Window ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 flex flex-col"
            style={{
              width: 360,
              height: 480,
              borderRadius: 16,
              background: '#161b22',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 shrink-0"
              style={{
                height: 56,
                background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
              >
                <Sparkles size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white leading-tight">Assistant IA</p>
                <p className="text-[10px] leading-tight" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  UcarOS • En ligne
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                style={{ color: 'rgba(255,255,255,0.4)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
              >
                <Minimize2 size={14} />
              </button>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
            >
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[85%] px-3.5 py-2.5 text-[13px] leading-relaxed"
                    style={{
                      borderRadius: msg.role === "user" ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: msg.role === "user"
                        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                        : 'rgba(255,255,255,0.05)',
                      color: msg.role === "user" ? '#0a0e17' : 'rgba(255,255,255,0.85)',
                      border: msg.role === "user" ? 'none' : '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div
                    className="px-4 py-3 flex gap-1"
                    style={{
                      borderRadius: '14px 14px 14px 4px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#f59e0b', animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#f59e0b', animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#f59e0b', animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              className="px-3 py-3 flex gap-2 shrink-0"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Posez votre question..."
                disabled={loading}
                className="flex-1 bg-transparent text-[13px] text-white focus:outline-none min-w-0"
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all disabled:opacity-30"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  border: 'none',
                }}
              >
                <Send size={16} style={{ color: '#0a0e17' }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Bubble Button ── */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 cursor-pointer"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          border: 'none',
          boxShadow: '0 6px 24px rgba(245,158,11,0.35), 0 0 0 4px rgba(245,158,11,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={22} style={{ color: '#0a0e17' }} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Sparkles size={22} style={{ color: '#0a0e17' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Pulse ring animation when closed */}
      {!open && (
        <div
          className="fixed bottom-6 right-6 z-40 pointer-events-none"
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: '2px solid rgba(245,158,11,0.3)',
            animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
          }}
        />
      )}
    </>
  );
}
