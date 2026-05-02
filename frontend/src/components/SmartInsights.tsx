import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Sparkles, Loader2, AlertCircle, Brain } from "lucide-react";
import api from "../api";
import { useTheme } from "../ThemeProvider";

interface SmartInsightsProps {
  selectedMapIds: string[];
}

export default function SmartInsights({ selectedMapIds }: SmartInsightsProps) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const isDark = theme === "dark";
  const accent = isDark ? '#D4AF37' : '#3b82f6';

  const queryParams = selectedMapIds.length > 0 ? `?inst_ids=${selectedMapIds.join(",")}&language=${i18n.language}` : `?language=${i18n.language}`;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["smart-insights", selectedMapIds, i18n.language],
    queryFn: () => api.get(`/api/chat/insights${queryParams}`).then((res) => res.data),
    staleTime: 60000, // Cache for 1 min
  });
  const renderBoldText = (text: string) => {
    const parts = text.split(/\*\*/);
    return parts.map((part, i) => 
      i % 2 === 1 ? <strong key={i} style={{ color: accent, fontWeight: 700 }}>{part}</strong> : part
    );
  };

  return (
    <div className="uc-chart-card animate-fade-in-up stagger-2" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Multi-layered decorative background */}
      <div style={{
        position: 'absolute', top: -80, right: -80, width: 200, height: 200,
        background: `radial-gradient(circle, ${isDark ? 'rgba(212,175,55,0.08)' : 'rgba(59,130,246,0.06)'} 0%, transparent 70%)`,
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -60, left: -60, width: 160, height: 160,
        background: `radial-gradient(circle, ${isDark ? 'rgba(212,175,55,0.04)' : 'rgba(59,130,246,0.03)'} 0%, transparent 70%)`,
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 24, position: 'relative', zIndex: 1 }}>
        <div className="flex items-center gap-3">
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${accent}, ${isDark ? '#f5d76e' : '#60a5fa'})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 16px ${isDark ? 'rgba(212,175,55,0.25)' : 'rgba(59,130,246,0.25)'}`,
          }}>
            <Brain size={20} style={{ color: isDark ? '#0a0d15' : '#ffffff' }} />
          </div>
          <div>
            <h3 style={{ 
              fontSize: 15, 
              fontWeight: 700, 
              letterSpacing: '0.03em',
              color: 'var(--uc-text-primary)',
              lineHeight: 1.2,
            }}>
              {t("dashboard.ai_insights")}
            </h3>
            <span style={{
              fontSize: 11,
              color: 'var(--uc-text-dim)',
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}>
              Powered by Mistral AI
            </span>
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2" style={{
          padding: '5px 12px',
          borderRadius: 20,
          background: isDark ? 'rgba(52,211,153,0.08)' : 'rgba(22,163,74,0.06)',
          border: `1px solid ${isDark ? 'rgba(52,211,153,0.15)' : 'rgba(22,163,74,0.12)'}`,
        }}>
          <span style={{
            width: 6, height: 6,
            borderRadius: '50%',
            background: '#34d399',
            display: 'inline-block',
            animation: 'livePulse 2s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: '#34d399', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Live</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-10 gap-4" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 56, height: 56,
            borderRadius: 16,
            background: isDark ? 'rgba(212,175,55,0.06)' : 'rgba(59,130,246,0.05)',
            border: `1px solid ${isDark ? 'rgba(212,175,55,0.12)' : 'rgba(59,130,246,0.1)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Loader2 className="animate-spin" size={24} color={accent} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--uc-text-muted)', fontSize: 13, fontWeight: 600 }}>{t("dashboard.ai_loading")}</p>
            <p style={{ color: 'var(--uc-text-dim)', fontSize: 11, marginTop: 4, fontWeight: 400 }}>This may take a few seconds</p>
          </div>
        </div>
      ) : isError ? (
        <div className="flex items-center gap-3 p-4 rounded-xl" style={{ 
          background: isDark ? 'rgba(239, 68, 68, 0.06)' : 'rgba(239, 68, 68, 0.04)', 
          border: '1px solid rgba(239, 68, 68, 0.12)',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: 10,
            background: 'rgba(239,68,68,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <AlertCircle size={18} color="#ef4444" />
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#ef4444' }}>{t("dashboard.ai_error")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3" style={{ position: 'relative', zIndex: 1 }}>
          {data?.insights?.map((insight: string, idx: number) => (
            <div 
              key={idx} 
              className="flex items-start gap-3 animate-fade-in-up" 
              style={{ 
                animationDelay: `${idx * 120}ms`,
                padding: '14px 16px',
                borderRadius: 12,
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'}`,
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(212,175,55,0.04)' : 'rgba(59,130,246,0.03)';
                e.currentTarget.style.borderColor = isDark ? 'rgba(212,175,55,0.1)' : 'rgba(59,130,246,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)';
                e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)';
              }}
            >
              <div style={{ 
                marginTop: 2,
                minWidth: 22, 
                height: 22, 
                borderRadius: 7,
                background: `linear-gradient(135deg, ${isDark ? 'rgba(212,175,55,0.12)' : 'rgba(59,130,246,0.1)'}, transparent)`,
                border: `1px solid ${isDark ? 'rgba(212,175,55,0.15)' : 'rgba(59,130,246,0.12)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Sparkles size={11} style={{ color: accent }} />
              </div>
              <p style={{ 
                fontSize: 13.5, 
                color: 'var(--uc-text-secondary)', 
                lineHeight: 1.65, 
                fontWeight: 500,
                letterSpacing: '0.01em',
              }}>
                {renderBoldText(insight)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}
