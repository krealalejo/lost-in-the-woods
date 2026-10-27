import type { GameEffect, GameState } from "../../engine/types";
import type { Story } from "../types";
import { createIntro, createMapRenderer } from "../utils";
import { handle } from "./handlers";
import { MAPS } from "./maps";
import { parse } from "./parser";

const INITIAL_STATE: GameState = {
  location: "tent",
  inventory: [],
  flags: {},
  turns: 0,
  ended: null,
};

function getIntro(): GameEffect[] {
  return createIntro(
    { title: "LOST IN THE WOODS", year: 1983, serial: "19831024" },
    [
      "You wake up in the middle of the night inside your tent.",
      "The cold feels unnatural. Your breath forms clouds of vapor.",
      "Outside, in the absolute darkness of the Akasawa forest, something heavy has just stepped on a dry branch.",
      "It is circling your tent. You have no signal.",
      "",
      "The flashlight lies on the ground beside your sleeping bag. You should take it.",
      "You need to reach the old forest road where you left your car. And you need to do it now.",
    ],
  );
}

const getMap = createMapRenderer(MAPS, ["win", "presence"]);

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
  version: "v0.3a",
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
