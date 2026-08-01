"use client";

import { useEffect, useRef } from "react";

export function LeaderboardWidget() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (
        e.data &&
        e.data.type === "golfai:resize" &&
        e.data.tournamentId === "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5"
      ) {
        if (iframeRef.current) {
          iframeRef.current.style.height = `${e.data.height}px`;
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <iframe
      ref={iframeRef}
      id="golfai-widget-aaaaaaaa"
      src="https://leaderboard.parthbhardwaj.com/embed/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5?theme=dark&compact=false&header=true&modules=leaderboard%2Cmatchups&primaryColor=%2316a34a&branding=white-label"
      width="100%"
      height="700"
      frameBorder="0"
      allow="clipboard-write"
      style={{
        borderRadius: "12px",
        border: "1px solid #374151",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        transition: "height 0.2s ease",
      }}
      title="Live Leaderboard"
    />
  );
}
