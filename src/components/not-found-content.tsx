"use client";

import { useMemo } from "react";
import {
  NameDropIntro,
  NameDropLoadingFooter,
  useNameDropLoadingProgress,
} from "@/components/name-drop-intro";

/** Space-separated words; each drops in sequence. Optional: NEXT_PUBLIC_NOT_FOUND_NAME */
function useNameWords(): string[] {
  return useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_NOT_FOUND_NAME?.trim() || "PARTH BHARDWAJ";
    const parts = raw.split(/\s+/).filter(Boolean);
    return parts.length ? parts : ["PARTH", "BHARDWAJ"];
  }, []);
}

export function NotFoundContent() {
  const nameWords = useNameWords();
  const progress = useNameDropLoadingProgress();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
      <div className="flex flex-1 flex-col items-center justify-center px-4 pb-8 pt-20">
        <NameDropIntro
          words={nameWords}
          subtitle="ERROR 404"
          progress={progress}
          showBackLink
          align="center"
          hideLoadingFooter
        />
      </div>

      <div className="w-full px-6 pb-10 pt-4 sm:px-10">
        <div className="mx-auto max-w-lg">
          <NameDropLoadingFooter progress={progress} />
        </div>
      </div>
    </div>
  );
}
