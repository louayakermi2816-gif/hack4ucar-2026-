import { useState, useRef, useEffect } from "react";
import api from "../api";
import SectionTitle from "../components/ui/SectionTitle";
import { Sparkles, Send } from "lucide-react";

interface Message { id: number; role: "user" | "assistant"; content: string; timestamp: Date; }

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "assistant", content: "Bonjour! Je suis l'assistant IA de UcarOS. Posez-moi une question sur les indicateurs de performance. 🎓", timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now(), role: "user", content: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await api.post("/api/chat", { message: userMsg.content });
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", content: res.data.reply, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", content: "Désolé, une erreur s'est produite. Réessayez.", timestamp: new Date() }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
          <Sparkles size={20} />
        </div>
        <div>
          <SectionTitle title="Assistant IA" subtitle="Propulsé par Mistral AI • Données en temps réel" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] px-5 py-3.5 text-[13px] leading-relaxed font-medium ${
              msg.role === "user"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 rounded-2xl rounded-br-md shadow-lg shadow-amber-500/20"
                : "bg-zinc-900 border border-white/[0.06] text-zinc-200 rounded-2xl rounded-bl-md"
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-[10px] mt-2 font-medium uppercase tracking-wider ${msg.role === "user" ? "text-amber-800" : "text-zinc-600"}`}>
                {msg.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-900 border border-white/[0.06] px-5 py-4 rounded-2xl rounded-bl-md">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-5 flex gap-3">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Posez une question sur les KPIs..."
          className="flex-1 px-5 py-3.5 rounded-xl bg-zinc-900 border border-white/[0.06] text-zinc-200 text-[13px] font-medium placeholder-zinc-600 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all"
          disabled={loading} />
        <button onClick={sendMessage} disabled={loading || !input.trim()}
          className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 rounded-xl font-bold text-[13px] hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-40 cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-2">
          <Send size={16} />
          Envoyer
        </button>
      </div>
    </div>
  );
}
