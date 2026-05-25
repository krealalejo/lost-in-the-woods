import { useCallback, useEffect, useRef, useState } from "react";
import type { GameEffect, GameState } from "../engine/types";
import type { Story } from "../stories/types";
import { useTypewriter } from "./useTypewriter";

export function useGameEngine(story: Story) {
  const stateRef = useRef<GameState>(story.initialState());
  const [displayState, setDisplayState] = useState<GameState>(stateRef.current);
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const historyRef = useRef<string[]>([]);
  const histIdxRef = useRef(-1);

  const { lines, pushLine, typeLine, clearLines } = useTypewriter();

  const syncDisplay = useCallback(() => {
    setDisplayState({ ...stateRef.current });
  }, []);

  const applyEffect = useCallback(
    async (effect: GameEffect) => {
      switch (effect.type) {
        case "PRINT":
          await typeLine(effect.text, effect.cls);
          break;
        case "SET_LOCATION":
          stateRef.current = { ...stateRef.current, location: effect.location };
          syncDisplay();
          break;
        case "SET_FLAG":
          stateRef.current = {
            ...stateRef.current,
            flags: { ...stateRef.current.flags, [effect.key]: effect.value },
          };
          syncDisplay();
          break;
        case "ADD_TO_INVENTORY":
          stateRef.current = {
            ...stateRef.current,
            inventory: [...stateRef.current.inventory, effect.item],
          };
          syncDisplay();
          break;
        case "REMOVE_FROM_INVENTORY":
          stateRef.current = {
            ...stateRef.current,
            inventory: stateRef.current.inventory.filter(
              (i) => i !== effect.item,
            ),
          };
          syncDisplay();
          break;
        case "INCREMENT_TURNS":
          stateRef.current = {
            ...stateRef.current,
            turns: stateRef.current.turns + 1,
          };
          syncDisplay();
          break;
        case "END_GAME":
          stateRef.current = { ...stateRef.current, ended: effect.ending };
          syncDisplay();
          break;
        case "DELAY":
          await new Promise<void>((r) => setTimeout(r, effect.ms));
          break;
        case "RELOAD":
          globalThis.location.reload();
          break;
      }
    },
    [syncDisplay, typeLine],
  );

  const processEffects = useCallback(
    async (effects: GameEffect[]) => {
      for (const effect of effects) {
        await applyEffect(effect);
      }
    },
    [applyEffect],
  );

  const setBusyBoth = useCallback((value: boolean) => {
    busyRef.current = value;
    setBusy(value);
  }, []);

  const submit = useCallback(
    async (raw: string) => {
      if (busyRef.current || stateRef.current.ended) return;
      const trimmed = raw.trim();
      if (!trimmed) return;

      setBusyBoth(true);

      historyRef.current = [...historyRef.current, trimmed];
      histIdxRef.current = historyRef.current.length;

      pushLine(trimmed, "cmd");

      const cmd = story.parse(trimmed);
      if (cmd.verb) {
        const effects = story.handle(stateRef.current, cmd);
        await processEffects(effects);
      } else {
        await typeLine("I don't understand that.", "bad");
      }

      setBusyBoth(false);
    },
    [story, processEffects, pushLine, typeLine, setBusyBoth],
  );

  const historyPrev = useCallback(() => {
    if (!historyRef.current.length) return "";
    histIdxRef.current = Math.max(0, histIdxRef.current - 1);
    return historyRef.current[histIdxRef.current] ?? "";
  }, []);

  const historyNext = useCallback(() => {
    if (!historyRef.current.length) return "";
    histIdxRef.current = Math.min(
      historyRef.current.length,
      histIdxRef.current + 1,
    );
    return historyRef.current[histIdxRef.current] ?? "";
  }, []);

  const reset = useCallback(async () => {
    clearLines();
    stateRef.current = story.initialState();
    syncDisplay();
    historyRef.current = [];
    histIdxRef.current = -1;
    setBusyBoth(true);
    await processEffects(story.getIntro());
    setBusyBoth(false);
  }, [story, clearLines, syncDisplay, processEffects, setBusyBoth]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setBusyBoth(true);
      await processEffects(story.getIntro());
      if (!cancelled) setBusyBoth(false);
    };
    run();
    return () => {
      cancelled = true;
      clearLines();
      stateRef.current = story.initialState();
      setBusyBoth(false);
    };
  }, []);

  return {
    state: displayState,
    lines,
    busy,
    submit,
    historyPrev,
    historyNext,
    reset,
  };
}
