import type { GameEffect, GameState } from "../engine/types";
import type { ParsedCommand } from "../stories/types";

type HandleFn = (
  state: Readonly<GameState>,
  cmd: ParsedCommand,
) => GameEffect[];
type ParseFn = (raw: string) => ParsedCommand;

export function makeGameHelpers(handle: HandleFn, parse: ParseFn) {
  return {
    effectTypes: (state: GameState, input: string) =>
      handle(state, parse(input)).map((e) => e.type),
    firstPrint: (state: GameState, input: string): string => {
      const effects = handle(state, parse(input));
      const p = effects.find((e) => e.type === "PRINT");
      return p && "text" in p ? p.text : "";
    },
    allPrints: (state: GameState, input: string): string[] =>
      handle(state, parse(input))
        .filter((e) => e.type === "PRINT")
        .map((e) => ("text" in e ? e.text : "")),
  };
}
