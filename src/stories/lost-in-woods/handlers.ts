import type { GameEffect, GameState } from "../../engine/types";
import type { CommandHandler, ParsedCommand } from "../types";
import { DIR_ALIASES } from "./parser";

export const FOREST_SEQUENCE = [
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
] as const;

const FOREST_DESCRIPTIONS = [
  "You keep walking, but you could swear you already passed this same twisted pine tree.",
  "The flashlight beam catches something hanging from a branch: a humanoid figure made of sticks and filthy rope.",
  "You find three stones stacked on the ground. You did not place them there. Something is guiding you in circles.",
  "Far away, you hear a child crying. It sounds wrong, as if something is imitating the noise.",
  "You check the compass, but the needle spins wildly without stopping. You are completely disoriented.",
] as const;

export function chain(...handlers: CommandHandler[]): CommandHandler {
  return (state, cmd) => {
    for (const h of handlers) {
      const result = h(state, cmd);
      if (result !== null) return result;
    }
    return null;
  };
}

function forestStep(state: Readonly<GameState>): number {
  return (state.flags.forestStep as number) ?? 0;
}

function pickForestDesc(state: Readonly<GameState>): string {
  const i = (state.turns + forestStep(state)) % FOREST_DESCRIPTIONS.length;
  return FOREST_DESCRIPTIONS[i];
}

const handleHelp: CommandHandler = (_, cmd) => {
  if (cmd.verb !== "help") return null;
  return [
    {
      type: "PRINT",
      text: "VERBS: look, take, drop, use, open, go, wait, yell, inventory, help, restart",
    },
    {
      type: "PRINT",
      text: "DIRECTIONS: north / south / east / west  (or n/s/e/w)",
    },
  ];
};

const handleInventory: CommandHandler = (state, cmd) => {
  if (cmd.verb !== "inv") return null;
  const text = state.inventory.length
    ? "You are carrying: " + state.inventory.join(", ") + "."
    : "Your pockets are empty.";
  return [{ type: "PRINT", text }];
};

const handleRestart: CommandHandler = (_, cmd) => {
  if (cmd.verb !== "restart") return null;
  return [
    { type: "PRINT", text: "Rebooting the cartridge...", cls: "sys" },
    { type: "DELAY", ms: 700 },
    { type: "RELOAD" },
  ];
};

const handleQuit: CommandHandler = (_, cmd) => {
  if (cmd.verb !== "quit") return null;
  return [
    { type: "END_GAME", ending: "quit" },
    {
      type: "PRINT",
      text: "You power off the console. The screen fades.",
      cls: "sys",
    },
  ];
};

const handleWait: CommandHandler = (_, cmd) => {
  if (cmd.verb !== "wait") return null;
  return [{ type: "PRINT", text: "Time passes. Nothing else does." }];
};

const handleYell: CommandHandler = (state, cmd) => {
  if (cmd.verb !== "yell") return null;
  const byLocation: Record<string, string> = {
    forest: "Your voice is swallowed by the trees. No reply.",
    road: "Something far away answers. You shouldn't have done that.",
  };
  const text =
    byLocation[state.location] ??
    "You yell into the dark. Outside, the circling stops. Then starts again.";
  return [{ type: "PRINT", text }];
};

const universalHandler = chain(
  handleHelp,
  handleInventory,
  handleRestart,
  handleQuit,
  handleWait,
  handleYell,
);

// ─── TENT ────────────────────────────────────────────────────────────────────

const handleTentLook: CommandHandler = (state, cmd) => {
  if (state.location !== "tent" || cmd.verb !== "look") return null;
  if (cmd.noun === "flashlight") {
    return [
      {
        type: "PRINT",
        text: "A small LED flashlight. Its beam is weak, but it is something.",
      },
    ];
  }
  if (cmd.noun === "tent") {
    return [
      {
        type: "PRINT",
        text: "A single-person tent. The fabric walls bow inward from the cold.",
      },
    ];
  }
  if (cmd.noun) return null;
  return [
    {
      type: "PRINT",
      text: "You are inside your tent. The cold is unnatural — your breath forms clouds of vapor.",
    },
    {
      type: "PRINT",
      text: "The flashlight lies on the ground beside your sleeping bag.",
    },
    {
      type: "PRINT",
      text: "Outside, something heavy just stepped on a dry branch. It is circling.",
    },
  ];
};

const handleTentTake: CommandHandler = (state, cmd) => {
  if (state.location !== "tent" || cmd.verb !== "take") return null;
  if (cmd.noun === "flashlight") {
    if (state.inventory.includes("flashlight")) {
      return [{ type: "PRINT", text: "You already have the flashlight." }];
    }
    return [
      { type: "ADD_TO_INVENTORY", item: "flashlight" },
      { type: "PRINT", text: "Taken.", cls: "sys" },
    ];
  }
  return [
    { type: "PRINT", text: "There is nothing here worth taking.", cls: "bad" },
  ];
};

// Any movement verb exits the tent — direction is irrelevant inside.
// Note: "exit" is aliased to "leave" by the parser, so it never arrives here
// as cmd.verb === "exit". Only "move", "leave", and "out" are live values.
const handleTentMove: CommandHandler = (state, cmd) => {
  if (state.location !== "tent") return null;
  if (cmd.verb !== "move" && cmd.verb !== "leave" && cmd.verb !== "out")
    return null;
  return [
    {
      type: "PRINT",
      text: "You unzip the tent and step into the cold. You feel something watching you from the trees.",
    },
    ...enterForestFromTentEffects(),
  ];
};

const handleTentFallback: CommandHandler = (state, _cmd) => {
  if (state.location !== "tent") return null;
  const effects: GameEffect[] = [
    { type: "PRINT", text: "You can't do that here.", cls: "bad" },
  ];
  if (state.turns >= 9) {
    effects.push({
      type: "PRINT",
      text: "There is no more time. Your hands are shaking. You need to leave NOW.",
      cls: "bad",
    });
  } else if (state.turns >= 6) {
    effects.push({
      type: "PRINT",
      text: "The shadow presses against the tent wall. You can hear it breathing.",
      cls: "bad",
    });
  } else if (state.turns >= 3) {
    effects.push({
      type: "PRINT",
      text: "A tall shadow stretches across the fabric of the tent.",
    });
  }
  return effects;
};

function enterForestFromTentEffects(): GameEffect[] {
  return [
    { type: "SET_LOCATION", location: "forest" },
    { type: "SET_FLAG", key: "forestStep", value: 0 },
    { type: "PRINT", text: "" },
    { type: "PRINT", text: "[ DEEP FOREST ]", cls: "sys" },
    {
      type: "PRINT",
      text: "The darkness outside the tent is absolute. Your flashlight cuts only a few meters ahead.",
    },
    {
      type: "PRINT",
      text: "The trees are tall and look exactly the same in every direction.",
    },
    {
      type: "PRINT",
      text: "You cannot see the sky through the canopy. You need to find the old forest road.",
    },
  ];
}

// ─── FOREST ──────────────────────────────────────────────────────────────────

const handleForestLook: CommandHandler = (state, cmd) => {
  if (state.location !== "forest" || cmd.verb !== "look") return null;
  if (cmd.noun === "tree" || cmd.noun === "trees") {
    return [{ type: "PRINT", text: "They are trees. They all look the same." }];
  }
  if (cmd.noun === "ground" || cmd.noun === "floor") {
    return [
      {
        type: "PRINT",
        text: "Pine needles. Some moss. Your own footprints, possibly.",
      },
    ];
  }
  if (cmd.noun) return null;
  if (state.inventory.includes("flashlight")) {
    return [
      {
        type: "PRINT",
        text: "You sweep the flashlight beam across the undergrowth. The light catches every shadow, every shifting branch.",
      },
      {
        type: "PRINT",
        text: "The trees press in from all sides. You cannot tell which way you came from.",
      },
    ];
  }
  return [{ type: "PRINT", text: "It's too dark to see anything useful." }];
};

const handleForestTake: CommandHandler = (state, cmd) => {
  if (state.location !== "forest" || cmd.verb !== "take") return null;
  return [{ type: "PRINT", text: "There is nothing here worth taking." }];
};

const handleForestMove: CommandHandler = (state, cmd) => {
  if (state.location !== "forest" || cmd.verb !== "move") return null;
  if (!cmd.noun) {
    return [
      {
        type: "PRINT",
        text: "Move which way? Try north, south, east, or west.",
        cls: "bad",
      },
    ];
  }
  const dir = DIR_ALIASES[cmd.noun] ?? cmd.noun;
  const step = forestStep(state);
  const expected = FOREST_SEQUENCE[step];

  if (dir === expected) {
    const nextStep = step + 1;
    if (nextStep >= FOREST_SEQUENCE.length) {
      return [
        { type: "SET_FLAG", key: "forestStep", value: nextStep },
        { type: "PRINT", text: "" },
        {
          type: "PRINT",
          text: "YOU ESCAPED THE FOREST.",
          cls: "sys",
        },
        { type: "DELAY", ms: 600 },
        ...enterRoadEffects(state.turns + 1),
      ];
    }
    return [
      { type: "SET_FLAG", key: "forestStep", value: nextStep },
      { type: "PRINT", text: pickForestDesc(state) },
    ];
  }

  return [
    { type: "SET_FLAG", key: "forestStep", value: 0 },
    { type: "PRINT", text: pickForestDesc(state) },
  ];
};

const handleForestFallback: CommandHandler = (state, cmd) => {
  if (state.location !== "forest") return null;
  if (cmd.verb === "open" || cmd.verb === "use") {
    return [
      { type: "PRINT", text: "There is nothing here to use.", cls: "bad" },
    ];
  }
  return [
    {
      type: "PRINT",
      text: "The forest does not care about that verb.",
      cls: "bad",
    },
  ];
};

function enterRoadEffects(turnsAfterEntry: number): GameEffect[] {
  const base: GameEffect[] = [
    { type: "SET_LOCATION", location: "road" },
    { type: "PRINT", text: "[ FOREST ROAD ]", cls: "sys" },
    {
      type: "PRINT",
      text: "Your boots hit cracked asphalt. The smell of wet soil gives way to engine oil.",
    },
    {
      type: "PRINT",
      text: "Your car is a few meters ahead. The tree line looms behind you.",
    },
    { type: "DELAY", ms: 400 },
  ];

  if (turnsAfterEntry > 25) {
    return [
      { type: "SET_LOCATION", location: "road" },
      { type: "PRINT", text: "[ FOREST ROAD ]", cls: "sys" },
      { type: "DELAY", ms: 400 },
      { type: "PRINT", text: "" },
      {
        type: "PRINT",
        text: "At last, your boots hit the asphalt of the old road. You reach your car, but the driver's door has been ripped clean off.",
        cls: "bad",
      },
      {
        type: "PRINT",
        text: "On the seat sits a pile of stones stacked with unnatural precision.",
        cls: "bad",
      },
      { type: "DELAY", ms: 600 },
      {
        type: "PRINT",
        text: 'Suddenly, you hear your own voice, recorded and distorted, echoing from the darkness behind you: "Hello? Is anyone there?"',
        cls: "bad",
      },
      { type: "DELAY", ms: 900 },
      {
        type: "PRINT",
        text: "The flashlight flickers and dies. You hear rapid footsteps sprinting toward you.",
        cls: "bad",
      },
      { type: "DELAY", ms: 600 },
      { type: "PRINT", text: "GAME OVER.", cls: "bad" },
      { type: "PRINT", text: "" },
      {
        type: "PRINT",
        text: "(type RESTART to try again.)",
        cls: "sys",
      },
      { type: "END_GAME", ending: "presence" },
    ];
  }

  return [
    ...base,
    {
      type: "PRINT",
      text: "The forest spits your body onto cracked asphalt. A few meters away sits your car. You jump inside, lock the doors, and turn the key.",
    },
    { type: "DELAY", ms: 700 },
    {
      type: "PRINT",
      text: "When the headlights flare on, they illuminate the tree line. For a split second, you see dozens of tall figures made of branches standing at the edge of the woods, watching.",
    },
    {
      type: "PRINT",
      text: "You slam the accelerator and never look in the rearview mirror. You survived.",
    },
    { type: "END_GAME", ending: "win" },
    { type: "PRINT", text: "" },
    {
      type: "PRINT",
      text: "(type RESTART to play again.)",
      cls: "sys",
    },
  ];
}

// ─── ROAD ─────────────────────────────────────────────────────────────────────

const handleRoadLook: CommandHandler = (state, cmd) => {
  if (state.location !== "road" || cmd.verb !== "look") return null;
  return [
    {
      type: "PRINT",
      text: "Cracked asphalt stretches in both directions. Your car sits ahead, engine cold.",
    },
    {
      type: "PRINT",
      text: "The tree line is dark. Something moves at the edge of the light.",
    },
  ];
};

const handleRoadFallback: CommandHandler = (state, _cmd) => {
  if (state.location !== "road") return null;
  return [
    { type: "PRINT", text: "It is too late to do that now.", cls: "bad" },
  ];
};

const handleUnknown: CommandHandler = () => {
  return [{ type: "PRINT", text: "You can't do that here.", cls: "bad" }];
};

const tentHandler = chain(
  handleTentLook,
  handleTentTake,
  handleTentMove,
  handleTentFallback,
);

const forestHandler = chain(
  handleForestLook,
  handleForestTake,
  handleForestMove,
  handleForestFallback,
);

const roadHandler = chain(handleRoadLook, handleRoadFallback);

const locationHandlers: Record<string, CommandHandler> = {
  tent: tentHandler,
  forest: forestHandler,
  road: roadHandler,
};

export function handle(
  state: Readonly<GameState>,
  cmd: ParsedCommand,
): GameEffect[] {
  const universal = universalHandler(state, cmd);
  if (universal) return [{ type: "INCREMENT_TURNS" }, ...universal];

  const locHandler = locationHandlers[state.location];
  const locResult = locHandler?.(state, cmd) ?? handleUnknown(state, cmd);
  return [{ type: "INCREMENT_TURNS" }, ...(locResult ?? [])];
}
