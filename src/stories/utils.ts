import type { GameEffect, GameState } from "../engine/types";
import type { CommandHandler, ParsedCommand } from "./types";

export function chain(...handlers: CommandHandler[]): CommandHandler {
  return (state, cmd) => {
    for (const h of handlers) {
      const result = h(state, cmd);
      if (result !== null) return result;
    }
    return null;
  };
}

export function createHandle(
  universalHandler: CommandHandler,
  locationHandlers: Record<string, CommandHandler>,
): (state: Readonly<GameState>, cmd: ParsedCommand) => GameEffect[] {
  return (state, cmd) => {
    const universal = universalHandler(state, cmd);
    if (universal) return [{ type: "INCREMENT_TURNS" }, ...universal];
    const locHandler = locationHandlers[state.location];
    const locResult = locHandler?.(state, cmd) ?? [
      { type: "PRINT", text: "You can't do that here.", cls: "bad" },
    ];
    return [{ type: "INCREMENT_TURNS" }, ...locResult];
  };
}

export interface SystemMessages {
  verbs: string;
  emptyInventory: string;
  restart: string;
  quit: string;
}

export function createSystemHandler(messages: SystemMessages): CommandHandler {
  const handleHelp: CommandHandler = (_, cmd) => {
    if (cmd.verb !== "help") return null;
    return [
      { type: "PRINT", text: `VERBS: ${messages.verbs}` },
      {
        type: "PRINT",
        text: "DIRECTIONS: north / south / east / west  (or n/s/e/w)",
      },
    ];
  };

  const handleInventory: CommandHandler = (state, cmd) => {
    if (cmd.verb !== "inv") return null;
    const text = state.inventory.length
      ? "You are carrying: " +
        state.inventory.map((i) => i.name).join(", ") +
        "."
      : messages.emptyInventory;
    return [{ type: "PRINT", text }];
  };

  const handleRestart: CommandHandler = (_, cmd) => {
    if (cmd.verb !== "restart") return null;
    return [
      { type: "PRINT", text: messages.restart, cls: "sys" },
      { type: "DELAY", ms: 700 },
      { type: "RELOAD" },
    ];
  };

  const handleQuit: CommandHandler = (_, cmd) => {
    if (cmd.verb !== "quit") return null;
    return [
      { type: "END_GAME", ending: "quit" },
      { type: "PRINT", text: messages.quit, cls: "sys" },
    ];
  };

  return chain(handleHelp, handleInventory, handleRestart, handleQuit);
}

export interface IntroCredits {
  title: string;
  year: number;
  serial: string;
}

export function createIntro(
  credits: IntroCredits,
  paragraphs: string[],
): GameEffect[] {
  return [
    { type: "PRINT", text: `*** ${credits.title} ***`, cls: "sys" },
    {
      type: "PRINT",
      text: `an interactive fiction by NOBODY IN PARTICULAR, ${credits.year}`,
      cls: "sys",
    },
    {
      type: "PRINT",
      text: `release 1 / serial ${credits.serial} / 48k`,
      cls: "sys",
    },
    { type: "DELAY", ms: 300 },
    { type: "PRINT", text: "" },
    ...paragraphs.map((text): GameEffect => ({ type: "PRINT", text })),
    { type: "PRINT", text: "" },
    { type: "PRINT", text: "Type HELP for a list of verbs.", cls: "sys" },
  ];
}

export function createMapRenderer(
  maps: Record<string, string>,
  endings: readonly string[],
): (state: Readonly<GameState>) => string {
  return (state) => {
    const key =
      state.ended && endings.includes(state.ended)
        ? `ending_${state.ended}`
        : state.location;
    return renderMapTokens(maps[key] ?? "");
  };
}

const FILLERS = new Set([
  "the",
  "a",
  "an",
  "to",
  "at",
  "into",
  "on",
  "onto",
  "in",
  "with",
  "please",
  "go",
  "my",
  "of",
  "for",
]);

export function createParser(
  dirAliases: Record<string, string>,
  verbAliases: Record<string, string>,
): (raw: string) => ParsedCommand {
  return (raw: string): ParsedCommand => {
    const tokens = raw
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 ?]/g, " ")
      .split(/\s+/)
      .filter(Boolean);

    if (!tokens.length) return { verb: null, noun: null, raw };

    if (tokens.length === 1 && dirAliases[tokens[0]]) {
      return { verb: "move", noun: dirAliases[tokens[0]], raw };
    }

    const cleaned = tokens.filter((t) => !FILLERS.has(t));
    if (!cleaned.length) return { verb: null, noun: null, raw };

    const verbToken = cleaned[0];
    let nounToken = cleaned.slice(1).join(" ");

    if (dirAliases[verbToken] && !nounToken) {
      return { verb: "move", noun: dirAliases[verbToken], raw };
    }

    const verb = verbAliases[verbToken] ?? verbToken;

    if (nounToken) {
      const firstWord = nounToken.split(" ")[0];
      if (dirAliases[firstWord]) {
        nounToken = dirAliases[firstWord];
      }
    }

    return { verb, noun: nounToken || null, raw };
  };
}

export function renderMapTokens(raw: string): string {
  return raw
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("{P}", '<span class="player">@</span>')
    .replaceAll("{K}", '<span class="note">K</span>')
    .replaceAll("{N}", '<span class="note">N</span>')
    .replace(/\{N:([^}]+)\}/g, '<span class="note">$1</span>')
    .replace(/\{LBL:([^}]+)\}/g, '<span class="label">$1</span>')
    .replace(/\{D:([^}]+)\}/g, '<span class="dim">$1</span>')
    .replace(/\{F:([^}]+)\}/g, '<span class="faint">$1</span>');
}
