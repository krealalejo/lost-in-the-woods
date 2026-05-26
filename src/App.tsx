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
import { lostInWoodsStory } from "./stories/lost-in-woods/index";

const story = lostInWoodsStory;

export function App() {
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

  return (
    <CRTScreen doom={isDoom}>
      <Hud location={state.location} turns={state.turns} />
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
