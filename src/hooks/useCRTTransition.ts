import { gsap } from "gsap";
import { useCallback, useRef } from "react";

export function useCRTTransition() {
  const backdropRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  const startTransition = useCallback((onSwitch: () => void): void => {
    const backdrop = backdropRef.current;
    const line = lineRef.current;
    if (!backdrop || !line) {
      onSwitch();
      return;
    }

    gsap.killTweensOf([backdrop, line]);

    const tl = gsap.timeline();

    // CRT TURN OFF
    tl.set(backdrop, { display: "block", opacity: 1 })
      .set(line, {
        scaleY: 1,
        filter: "brightness(1)",
        transformOrigin: "50% 50%",
      })
      // phosphor discharge flash
      .to(line, {
        filter: "brightness(2.5)",
        duration: 0.06,
        ease: "power2.in",
      })
      // collapse vertically — phosphors concentrate to thin line
      .to(line, {
        scaleY: 0.012,
        filter: "brightness(7)",
        duration: 0.22,
        ease: "power3.in",
      })
      // line dims and fades
      .to(line, {
        filter: "brightness(0.3)",
        duration: 0.18,
        ease: "power2.in",
      })
      // story switch while screen is dark
      .call(onSwitch)

      // CRT TURN ON
      .set(line, { scaleY: 0.012, filter: "brightness(5)" })
      // expand from thin line
      .to(line, {
        scaleY: 1,
        filter: "brightness(2)",
        duration: 0.34,
        ease: "power2.out",
      })
      // phosphor stabilization flicker
      .to(line, { filter: "brightness(0.5)", duration: 0.05 })
      .to(line, { filter: "brightness(2)", duration: 0.05 })
      .to(line, { filter: "brightness(0.7)", duration: 0.04 })
      .to(line, { filter: "brightness(1)", duration: 0.08 })
      // fade backdrop to reveal new content
      .to(backdrop, { opacity: 0, duration: 0.38, ease: "power1.in" })
      .set(backdrop, { display: "none" });
  }, []);

  return { startTransition, backdropRef, lineRef };
}
