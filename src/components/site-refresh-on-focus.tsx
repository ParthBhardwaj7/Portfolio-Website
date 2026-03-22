"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * When the user returns to this tab (e.g. after editing admin), refresh server components
 * so the public site shows latest DB content without a full reload.
 */
export function SiteRefreshOnFocus() {
  const router = useRouter();
  const lastHidden = useRef<number>(0);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        lastHidden.current = Date.now();
        return;
      }
      if (document.visibilityState === "visible") {
        if (Date.now() - lastHidden.current > 400) {
          router.refresh();
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [router]);

  return null;
}
