import { gsap } from "gsap";
import { useCallback, useRef, useState } from "react";
import type { OutputLine } from "../engine/types";

export function useTypewriter() {
  const [lines, setLines] = useState<OutputLine[]>([]);
  const idCounterRef = useRef(0);

  const pushLine = useCallback((text: string, cls?: string) => {
    const id = idCounterRef.current++;
    setLines((prev) => [...prev, { id, text, cls, typing: false }]);
  }, []);

  const typeLine = useCallback((text: string, cls?: string): Promise<void> => {
    return new Promise((resolve) => {
      const id = idCounterRef.current++;
      setLines((prev) => [...prev, { id, text: "", cls, typing: true }]);

      if (!text.length) {
        setLines((prev) =>
          prev.map((l) => (l.id === id ? { ...l, typing: false } : l)),
        );
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
          const chars = Math.floor(target.i);
          setLines((prev) =>
            prev.map((l) =>
              l.id === id ? { ...l, text: text.slice(0, chars) } : l,
            ),
          );
        },
        onComplete() {
          setLines((prev) =>
            prev.map((l) => (l.id === id ? { ...l, text, typing: false } : l)),
          );
          setTimeout(resolve, 90);
        },
      });
    });
  }, []);

  const clearLines = useCallback(() => {
    gsap.killTweensOf({});
    setLines([]);
  }, []);

  return { lines, pushLine, typeLine, clearLines };
}
