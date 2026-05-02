import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { useTheme } from "../ThemeProvider";
import { useTranslation } from "react-i18next";
import { Building2, Users, GraduationCap, Navigation, Filter } from "lucide-react";

// Types matching the API response
export interface MapInstitution {
  id: string;
  name: string;
  institution_type: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
}

interface DashboardMapProps {
  institutions: MapInstitution[];
  selectedIds: string[];
  onToggleSelection: (id: string) => void;
}

// Map styles based on theme
const MAP_TILES = {
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
};

export default function DashboardMap({ institutions, selectedIds, onToggleSelection }: DashboardMapProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === "dark";
  const accent = isDark ? '#D4AF37' : '#3b82f6';
  const accentGlow = isDark ? 'rgba(212,175,55,0.4)' : 'rgba(59,130,246,0.4)';

  // State for filtering
  const [filterType, setFilterType] = useState<string>("ALL");

  const types = ["ALL", ...Array.from(new Set(institutions.map(i => i.institution_type)))];

  // Filter valid coordinates and apply type filter
  const validInstitutions = institutions.filter(
    (inst) => inst.latitude && inst.longitude && (filterType === "ALL" || inst.institution_type === filterType)
  );

  const selectedCount = selectedIds.length;

  return (
    <div style={{ 
      height: "520px", 
      position: "relative", 
      overflow: "hidden", 
      display: "flex", 
      flexDirection: "column",
      borderRadius: 16,
      border: `1px solid var(--uc-border)`,
      background: 'var(--uc-bg-card)',
    }}>
      {/* Header Bar */}
      <div className="flex items-center justify-between" style={{ 
        padding: '14px 20px',
        position: 'relative',
        zIndex: 2,
        borderBottom: `1px solid var(--uc-border)`,
      }}>
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${accent}, ${isDark ? '#f5d76e' : '#60a5fa'})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 3px 10px ${isDark ? 'rgba(212,175,55,0.2)' : 'rgba(59,130,246,0.2)'}`,
          }}>
            <Navigation size={15} style={{ color: isDark ? '#0a0d15' : '#ffffff' }} />
          </div>
          {/* Title + count */}
          <div>
            <h3 style={{ 
              fontSize: 14, 
              fontWeight: 700, 
              letterSpacing: '0.03em', 
              color: 'var(--uc-text-primary)',
              lineHeight: 1.2,
            }}>
              {t("dashboard.map_title")}
            </h3>
            <span style={{ 
              fontSize: 11, 
              color: selectedCount > 0 ? accent : 'var(--uc-text-dim)', 
              fontWeight: 500,
            }}>
              {selectedCount > 0 
                ? `${selectedCount} selected` 
                : `${validInstitutions.length} institutions`
              }
            </span>
          </div>
        </div>
        
        {/* Filter dropdown */}
        <div className="flex items-center gap-2">
          <Filter size={13} style={{ color: 'var(--uc-text-dim)' }} />
          <select 
            style={{ 
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', 
              border: `1px solid var(--uc-border)`,
              color: 'var(--uc-text-primary)',
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 8,
              padding: '6px 28px 6px 10px',
              cursor: 'pointer',
              outline: 'none',
              appearance: 'auto' as any,
            }}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            {types.map(type => (
              <option key={type} value={type}>{type === "ALL" ? t("dashboard.map_filter_all") : type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Map Container */}
      <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
        <MapContainer 
          center={[36.8065, 10.1815]} 
          zoom={10} 
          style={{ height: "100%", width: "100%", background: isDark ? "#0a0d15" : "#f1f5f9" }}
          attributionControl={false}
        >
          <TileLayer
            url={isDark ? MAP_TILES.dark : MAP_TILES.light}
            attribution=""
          />
          
          {validInstitutions.map((inst) => {
            const isSelected = selectedIds.includes(inst.id);
            
            // Premium custom marker with pulse animation for selected
            const markerHtml = `
              <div style="
                position: relative;
                width: 28px; height: 28px; 
              ">
                ${isSelected ? `
                  <div style="
                    position: absolute;
                    inset: -6px;
                    border-radius: 50%;
                    background: ${accentGlow};
                    animation: mapPulse 2s ease-in-out infinite;
                  "></div>
                ` : ''}
                <div style="
                  position: relative;
                  width: 28px; height: 28px; 
                  background: ${isSelected 
                    ? `linear-gradient(135deg, ${accent}, ${isDark ? '#f5d76e' : '#60a5fa'})` 
                    : isDark ? 'rgba(15,20,30,0.9)' : 'rgba(255,255,255,0.95)'}; 
                  border: 2px solid ${isSelected ? accent : isDark ? 'rgba(212,175,55,0.5)' : 'rgba(59,130,246,0.5)'}; 
                  border-radius: 50%; 
                  box-shadow: 0 2px 12px ${isSelected ? accentGlow : 'rgba(0,0,0,0.25)'};
                  display: flex; align-items: center; justify-content: center;
                  transition: all 0.3s ease;
                  transform: scale(${isSelected ? 1.15 : 1});
                ">
                  <div style="
                    width: 8px; height: 8px; 
                    background: ${isSelected ? (isDark ? '#0a0d15' : '#fff') : accent}; 
                    border-radius: 50%;
                  "></div>
                </div>
              </div>
            `;
            
            const customIcon = L.divIcon({
              html: markerHtml,
              className: "",
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            });

            return (
              <Marker 
                key={inst.id} 
                position={[inst.latitude as number, inst.longitude as number]} 
                icon={customIcon}
                eventHandlers={{
                  click: () => onToggleSelection(inst.id)
                }}
              >
                <Tooltip direction="top" offset={[0, -14]} opacity={1} className="uc-map-tooltip">
                  <div style={{ padding: '10px 6px', minWidth: 220, color: 'var(--uc-text-primary)' }}>
                    <div style={{ 
                      fontSize: 10, 
                      fontWeight: 700, 
                      color: accent, 
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: 6,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                      <Building2 size={11} />
                      {inst.institution_type}
                    </div>
                    <div style={{ 
                      fontSize: 13, 
                      fontWeight: 700, 
                      marginBottom: 10, 
                      whiteSpace: 'normal', 
                      lineHeight: 1.35,
                      color: 'var(--uc-text-primary)',
                    }}>
                      {inst.name}
                    </div>
                    <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--uc-text-muted)' }}>
                      <span className="flex items-center gap-1"><Users size={11}/> 1,240</span>
                      <span className="flex items-center gap-1"><GraduationCap size={11}/> 86%</span>
                    </div>
                    
                    {isSelected && (
                      <div style={{ 
                        marginTop: 10, 
                        fontSize: 11, 
                        color: '#34d399', 
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                        <span style={{ 
                          width: 6, height: 6, 
                          borderRadius: '50%', 
                          background: '#34d399',
                          display: 'inline-block',
                        }} />
                        {t("dashboard.map_selected")}
                      </div>
                    )}
                  </div>
                </Tooltip>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Edge glow overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: isDark
            ? 'linear-gradient(to bottom, rgba(10,13,21,0.15) 0%, transparent 15%, transparent 85%, rgba(10,13,21,0.2) 100%)'
            : 'linear-gradient(to bottom, rgba(241,245,249,0.15) 0%, transparent 15%, transparent 85%, rgba(241,245,249,0.2) 100%)',
          zIndex: 2,
        }} />
      </div>

      {/* CSS for customizing the tooltip and animations */}
      <style>{`
        .uc-map-tooltip {
          background-color: var(--uc-bg-card-solid) !important;
          border: 1px solid var(--uc-border) !important;
          border-radius: 14px !important;
          box-shadow: 0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03) !important;
          backdrop-filter: blur(16px) !important;
        }
        .uc-map-tooltip::before {
          border-top-color: var(--uc-border) !important;
        }
        @keyframes mapPulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.8); opacity: 0; }
        }
        .leaflet-control-zoom a {
          background: ${isDark ? 'rgba(15,20,30,0.9)' : 'rgba(255,255,255,0.95)'} !important;
          color: ${accent} !important;
          border-color: var(--uc-border) !important;
          font-weight: 700 !important;
          font-size: 16px !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
        }
        .leaflet-control-zoom a:hover {
          background: ${isDark ? 'rgba(212,175,55,0.12)' : 'rgba(59,130,246,0.08)'} !important;
        }
        .leaflet-control-zoom {
          border: 1px solid var(--uc-border) !important;
          border-radius: 10px !important;
          overflow: hidden !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }
        .leaflet-control-attribution {
          display: none !important;
        }
      `}
      </style>
    </div>
  );
}
