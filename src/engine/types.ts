export interface GameState {
  location: string;
  inventory: string[];
  flags: Record<string, unknown>;
  turns: number;
  ended: string | null;
}

export interface OutputLine {
  id: number;
  text: string;
  cls?: string;
  typing: boolean;
}

export type GameEffect =
  | { type: "PRINT"; text: string; cls?: string }
  | { type: "SET_LOCATION"; location: string }
  | { type: "SET_FLAG"; key: string; value: unknown }
  | { type: "ADD_TO_INVENTORY"; item: string }
  | { type: "REMOVE_FROM_INVENTORY"; item: string }
  | { type: "END_GAME"; ending: string }
  | { type: "DELAY"; ms: number }
  | { type: "RELOAD" }
  | { type: "INCREMENT_TURNS" };
