import { useEffect, useRef, useState } from "react";

interface Props {
  mapHtml: string;
}

const SCAN_BATCH = 5;
const SCAN_INTERVAL_MS = 300;

export function MapPanel({ mapHtml }: Readonly<Props>) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const ghostRef = useRef<HTMLPreElement>(null);
  const [visibleLines, setVisibleLines] = useState(0);

  const lines = mapHtml.split("\n");
  const totalLines = lines.length;
  const isAnimating = visibleLines < totalLines;
  const displayHtml = isAnimating
    ? lines.slice(0, visibleLines).join("\n")
    : mapHtml;

  // Fit font using ghost pre (full content) so scale is correct before animation starts
  useEffect(() => {
    const wrap = wrapRef.current;
    const ghost = ghostRef.current;
    const pre = preRef.current;
    if (!wrap || !ghost || !pre) return;

    const fit = () => {
      ghost.style.fontSize = "12px";
      ghost.style.lineHeight = "1.05";
      const cs = getComputedStyle(wrap);
      const padH =
        Number.parseFloat(cs.paddingLeft) + Number.parseFloat(cs.paddingRight);
      const padV =
        Number.parseFloat(cs.paddingTop) + Number.parseFloat(cs.paddingBottom);
      const availW = wrap.clientWidth - padH;
      const availH = wrap.clientHeight - padV;
      const naturalW = ghost.scrollWidth;
      const naturalH = ghost.scrollHeight;
      if (naturalW === 0 || naturalH === 0) return;
      /* istanbul ignore next */
      {
        const scale = Math.min(availW / naturalW, availH / naturalH);
        const fs = Math.max(scale * 12, 1);
        // Stretch line-height to fill remaining vertical space after font scaling
        const lh = (availH * 1.05) / (naturalH * scale);
        ghost.style.fontSize = `${fs}px`;
        ghost.style.lineHeight = `${lh}`;
        pre.style.fontSize = `${fs}px`;
        pre.style.lineHeight = `${lh}`;
      }
    };

    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    fit();
    return () => ro.disconnect();
  }, [mapHtml]);

  // Scan animation: reveal SCAN_BATCH lines per tick
  useEffect(() => {
    setVisibleLines(0);
    const id = setInterval(() => {
      setVisibleLines((prev) => {
        const next = prev + SCAN_BATCH;
        if (next >= totalLines) {
          clearInterval(id);
          return totalLines;
        }
        return next;
      });
    }, SCAN_INTERVAL_MS);
    return () => clearInterval(id);
  }, [mapHtml, totalLines]);

  return (
    <div
      className="map-wrap"
      ref={wrapRef}
      style={isAnimating ? { alignItems: "flex-start" } : undefined}
    >
      {/* ghost pre: full content, hidden, used only for font-size measurement */}
      <pre
        className="map"
        ref={ghostRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          visibility: "hidden",
          pointerEvents: "none",
        }}
        dangerouslySetInnerHTML={{ __html: mapHtml }}
      />
      {/* mapHtml contains hardcoded ASCII art with span tokens — not user input */}
      <pre
        className="map"
        ref={preRef}
        dangerouslySetInnerHTML={{ __html: displayHtml }}
      />
    </div>
  );
}
