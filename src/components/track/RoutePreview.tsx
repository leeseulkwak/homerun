"use client";

import type { RoutePoint } from "@/lib/data/types";

// 카카오/네이버 지도 API 키 없이도 동작하는 경량 경로 시각화.
// NEXT_PUBLIC_KAKAO_JS_KEY를 설정하면 실제 지도 타일 기반 컴포넌트로 교체 가능.
export default function RoutePreview({ route, height = 160 }: { route: RoutePoint[]; height?: number }) {
  if (route.length < 2) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center rounded-lg bg-emerald-50 text-sm text-emerald-700"
      >
        경로 데이터 없음
      </div>
    );
  }

  const lats = route.map((p) => p.lat);
  const lngs = route.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const padding = 8;
  const width = 320;
  const spanLat = maxLat - minLat || 1e-6;
  const spanLng = maxLng - minLng || 1e-6;

  const points = route
    .map((p) => {
      const x = padding + ((p.lng - minLng) / spanLng) * (width - padding * 2);
      const y = padding + (1 - (p.lat - minLat) / spanLat) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const [startX, startY] = points.split(" ")[0].split(",");
  const [endX, endY] = points.split(" ").at(-1)!.split(",");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      className="rounded-lg bg-emerald-50"
    >
      <polyline points={points} fill="none" stroke="#059669" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={startX} cy={startY} r={4} fill="#059669" />
      <circle cx={endX} cy={endY} r={4} fill="#dc2626" />
    </svg>
  );
}
