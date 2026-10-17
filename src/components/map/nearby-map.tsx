"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { memo, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { Profile } from "@/lib/types";
import { initials, profileUrl } from "@/lib/format";
import { coordsOf, distanceKm, formatDistance } from "@/lib/geo";

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

// Pin geometry in px (styles: .jz-pin in globals.css). The anchor is the tip
// of the pointer under the avatar; the card sits to the right of the avatar.
const AVATAR = 46;
const PIN_H = AVATAR + 7;
const PIN_W = 184;
const CARD_TOP = -3;
const GAP = 4;

// Same keyword → icon mapping as the mobile app's map markers.
const PROFESSION_ICONS: [RegExp, string, string][] = [
  [/farm|agri/, "eco", "#2e7d32"],
  [/doctor|medic|surgeon/, "add_box", "#d32f2f"],
  [/nurse/, "medical_services", "#0288d1"],
  [/teacher|tutor|prof|edu/, "school", "#1976d2"],
  [/developer|coder|software|programmer|web/, "laptop_chromebook", "#0d47a1"],
  [/engineer|civil|mech/, "settings", "#455a64"],
  [/tailor|stitch|fashion/, "content_cut", "#00796b"],
  [/chef|cook|bak|food/, "restaurant", "#e65100"],
  [/photo|video|film/, "photo_camera", "#6a1b9a"],
  [/electr/, "bolt", "#f57f17"],
  [/plumb/, "plumbing", "#0097a7"],
  [/driver|deliver|cab/, "directions_car", "#388e3c"],
  [/design|art/, "palette", "#c2185b"],
];

function professionIcon(profession = "") {
  const match = PROFESSION_ICONS.find(([re]) => re.test(profession.toLowerCase()));
  return match ? { name: match[1], color: match[2] } : { name: "work", color: "#7230e6" };
}

interface Pin {
  profile: Profile;
  pos: [number, number];
  km: number;
}

interface PinProps {
  pin: Pin;
  compact: boolean;
  /** Vertical shift (px) when several profiles share one spot. */
  dy: number;
  active: boolean;
}

function pinIcon({ pin: { profile: p, km }, compact, dy, active }: PinProps) {
  const role = professionIcon(p.profession);
  const avatar = p.profileImageUrl
    ? `<img src="${escapeHtml(p.profileImageUrl)}" alt="" />`
    : `<span class="jz-pin__initials">${escapeHtml(initials(p.name))}</span>`;
  return L.divIcon({
    className: ["jz-pin", compact && "jz-pin--compact", active && "jz-pin--active"].filter(Boolean).join(" "),
    iconSize: [PIN_W, PIN_H],
    iconAnchor: [AVATAR / 2, PIN_H - dy],
    html: `<div class="jz-pin__card">
        <span class="jz-pin__distance"><span class="material-symbols-outlined filled">location_on</span>${formatDistance(km)}</span>
        <span class="jz-pin__name"><span>${escapeHtml(p.name || p.userName || "User")}</span>${p.isVerified ? '<span class="material-symbols-outlined filled jz-pin__verified">verified</span>' : ""}</span>
        <span class="jz-pin__role"><span class="material-symbols-outlined filled" style="color:${role.color}">${role.name}</span><span>${escapeHtml(p.profession || "Freelancer")}</span></span>
      </div>
      <div class="jz-pin__avatar">${avatar}</div>
      <div class="jz-pin__tip"></div>`,
  });
}

const ProfilePin = memo(function ProfilePin({ pin, compact, dy, active }: PinProps) {
  const router = useRouter();
  const icon = useMemo(() => pinIcon({ pin, compact, dy, active }), [pin, compact, dy, active]);
  return (
    <Marker
      position={pin.pos}
      icon={icon}
      zIndexOffset={active ? 1000 : 0}
      eventHandlers={{ click: () => router.push(profileUrl(pin.profile._id)) }}
    />
  );
});

/**
 * Decides which pins show their card at the current zoom. Nearest first: a pin
 * whose card would overlap one already placed collapses to its avatar (hover
 * still reveals the card). Profiles sharing the same spot are stacked so each
 * one stays visible and clickable.
 */
function usePinLayout(pins: Pin[]) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });

  return useMemo(() => {
    const spots = new Map<string, Pin[]>();
    for (const pin of pins) {
      const key = pin.pos.map((n) => n.toFixed(4)).join();
      spots.set(key, [...(spots.get(key) ?? []), pin]);
    }
    const offsetY = new Map<string, number>();
    const step = PIN_H - CARD_TOP + GAP;
    for (const group of spots.values()) {
      group.forEach((pin, i) => offsetY.set(pin.profile._id, (i - (group.length - 1) / 2) * step));
    }

    const placed: { x: number; y: number; w: number; h: number }[] = [];
    const overlaps = (r: (typeof placed)[number]) =>
      placed.some((q) => r.x < q.x + q.w + GAP && r.x + r.w + GAP > q.x && r.y < q.y + q.h + GAP && r.y + r.h + GAP > q.y);

    const layout = new Map<string, { compact: boolean; dy: number }>();
    for (const pin of [...pins].sort((a, b) => a.km - b.km)) {
      const dy = offsetY.get(pin.profile._id) ?? 0;
      const pt = map.project(pin.pos, zoom);
      const x = pt.x - AVATAR / 2;
      const y = pt.y + dy - PIN_H;
      const card = { x, y: y + CARD_TOP, w: PIN_W, h: PIN_H - CARD_TOP };
      const compact = overlaps(card);
      placed.push(compact ? { x, y, w: AVATAR, h: PIN_H } : card);
      layout.set(pin.profile._id, { compact, dy });
    }
    return layout;
  }, [map, pins, zoom]);
}

function ProfilePins({ pins, activeId }: { pins: Pin[]; activeId?: string | null }) {
  const layout = usePinLayout(pins);
  return (
    <>
      {pins.map((pin) => {
        const l = layout.get(pin.profile._id);
        return (
          <ProfilePin
            key={pin.profile._id}
            pin={pin}
            compact={l?.compact ?? true}
            dy={l?.dy ?? 0}
            active={pin.profile._id === activeId}
          />
        );
      })}
    </>
  );
}

const youIcon = L.divIcon({
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  html: `<div style="width:20px;height:20px;border-radius:9999px;background:#7230e6;border:4px solid #fff;box-shadow:0 0 0 6px rgba(114,48,230,.2)"></div>`,
});

/**
 * Fits the search radius into the part of the map not covered by the header
 * and list pill, leaving room above for pins near the top edge.
 */
function Recenter({ center, radiusKm }: { center: [number, number]; radiusKm: number }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(L.latLng(center).toBounds(radiusKm * 2000), {
      animate: true,
      paddingTopLeft: [16, 122 + PIN_H],
      paddingBottomRight: [16, 64],
    });
  }, [map, center, radiusKm]);
  return null;
}

/** Pans to a highlighted pin only when it is off-screen. */
function PanIntoView({ target }: { target: [number, number] | null }) {
  const map = useMap();
  const [lat, lng] = target ?? [];
  useEffect(() => {
    if (lat === undefined || lng === undefined) return;
    if (!map.getBounds().contains([lat, lng])) map.panTo([lat, lng]);
  }, [map, lat, lng]);
  return null;
}

export default function NearbyMap({
  center,
  radiusKm,
  profiles,
  activeId,
}: {
  center: [number, number];
  radiusKm: number;
  profiles: Profile[];
  activeId?: string | null;
}) {
  const pins = useMemo(
    () =>
      profiles.flatMap((profile) => {
        const pos = coordsOf(profile);
        return pos ? [{ profile, pos, km: distanceKm(center, pos) }] : [];
      }),
    [profiles, center],
  );
  const active = pins.find((p) => p.profile._id === activeId);

  return (
    <MapContainer center={center} zoom={12} className="h-full w-full" zoomControl={false} attributionControl>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter center={center} radiusKm={radiusKm} />
      <PanIntoView target={active?.pos ?? null} />
      <Circle
        center={center}
        radius={radiusKm * 1000}
        interactive={false}
        pathOptions={{ color: "#7230e6", weight: 1.5, opacity: 0.35, fillOpacity: 0.04 }}
      />
      <Marker position={center} icon={youIcon} interactive={false} keyboard={false} />
      <ProfilePins pins={pins} activeId={activeId} />
    </MapContainer>
  );
}
