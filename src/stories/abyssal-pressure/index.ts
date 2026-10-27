import type { GameEffect, GameState } from "../../engine/types";
import type { Story } from "../types";
import { createIntro, createMapRenderer } from "../utils";
import { handle } from "./handlers";
import { MAPS } from "./maps";
import { parse } from "./parser";

const INITIAL_STATE: GameState = {
  location: "module_c",
  inventory: [],
  flags: {},
  turns: 0,
  ended: null,
};

function getIntro(): GameEffect[] {
  return createIntro(
    { title: "ABYSSAL PRESSURE", year: 1987, serial: "19870302" },
    [
      "You are Technician Second Class Maren Voss, aboard the deep-sea research platform MARIANA BASTION. Depth: 3,400 meters.",
      "Twenty minutes ago, an impact event knocked out primary power across three modules. Your radio is dead. Your crewmates are unaccounted for.",
      "For the last ten minutes, thermal imaging has been tracking a mass approximately eight meters long circling the station's external hull.",
      "",
      "The escape pod in the airlock bay is your only way out. You just need to reach it.",
    ],
  );
}

const getMap = createMapRenderer(MAPS, ["escape", "crush"]);

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
