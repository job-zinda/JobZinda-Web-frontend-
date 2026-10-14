"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { Circle, MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import type { Profile } from "@/lib/types";
import { initials } from "@/lib/format";
import { coordsOf } from "@/lib/geo";

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function avatarIcon(p: Profile, active: boolean) {
  const inner = p.profileImageUrl
    ? `<img src="${escapeHtml(p.profileImageUrl)}" style="width:100%;height:100%;object-fit:cover" />`
    : `<span style="font:700 13px Inter,sans-serif;color:#7230e6">${escapeHtml(initials(p.name))}</span>`;
  const size = active ? 52 : 42;
  return L.divIcon({
    className: "",
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    html: `<div style="display:flex;flex-direction:column;align-items:center">
      <div style="width:${size}px;height:${size}px;border-radius:9999px;overflow:hidden;background:#e9def8;display:flex;align-items:center;justify-content:center;border:3px solid ${active ? "#7230e6" : "#fff"};box-shadow:0 6px 16px rgba(52,49,58,.25)">${inner}</div>
      <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${active ? "#7230e6" : "#fff"};margin-top:-1px"></div>
    </div>`,
  });
}

const youIcon = L.divIcon({
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  html: `<div style="width:20px;height:20px;border-radius:9999px;background:#7230e6;border:4px solid #fff;box-shadow:0 0 0 6px rgba(114,48,230,.2)"></div>`,
});


function Recenter({ center, radiusKm }: { center: [number, number]; radiusKm: number }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(L.latLng(center).toBounds(radiusKm * 2000), { animate: true });
  }, [map, center, radiusKm]);
  return null;
}

function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, Math.max(map.getZoom(), 14), { duration: 0.6 });
  }, [map, target]);
  return null;
}

export default function NearbyMap({
  center,
  radiusKm,
  profiles,
  activeId,
  onSelect,
}: {
  center: [number, number];
  radiusKm: number;
  profiles: Profile[];
  activeId?: string | null;
  onSelect: (id: string) => void;
}) {
  const active = profiles.find((p) => p._id === activeId);
  return (
    <MapContainer center={center} zoom={12} className="h-full w-full" zoomControl={false} attributionControl>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter center={center} radiusKm={radiusKm} />
      <FlyTo target={active ? coordsOf(active) : null} />
      <Circle center={center} radius={radiusKm * 1000} pathOptions={{ color: "#7230e6", weight: 1, fillOpacity: 0.05 }} />
      <Marker position={center} icon={youIcon} />
      {profiles.map((p) => {
        const pos = coordsOf(p);
        if (!pos) return null;
        return (
          <Marker
            key={p._id}
            position={pos}
            icon={avatarIcon(p, p._id === activeId)}
            zIndexOffset={p._id === activeId ? 1000 : 0}
            eventHandlers={{ click: () => onSelect(p._id) }}
          />
        );
      })}
    </MapContainer>
  );
}
