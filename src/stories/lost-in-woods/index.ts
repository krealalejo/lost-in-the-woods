import type { GameEffect, GameState } from "../../engine/types";
import type { Story } from "../types";
import { handle } from "./handlers";
import { MAPS, renderMapTokens } from "./maps";
import { parse } from "./parser";

const INITIAL_STATE: GameState = {
  location: "tent",
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
    {
      type: "PRINT",
      text: "You wake up in the middle of the night inside your tent.",
    },
    {
      type: "PRINT",
      text: "The cold feels unnatural. Your breath forms clouds of vapor.",
    },
    {
      type: "PRINT",
      text: "Outside, in the absolute darkness of the Akasawa forest, something heavy has just stepped on a dry branch.",
    },
    {
      type: "PRINT",
      text: "It is circling your tent. You have no signal.",
    },
    { type: "PRINT", text: "" },
    {
      type: "PRINT",
      text: "The flashlight lies on the ground beside your sleeping bag. You should take it.",
    },
    {
      type: "PRINT",
      text: "You need to reach the old forest road where you left your car. And you need to do it now.",
    },
    { type: "PRINT", text: "" },
    { type: "PRINT", text: "Type HELP for a list of verbs.", cls: "sys" },
  ];
}

function getMap(state: Readonly<GameState>): string {
  let key = state.location;
  if (state.ended === "win") key = "ending_win";
  else if (state.ended === "presence") key = "ending_presence";
  const raw = MAPS[key] ?? "";
  return renderMapTokens(raw);
}

function getMapItems(state: Readonly<GameState>): string[] {
  if (
    state.location === "tent" &&
    !state.inventory.some((i) => i.name === "flashlight")
  ) {
    return ["flashlight"];
  }
  return [];
}

export const lostInWoodsStory: Story = {
  id: "lost-in-woods",
  title: "LOST IN THE WOODS",
  subtitle: "a parser adventure",

  initialState: () => ({ ...INITIAL_STATE, flags: {}, inventory: [] }),
  getIntro,
  getMap,
  getMapItems,
  parse,
  handle,
  paths: [
    [
      "take flashlight",
      "leave",
      "north",
      "north",
      "east",
      "north",
      "east",
      "south",
      "west",
      "north",
      "north",
      "east",
    ],
  ],
};
