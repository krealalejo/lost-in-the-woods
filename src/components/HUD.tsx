import { useEffect, useRef, useState } from "react";
import type { Story } from "../stories/types";

interface Props {
  location: string;
  turns: number;
  stories: Story[];
  activeStoryId: string;
  onStoryChange: (story: Story) => void;
}

export function Hud({
  location,
  turns,
  stories,
  activeStoryId,
  onStoryChange,
}: Readonly<Props>) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const activeStory = stories.find((s) => s.id === activeStoryId);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleSelect(story: Story) {
    setOpen(false);
    if (story.id !== activeStoryId) onStoryChange(story);
  }

  const titleText = activeStory
    ? `// ${activeStory.title} ${activeStory.version ?? ""}`
    : "// ???";

  return (
    <div className="hud">
      <div className="story-picker" ref={wrapRef}>
        <button
          className="title story-picker-btn"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {titleText}
          <span className="story-picker-caret">{open ? "▲" : "▼"}</span>
        </button>
        {open && (
          <ul className="story-picker-menu" role="menu">
            {stories.map((s) => (
              <li
                key={s.id}
                role="menuitem"
                aria-selected={s.id === activeStoryId}
                className={`story-picker-option${s.id === activeStoryId ? " active" : ""}`}
                onClick={() => handleSelect(s)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleSelect(s);
                }}
                tabIndex={0}
              >
                {`// ${s.title} ${s.version ?? ""}`}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="meta">
        <span>LOC: {location.toUpperCase()}</span>
        <span className="turns">TURNS: {String(turns).padStart(4, "0")}</span>
      </div>
    </div>
  );
}
