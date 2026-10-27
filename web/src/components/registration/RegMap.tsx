"use client";

import { chkCoord } from "@/lib/registration";
import type { RegData } from "@/lib/registration";

export interface MapSnap {
  lat?: string;
  lng?: string;
  mapQuery?: string;
}

export const MAP_KEYS = ["lat", "lng", "mapQuery"];

export const pickMap = (d: RegData | undefined): MapSnap => ({ lat: d?.lat, lng: d?.lng, mapQuery: d?.mapQuery });

/** Renders from a snapshot so the iframe only reloads when the caller refreshes it (on blur), not on every keystroke. */
export default function RegMap({ snap, id }: { snap: MapSnap; id?: string }) {
  const lat = String(snap.lat ?? "").trim();
  const lng = String(snap.lng ?? "").trim();
  const valid = lat !== "" && lng !== "" && !chkCoord(-90, 90, "")(lat) && !chkCoord(-180, 180, "")(lng);
  const q = valid ? `${lat},${lng}` : String(snap.mapQuery || "").trim();
  return (
    <div className="reg-map" id={id}>
      {!q ? (
        <div className="reg-map-empty">ค้นหาสถานที่ หรือระบุละติจูด/ลองจิจูด เพื่อแสดงแผนที่</div>
      ) : (
        <>
          <iframe
            className="reg-map-frame"
            title="แผนที่ตำแหน่งที่ตั้ง"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <a className="text-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`} target="_blank" rel="noopener noreferrer">
            เปิดใน Google Maps →
          </a>
        </>
      )}
    </div>
  );
}
