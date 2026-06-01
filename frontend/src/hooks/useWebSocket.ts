"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export function useWebSocket(tenantId: string | undefined) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!tenantId) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001/events";
    const socket = io(wsUrl, {
      query: { tenantId },
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [tenantId]);

  const onNewEvent = useCallback((callback: (event: any) => void) => {
    socketRef.current?.on("newEvent", callback);
    return () => socketRef.current?.off("newEvent", callback);
  }, []);

  const onEventUpdate = useCallback((callback: (event: any) => void) => {
    socketRef.current?.on("eventUpdate", callback);
    return () => socketRef.current?.off("eventUpdate", callback);
  }, []);

  return { onNewEvent, onEventUpdate };
}
