"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { haversineDistanceM } from "@/lib/geo";
import type { RoutePoint } from "@/lib/data/types";

export type TrackerStatus = "idle" | "tracking" | "paused" | "stopped";

interface TrackerState {
  status: TrackerStatus;
  route: RoutePoint[];
  distanceM: number;
  durationS: number;
  error: string | null;
}

export function useGeoTracker() {
  const [state, setState] = useState<TrackerState>({
    status: "idle",
    route: [],
    distanceM: 0,
    durationS: 0,
    error: null,
  });

  const watchIdRef = useRef<number | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeSecondsRef = useRef(0);

  const clearWatch = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== "undefined") {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const clearTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  useEffect(() => () => {
    clearWatch();
    clearTick();
  }, [clearWatch, clearTick]);

  const start = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState((s) => ({ ...s, error: "이 브라우저에서는 위치 정보를 사용할 수 없어요." }));
      return;
    }

    activeSecondsRef.current = 0;
    setState({ status: "tracking", route: [], distanceM: 0, durationS: 0, error: null });

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const point: RoutePoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          t: Date.now(),
        };
        setState((s) => {
          if (s.status !== "tracking") return s;
          const last = s.route.at(-1);
          const addedDistance = last ? haversineDistanceM(last, point) : 0;
          return { ...s, route: [...s.route, point], distanceM: s.distanceM + addedDistance };
        });
      },
      () => {
        setState((s) => ({ ...s, error: "위치 권한을 확인해주세요." }));
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    tickRef.current = setInterval(() => {
      activeSecondsRef.current += 1;
      setState((s) => (s.status === "tracking" ? { ...s, durationS: activeSecondsRef.current } : s));
    }, 1000);
  }, []);

  const pause = useCallback(() => {
    clearWatch();
    clearTick();
    setState((s) => ({ ...s, status: "paused" }));
  }, [clearWatch, clearTick]);

  const resume = useCallback(() => {
    setState((s) => ({ ...s, status: "tracking" }));
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const point: RoutePoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          t: Date.now(),
        };
        setState((s) => {
          if (s.status !== "tracking") return s;
          const last = s.route.at(-1);
          const addedDistance = last ? haversineDistanceM(last, point) : 0;
          return { ...s, route: [...s.route, point], distanceM: s.distanceM + addedDistance };
        });
      },
      () => setState((s) => ({ ...s, error: "위치 권한을 확인해주세요." })),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
    tickRef.current = setInterval(() => {
      activeSecondsRef.current += 1;
      setState((s) => (s.status === "tracking" ? { ...s, durationS: activeSecondsRef.current } : s));
    }, 1000);
  }, []);

  const stop = useCallback(() => {
    clearWatch();
    clearTick();
    setState((s) => ({ ...s, status: "stopped" }));
  }, [clearWatch, clearTick]);

  const reset = useCallback(() => {
    activeSecondsRef.current = 0;
    setState({ status: "idle", route: [], distanceM: 0, durationS: 0, error: null });
  }, []);

  return { ...state, start, pause, resume, stop, reset };
}
