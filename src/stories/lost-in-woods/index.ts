import type { GameEffect, GameState } from "../../engine/types";
import type { Story } from "../types";
import { handle, FOREST_SEQUENCE } from "./handlers";
import { MAPS, renderMapTokens } from "./maps";
import { parse } from "./parser";

const INITIAL_STATE: GameState = {
  location: "house",
  inventory: [],
  flags: {},
  turns: 0,
  ended: null,
};

function getIntro(): GameEffect[] {
  return [
    { type: "PRINT", text: "*** LOST IN THE WOODS ***", cls: "sys" },
    {
      type: "PRINT",
      text: "an interactive fiction by NOBODY IN PARTICULAR, 1983",
      cls: "sys",
    },
    { type: "PRINT", text: "release 1 / serial 19831024 / 48k", cls: "sys" },
    { type: "DELAY", ms: 300 },
    { type: "PRINT", text: "" },
    { type: "PRINT", text: "It is six o'clock. Mom's flight lands at seven." },
    {
      type: "PRINT",
      text: "She has asked you, repeatedly, to pick her up. Do not be late.",
    },
    { type: "PRINT", text: "" },
    {
      type: "PRINT",
      text: "You are in the living room of your house. It is a Tuesday.",
    },
    {
      type: "PRINT",
      text: 'A note on the fridge reads: "PICK UP MOM AT THE AIRPORT — 7 PM."',
    },
    {
      type: "PRINT",
      text: "The car keys glint on the rug. The front door is here.",
    },
    { type: "PRINT", text: "" },
    { type: "PRINT", text: "Type HELP for a list of verbs.", cls: "sys" },
  ];
}

function getMap(state: Readonly<GameState>): string {
  let key = state.location;
  if (state.ended === "vampires") key = "ending_vampires";
  const raw = MAPS[key] ?? "";
  return renderMapTokens(raw);
}

export const lostInWoodsStory: Story = {
  id: "lost-in-woods",
  title: "LOST IN THE WOODS",
  subtitle: "a parser adventure",

  initialState: () => ({ ...INITIAL_STATE, flags: {}, inventory: [] }),
  getIntro,
  getMap,
  parse,
  handle,

  paths: {
    happy: {
      label: "Happy path — you make it",
      commands: ["take keys", "open door", "north", ...FOREST_SEQUENCE],
    },
    block: {
      label: "Block path — lost forever",
      commands: [
        "take keys",
        "open door",
        "north",
        "north",
        "south",
        "east",
        "west",
        "north",
        "east",
        "south",
        "west",
        "south",
        "north",
        "east",
        "north",
        "west",
        "south",
      ],
    },
    terror: {
      label: "Terror path — vampires win",
      commands: [
        "take keys",
        "open door",
        "north",
        ...Array(16).fill("wait"),
        ...FOREST_SEQUENCE,
      ],
    },
  },
};
