import { useState } from "react";
import type { StoryPath } from "../stories/types";

interface Props {
  paths: Record<string, StoryPath>;
  onAutoplay: (commands: readonly string[], delayMs?: number) => Promise<void>;
  onReset: () => Promise<void>;
}

export function DevPanel({ paths, onAutoplay, onReset }: Props) {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState<string | null>(null);

  const run = async (id: string, path: StoryPath) => {
    if (running) return;
    setRunning(id);
    try {
      await onAutoplay(path.commands, 220);
    } finally {
      setRunning(null);
    }
  };

  const handleReset = async () => {
    if (running) return;
    setRunning("reset");
    try {
      await onReset();
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="dev-panel">
      <button
        className="dev-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle dev panel"
      >
        DEV
      </button>
      {open && (
        <div className="dev-menu">
          <div className="dev-title">Autoplay</div>
          {Object.entries(paths).map(([id, path]) => (
            <button
              key={id}
              className="dev-btn"
              disabled={running !== null}
              onClick={() => run(id, path)}
            >
              {running === id ? "▶ running…" : path.label}
            </button>
          ))}
          <hr className="dev-hr" />
          <button
            className="dev-btn dev-btn--secondary"
            disabled={running !== null}
            onClick={handleReset}
          >
            {running === "reset" ? "…" : "Reset"}
          </button>
        </div>
      )}
    </div>
  );
}
