/**
 * AIChatBubble.tsx — Premium floating AI assistant (glassmorphic dark terminal).
 *
 * Always visible in the bottom-right corner of the dashboard.
 * Click to expand into a polished chat window.
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot } from "lucide-react";
import api from "../api";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  time: string;
}

function timeNow() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AIChatBubble() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      content: "Bonjour ! Je suis l'assistant IA UcarOS. Posez-moi une question sur les indicateurs de performance. 🎓",
      time: timeNow(),
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
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: Date.now(), role: "user", content: text, time: timeNow() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/api/chat", { message: text });
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: res.data.reply, time: timeNow() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: "Désolé, une erreur s'est produite. Réessayez.", time: timeNow() },
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
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="fixed bottom-24 right-6 z-50 flex flex-col"
            style={{
              width: 380,
              height: 520,
              borderRadius: 20,
              background: 'linear-gradient(180deg, #0f1419 0%, #0a0e14 100%)',
              border: '1px solid rgba(212,175,55,0.12)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.06), 0 0 60px rgba(212,175,55,0.04)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px 20px',
                background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.02) 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #D4AF37, #8B7225)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(212,175,55,0.3)',
                }}
              >
                <Bot size={20} color="#0a0e17" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.01em' }}>
                  Assistant IA
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.5)' }} />
                  <p style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
                    UcarOS • En ligne
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: 32, height: 32, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#64748b', transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#f1f5f9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#64748b'; }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(212,175,55,0.15) transparent',
              }}
            >
              {messages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === "user" ? 'flex-end' : 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === "user" ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
                    {/* Avatar + Name */}
                    {msg.role === "assistant" && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, paddingLeft: 2 }}>
                        <Sparkles size={10} color="#D4AF37" />
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.05em' }}>UcarOS AI</span>
                      </div>
                    )}
                    <div
                      style={{
                        padding: '10px 14px',
                        fontSize: 13,
                        lineHeight: 1.6,
                        fontWeight: 450,
                        borderRadius: msg.role === "user" ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: msg.role === "user"
                          ? 'linear-gradient(135deg, #D4AF37, #a38829)'
                          : 'rgba(255,255,255,0.04)',
                        color: msg.role === "user" ? '#0a0e17' : '#e2e8f0',
                        border: msg.role === "user" ? 'none' : '1px solid rgba(255,255,255,0.06)',
                        boxShadow: msg.role === "user" ? '0 4px 16px rgba(212,175,55,0.2)' : 'none',
                      }}
                    >
                      {msg.content}
                    </div>
                    <span style={{ fontSize: 10, color: '#475569', marginTop: 4, paddingLeft: msg.role === "user" ? 0 : 2, paddingRight: msg.role === "user" ? 2 : 0 }}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, paddingLeft: 2 }}>
                      <Sparkles size={10} color="#D4AF37" />
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#D4AF37', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>UcarOS AI</span>
                    </div>
                    <div
                      style={{
                        padding: '12px 18px',
                        borderRadius: '16px 16px 16px 4px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex',
                        gap: 5,
                        alignItems: 'center',
                      }}
                    >
                      <span className="animate-bounce" style={{ width: 5, height: 5, borderRadius: '50%', background: '#D4AF37', display: 'inline-block', animationDelay: '0ms' }} />
                      <span className="animate-bounce" style={{ width: 5, height: 5, borderRadius: '50%', background: '#D4AF37', display: 'inline-block', animationDelay: '150ms' }} />
                      <span className="animate-bounce" style={{ width: 5, height: 5, borderRadius: '50%', background: '#D4AF37', display: 'inline-block', animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div
              style={{
                padding: '12px 16px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(0,0,0,0.3)',
                display: 'flex',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Posez votre question..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#e2e8f0',
                  fontSize: 13,
                  fontWeight: 500,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(212,175,55,0.3)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: (loading || !input.trim()) ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg, #D4AF37, #a38829)',
                  border: (loading || !input.trim()) ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: (loading || !input.trim()) ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: (loading || !input.trim()) ? 'none' : '0 4px 16px rgba(212,175,55,0.25)',
                  flexShrink: 0,
                }}
              >
                <Send size={16} style={{ color: (loading || !input.trim()) ? '#475569' : '#0a0e17' }} />
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
          borderRadius: 16,
          background: 'linear-gradient(135deg, #D4AF37, #8B7225)',
          border: 'none',
          boxShadow: '0 8px 32px rgba(212,175,55,0.35), 0 0 0 3px rgba(212,175,55,0.08)',
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
              <Bot size={22} style={{ color: '#0a0e17' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Subtle glow ring when closed */}
      {!open && (
        <div
          className="fixed bottom-6 right-6 z-40 pointer-events-none"
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            border: '2px solid rgba(212,175,55,0.2)',
            animation: 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
          }}
        />
      )}
    </>
  );
}
