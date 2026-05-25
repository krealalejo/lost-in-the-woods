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

export interface StoryPath {
  label: string;
  commands: readonly string[];
}

export interface Story {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
  initialState(): GameState;
  getIntro(): GameEffect[];
  getMap(state: Readonly<GameState>): string;
  parse(raw: string): ParsedCommand;
  handle(state: Readonly<GameState>, command: ParsedCommand): GameEffect[];
  readonly paths?: Record<string, StoryPath>;
}
