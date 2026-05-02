import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import api from "../api";
import { useTheme } from "../ThemeProvider";

interface SmartInsightsProps {
  selectedMapIds: string[];
}

export default function SmartInsights({ selectedMapIds }: SmartInsightsProps) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const isDark = theme === "dark";

  const queryParams = selectedMapIds.length > 0 ? `?inst_ids=${selectedMapIds.join(",")}&language=${i18n.language}` : `?language=${i18n.language}`;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["smart-insights", selectedMapIds, i18n.language],
    queryFn: () => api.get(`/api/chat/insights${queryParams}`).then((res) => res.data),
    staleTime: 60000, // Cache for 1 min
  });
  const renderBoldText = (text: string) => {
    const parts = text.split(/\*\*/);
    return parts.map((part, i) => 
      i % 2 === 1 ? <strong key={i} style={{ color: 'var(--uc-text-primary)', fontWeight: 700 }}>{part}</strong> : part
    );
  };

  return (
    <div className="uc-chart-card animate-fade-in-up stagger-2" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Decorative AI Glow */}
      <div style={{
        position: 'absolute', top: -50, right: -50, width: 150, height: 150,
        background: 'var(--uc-accent)', filter: 'blur(80px)', opacity: isDark ? 0.15 : 0.05, borderRadius: '50%'
      }} />

      <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
        <div className="uc-icon-badge" style={{ background: 'var(--uc-accent)', color: isDark ? '#0a0d15' : 'white' }}>
          <Sparkles size={18} />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--uc-text-primary)' }}>
          {t("dashboard.ai_insights") || "Insights IA (Mistral)"}
        </h3>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <Loader2 className="animate-spin" size={28} color="var(--uc-accent)" />
          <p style={{ color: 'var(--uc-text-muted)', fontSize: 13 }}>Analyse des données en cours...</p>
        </div>
      ) : isError ? (
        <div className="flex items-center gap-3 p-4 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
          <AlertCircle size={20} />
          <p style={{ fontSize: 13, fontWeight: 500 }}>Erreur de connexion à l'IA.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {data?.insights?.map((insight: string, idx: number) => (
            <li key={idx} className="flex items-start gap-3 animate-fade-in-up" style={{ animationDelay: `${idx * 150}ms` }}>
              <div style={{ marginTop: 6, minWidth: 6, height: 6, borderRadius: '50%', background: 'var(--uc-accent)' }} />
              <p style={{ fontSize: 14, color: 'var(--uc-text-secondary)', lineHeight: 1.6, fontWeight: 500 }}>
                {renderBoldText(insight)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
