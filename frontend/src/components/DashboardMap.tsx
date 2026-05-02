import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { useTheme } from "../ThemeProvider";
import { useTranslation } from "react-i18next";
import { Building2, Users, GraduationCap, MapPin } from "lucide-react";

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

  // State for filtering
  const [filterType, setFilterType] = useState<string>("ALL");

  const types = ["ALL", ...Array.from(new Set(institutions.map(i => i.institution_type)))];

  // Filter valid coordinates and apply type filter
  const validInstitutions = institutions.filter(
    (inst) => inst.latitude && inst.longitude && (filterType === "ALL" || inst.institution_type === filterType)
  );

  return (
    <div className="uc-card" style={{ height: "500px", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Header & Controls */}
      <div className="flex items-center justify-between px-6 py-4" style={{ background: "var(--uc-bg-card-solid)", borderBottom: "1px solid var(--uc-border)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.02em', display: "flex", alignItems: "center", gap: 8 }}>
          <MapPin size={18} style={{ color: "var(--uc-accent)" }} />
          {t("dashboard.map_title") || "Carte des Établissements (Interactive)"}
        </h3>
        
        {/* Filter Dropdown */}
        <select 
          className="px-3 py-1.5 rounded-lg border text-sm font-medium"
          style={{ 
            background: "var(--uc-search-bg)", 
            borderColor: "var(--uc-border)",
            color: "var(--uc-text-primary)"
          }}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          {types.map(type => (
            <option key={type} value={type}>{type === "ALL" ? "Tous les types" : type}</option>
          ))}
        </select>
      </div>

      {/* Map Container */}
      <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
        <MapContainer 
          center={[36.8065, 10.1815]} 
          zoom={10} 
          style={{ height: "100%", width: "100%", background: isDark ? "#0a0d15" : "#f1f5f9" }}
        >
          <TileLayer
            url={isDark ? MAP_TILES.dark : MAP_TILES.light}
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          />
          
          {validInstitutions.map((inst) => {
            const isSelected = selectedIds.includes(inst.id);
            
            // Create a custom icon using a div
            const markerHtml = `
              <div style="
                width: 24px; height: 24px; 
                background: ${isSelected ? 'var(--uc-accent)' : 'var(--uc-bg-card-solid)'}; 
                border: 2px solid var(--uc-accent); 
                border-radius: 50%; 
                box-shadow: 0 0 10px var(--uc-accent-glow);
                display: flex; align-items: center; justify-content: center;
                transition: all 0.3s ease;
                transform: scale(${isSelected ? 1.2 : 1});
              ">
                <div style="width: 8px; height: 8px; background: ${isSelected ? '#fff' : 'var(--uc-accent)'}; border-radius: 50%;"></div>
              </div>
            `;
            
            const customIcon = L.divIcon({
              html: markerHtml,
              className: "",
              iconSize: [24, 24],
              iconAnchor: [12, 12]
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
                <Tooltip direction="top" offset={[0, -10]} opacity={1} className="uc-map-tooltip">
                  <div style={{ padding: '8px 4px', minWidth: 200, color: 'var(--uc-text-primary)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--uc-accent)', textTransform: 'uppercase', marginBottom: 4 }}>
                      {inst.institution_type}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, whiteSpace: 'normal', lineHeight: 1.3 }}>
                      {inst.name}
                    </div>
                    <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--uc-text-muted)' }}>
                      <span className="flex items-center gap-1"><Users size={12}/> 1,240</span>
                      <span className="flex items-center gap-1"><GraduationCap size={12}/> 86%</span>
                    </div>
                    
                    {isSelected && (
                      <div style={{ marginTop: 10, fontSize: 11, color: '#34d399', fontWeight: 600 }}>
                        ✓ Sélectionné pour comparaison
                      </div>
                    )}
                  </div>
                </Tooltip>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* CSS for customizing the tooltip to match our theme */}
      <style>{`
        .uc-map-tooltip {
          background-color: var(--uc-bg-card-solid) !important;
          border: 1px solid var(--uc-border) !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important;
        }
        .uc-map-tooltip::before {
          border-top-color: var(--uc-border) !important;
        }
      `}</style>
    </div>
  );
}
