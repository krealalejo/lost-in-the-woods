import { gsap } from "gsap";
import { useCallback, useRef, useState } from "react";
import type { OutputLine } from "../engine/types";

export function useTypewriter() {
  const [lines, setLines] = useState<OutputLine[]>([]);
  const idCounterRef = useRef(0);

  const updateLine = useCallback(
    (id: number, patch: Partial<OutputLine>) =>
      setLines((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...patch } : l)),
      ),
    [],
  );

  const pushLine = useCallback((text: string, cls?: string) => {
    const id = idCounterRef.current++;
    setLines((prev) => [...prev, { id, text, cls, typing: false }]);
  }, []);

  const typeLine = useCallback(
    (text: string, cls?: string): Promise<void> =>
      new Promise((resolve) => {
        const id = idCounterRef.current++;
        setLines((prev) => [...prev, { id, text: "", cls, typing: true }]);

        if (!text.length) {
          updateLine(id, { typing: false });
          setTimeout(resolve, 120);
          return;
        }

        const target = { i: 0 };
        const duration = Math.max(0.4, Math.min(3.2, text.length / 28));

        gsap.to(target, {
          i: text.length,
          duration,
          ease: "none",
          onUpdate() {
            updateLine(id, { text: text.slice(0, Math.floor(target.i)) });
          },
          onComplete() {
            updateLine(id, { text, typing: false });
            setTimeout(resolve, 90);
          },
        });
      }),
    [updateLine],
  );

  const clearLines = useCallback(() => {
    gsap.killTweensOf({});
    setLines([]);
  }, []);

  return { lines, pushLine, typeLine, clearLines };
}
