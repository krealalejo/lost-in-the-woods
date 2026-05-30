import { useCallback, useEffect, useState } from "react";
import { BackpackPanel } from "./components/BackpackPanel";
import { CRTScreen } from "./components/CRTScreen";
import { Hud } from "./components/HUD";
import { InputRow } from "./components/InputRow";
import { ItemModal } from "./components/ItemModal";
import { MapPanel } from "./components/MapPanel";
import { OutputLog } from "./components/OutputLog";
import { TouchPad } from "./components/TouchPad";
import type { Item } from "./engine/types";
import { useGameEngine } from "./hooks/useGameEngine";
import { useCRTTransition } from "./hooks/useCRTTransition";
import { ALL_STORIES } from "./stories/index";
import { THEME_VARS } from "./stories/types";
import type { Story } from "./stories/types";

interface GameScreenProps {
  story: Story;
  onStoryChange: (story: Story) => void;
}

function GameScreen({ story, onStoryChange }: Readonly<GameScreenProps>) {
  const { state, lines, busy, submit, historyPrev, historyNext } =
    useGameEngine(story);

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const mapHtml = story.getMap(state);
  const isDoom = state.ended === "presence";
  const isEnded = state.ended !== null;

  const handleCommand = useCallback(
    (cmd: string) => {
      submit(cmd);
    },
    [submit],
  );

  return (
    <CRTScreen doom={isDoom}>
      <Hud
        location={state.location}
        turns={state.turns}
        stories={ALL_STORIES}
        activeStoryId={story.id}
        onStoryChange={onStoryChange}
      />
      <div className="map-row">
        <MapPanel mapHtml={mapHtml} />
        <BackpackPanel items={state.inventory} onItemClick={setSelectedItem} />
      </div>
      <OutputLog lines={lines} />
      <InputRow
        disabled={isEnded}
        submitBlocked={busy}
        onSubmit={handleCommand}
        onHistoryPrev={historyPrev}
        onHistoryNext={historyNext}
      />
      <TouchPad disabled={busy || isEnded} onCommand={handleCommand} />
      <div className="footer-help">
        try: <kbd>look</kbd> <kbd>north</kbd> <kbd>take flashlight</kbd>{" "}
        <kbd>inventory</kbd> <kbd>help</kbd> &nbsp;|&nbsp; <kbd>↑</kbd>
        {"/"}
        <kbd>↓</kbd> recall
      </div>
      {selectedItem && (
        <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </CRTScreen>
  );
}

export function App() {
  const [activeStory, setActiveStory] = useState<Story>(ALL_STORIES[0]);
  const [storyKey, setStoryKey] = useState(0);
  const { startTransition, backdropRef, lineRef } = useCRTTransition();

  const handleStoryChange = useCallback(
    (story: Story) => {
      startTransition(() => {
        setActiveStory(story);
        setStoryKey((k) => k + 1);
      });
    },
    [startTransition],
  );

  useEffect(() => {
    const mql = globalThis.matchMedia("(pointer: coarse), (max-width: 720px)");
    const mqlNarrow = globalThis.matchMedia("(max-width: 520px)");

    const apply = () => {
      document.body.classList.toggle("is-mobile", mql.matches);
      document.body.classList.toggle("is-narrow", mqlNarrow.matches);
    };

    apply();
    mql.addEventListener("change", apply);
    mqlNarrow.addEventListener("change", apply);
    return () => {
      mql.removeEventListener("change", apply);
      mqlNarrow.removeEventListener("change", apply);
    };
  }, []);

  useEffect(() => {
    const el = document.documentElement;
    el.dataset.story = activeStory.id;
    THEME_VARS.forEach((v) => el.style.removeProperty(v));
    if (activeStory.theme) {
      for (const [k, v] of Object.entries(activeStory.theme)) {
        el.style.setProperty(k, v);
      }
    }
  }, [activeStory]);

  return (
    <>
      <GameScreen
        key={storyKey}
        story={activeStory}
        onStoryChange={handleStoryChange}
      />
      <div
        ref={backdropRef}
        style={{
          display: "none",
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          pointerEvents: "none",
          backgroundColor: "#000",
        }}
      >
        <div
          ref={lineRef}
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(var(--phos-rgb),0.7) 0%, rgba(var(--phos-rgb),1) 50%, rgba(var(--phos-rgb),0.7) 100%)",
            transformOrigin: "50% 50%",
          }}
        />
      </div>
    </>
  );
}
