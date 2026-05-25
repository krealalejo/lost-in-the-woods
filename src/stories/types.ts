import type { GameEffect, GameState } from "../engine/types";

export interface ParsedCommand {
  verb: string | null;
  noun: string | null;
  raw: string;
}

export type CommandHandler = (
  state: Readonly<GameState>,
  command: ParsedCommand,
) => GameEffect[] | null;

export interface Story {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly paths?: string[][];
  initialState(): GameState;
  getIntro(): GameEffect[];
  /**
   * Returns an HTML string for the map panel.
   * MUST only contain trusted, hardcoded markup — never derive this
   * from user-supplied state fields without sanitisation, as it is
   * injected via dangerouslySetInnerHTML.
   */
  getMap(state: Readonly<GameState>): string;
  getMapItems?(state: Readonly<GameState>): string[];
  parse(raw: string): ParsedCommand;
  handle(state: Readonly<GameState>, command: ParsedCommand): GameEffect[];
}
