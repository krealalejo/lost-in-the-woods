import type { GameEffect, GameState } from "../../engine/types";
import type { Story } from "../types";
import { handle } from "./handlers";
import { MAPS, renderMapTokens } from "./maps";
import { parse } from "./parser";

const INITIAL_STATE: GameState = {
  location: "module_c",
  inventory: [],
  flags: {},
  turns: 0,
  ended: null,
};

function getIntro(): GameEffect[] {
  return [
    { type: "PRINT", text: "*** ABYSSAL PRESSURE ***", cls: "sys" },
    {
      type: "PRINT",
      text: "an interactive fiction by NOBODY IN PARTICULAR, 1987",
      cls: "sys",
    },
    { type: "PRINT", text: "release 1 / serial 19870302 / 48k", cls: "sys" },
    { type: "DELAY", ms: 300 },
    { type: "PRINT", text: "" },
    {
      type: "PRINT",
      text: "You are Technician Second Class Maren Voss, aboard the deep-sea research platform MARIANA BASTION. Depth: 3,400 meters.",
    },
    {
      type: "PRINT",
      text: "Twenty minutes ago, an impact event knocked out primary power across three modules. Your radio is dead. Your crewmates are unaccounted for.",
    },
    {
      type: "PRINT",
      text: "For the last ten minutes, thermal imaging has been tracking a mass approximately eight meters long circling the station's external hull.",
    },
    { type: "PRINT", text: "" },
    {
      type: "PRINT",
      text: "The escape pod in the airlock bay is your only way out. You just need to reach it.",
    },
    { type: "PRINT", text: "" },
    { type: "PRINT", text: "Type HELP for a list of verbs.", cls: "sys" },
  ];
}

function getMap(state: Readonly<GameState>): string {
  let key = state.location;
  if (state.ended === "escape") key = "ending_escape";
  else if (state.ended === "crush") key = "ending_crush";
  const raw = MAPS[key] ?? "";
  return renderMapTokens(raw);
}

export const abyssalPressureStory: Story = {
  id: "abyssal-pressure",
  title: "ABYSSAL PRESSURE",
  version: "v0.1a",
  subtitle: "a deep-sea survival fiction",
  theme: {
    "--bg": "#001220",
    "--bg-deep": "#000b17",
    "--phos": "#4dc8ff",
    "--phos-dim": "#1a6a8a",
    "--phos-faint": "#0a3a50",
    "--phos-glow": "rgba(77, 200, 255, 0.55)",
    "--amber": "#ff7a2b",
    "--phos-rgb": "77, 200, 255",
    "--amber-rgb": "255, 122, 43",
    "--bg-rgb": "0, 18, 32",
    "--bg-deep-rgb": "0, 11, 23",
    "--crt-mid": "#001829",
  },

  initialState: () => ({ ...INITIAL_STATE, flags: {}, inventory: [] }),
  getIntro,
  getMap,
  parse,
  handle,
  paths: [
    [
      "take beacon",
      "north",
      "east",
      "open locker",
      "reroute power",
      "west",
      "north",
      "launch pod",
    ],
  ],
};
