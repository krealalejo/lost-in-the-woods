import type { ParsedCommand } from "../types";

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

export const DIR_ALIASES: Record<string, string> = {
  n: "north",
  north: "north",
  up: "north",
  s: "south",
  south: "south",
  down: "south",
  e: "east",
  east: "east",
  right: "east",
  w: "west",
  west: "west",
  left: "west",
};

const VERB_ALIASES: Record<string, string> = {
  look: "look",
  l: "look",
  examine: "look",
  x: "look",
  inspect: "look",
  take: "take",
  get: "take",
  grab: "take",
  pick: "take",
  drop: "drop",
  use: "use",
  open: "open",
  go: "move",
  walk: "move",
  run: "move",
  move: "move",
  head: "move",
  inventory: "inv",
  inv: "inv",
  i: "inv",
  help: "help",
  "?": "help",
  wait: "wait",
  z: "wait",
  yell: "yell",
  scream: "yell",
  shout: "yell",
  quit: "quit",
  restart: "restart",
  reset: "restart",
  leave: "leave",
  exit: "leave",
};

export function parse(raw: string): ParsedCommand {
  const tokens = raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ?]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (!tokens.length) return { verb: null, noun: null, raw };

  if (tokens.length === 1 && DIR_ALIASES[tokens[0]]) {
    return { verb: "move", noun: DIR_ALIASES[tokens[0]], raw };
  }

  const cleaned = tokens.filter((t) => !FILLERS.has(t));
  if (!cleaned.length) {
    return { verb: null, noun: null, raw };
  }

  const verbToken = cleaned[0];
  let nounToken = cleaned.slice(1).join(" ");

  if (DIR_ALIASES[verbToken] && !nounToken) {
    return { verb: "move", noun: DIR_ALIASES[verbToken], raw };
  }

  const verb = VERB_ALIASES[verbToken] ?? verbToken;

  if (nounToken) {
    const firstWord = nounToken.split(" ")[0];
    if (DIR_ALIASES[firstWord]) {
      nounToken = DIR_ALIASES[firstWord];
    }
  }

  return { verb, noun: nounToken || null, raw };
}
