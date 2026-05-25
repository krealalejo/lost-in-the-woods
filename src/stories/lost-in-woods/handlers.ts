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
  "You are in a forest. The trees are tall and look exactly the same.",
  "You are in a forest. A branch creaks somewhere behind you.",
  "You are in a forest. The light filtering through the canopy has not changed.",
  "You are in a forest. You feel like you have been here before.",
  "You are in a forest. Nothing in particular distinguishes this spot.",
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

function hasOpened(state: Readonly<GameState>): boolean {
  return (state.flags.hasOpened as boolean) ?? false;
}

function pickForestDesc(state: Readonly<GameState>): string {
  const i = (state.turns + forestStep(state)) % FOREST_DESCRIPTIONS.length;
  return FOREST_DESCRIPTIONS[i];
}

function houseDescription(state: Readonly<GameState>): string[] {
  return [
    "You are in the living room of your house. It is a Tuesday.",
    'A note on the fridge reads: "PICK UP MOM AT THE AIRPORT — 7 PM."',
    state.inventory.includes("keys")
      ? "The front door is here."
      : "The car keys glint on the rug. The front door is here.",
  ];
}

// ---------------------------------------------------------------------------
// Universal handlers
// ---------------------------------------------------------------------------

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
    clearing: "Something far away answers. You shouldn't have done that.",
  };
  const text =
    byLocation[state.location] ?? "You yell. The neighbor's dog barks once.";
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

// ---------------------------------------------------------------------------
// House handlers
// ---------------------------------------------------------------------------

const handleHouseLook: CommandHandler = (state, cmd) => {
  if (state.location !== "house" || cmd.verb !== "look") return null;
  if (cmd.noun === "note" || cmd.noun === "fridge") {
    return [
      {
        type: "PRINT",
        text: 'It reads: "PICK UP MOM AT THE AIRPORT — 7 PM. Don\'t be late."',
      },
    ];
  }
  if (cmd.noun === "keys" || cmd.noun === "key") {
    return [
      {
        type: "PRINT",
        text: "Standard car keys. There's a little plastic moose on the keyring.",
      },
    ];
  }
  if (cmd.noun) return null;
  return houseDescription(state).map((text) => ({
    type: "PRINT" as const,
    text,
  }));
};

const handleHouseTake: CommandHandler = (state, cmd) => {
  if (state.location !== "house" || cmd.verb !== "take") return null;
  if (cmd.noun === "keys" || cmd.noun === "key") {
    if (state.inventory.includes("keys")) {
      return [{ type: "PRINT", text: "You already have the keys." }];
    }
    return [
      { type: "ADD_TO_INVENTORY", item: "keys" },
      { type: "PRINT", text: "Taken.", cls: "sys" },
    ];
  }
  return [
    { type: "PRINT", text: "There is nothing here worth taking.", cls: "bad" },
  ];
};

const handleHouseOpen: CommandHandler = (state, cmd) => {
  if (state.location !== "house") return null;
  const isOpenDoor =
    cmd.verb === "open" &&
    (cmd.noun === "door" || cmd.noun === "front door" || cmd.noun === null);
  const isUseKeys = cmd.verb === "use" && cmd.noun?.includes("key");
  if (!isOpenDoor && !isUseKeys) return null;
  if (!state.inventory.includes("keys")) {
    return [
      {
        type: "PRINT",
        text: "The door is locked. You'll need the keys.",
        cls: "bad",
      },
    ];
  }
  if (hasOpened(state)) {
    return [{ type: "PRINT", text: "The door is already open.", cls: "sys" }];
  }
  return [
    { type: "SET_FLAG", key: "hasOpened", value: true },
    {
      type: "PRINT",
      text: "You open the front door. The road yawns ahead.",
      cls: "sys",
    },
  ];
};

const handleHouseMove: CommandHandler = (state, cmd) => {
  if (state.location !== "house" || cmd.verb !== "move") return null;
  if (!state.inventory.includes("keys")) {
    return [
      {
        type: "PRINT",
        text: "The door is locked. You'll need the keys.",
        cls: "bad",
      },
    ];
  }
  return [
    { type: "SET_FLAG", key: "hasOpened", value: true },
    {
      type: "PRINT",
      text: "You drive into the night. The road narrows. The road ends.",
    },
    { type: "PRINT", text: "You step out among the trees.", cls: "sys" },
    ...enterForestEffects(),
  ];
};

const handleHouseFallback: CommandHandler = (state, cmd) => {
  if (state.location !== "house") return null;
  if (cmd.verb === "drop")
    return [{ type: "PRINT", text: "You drop it on the rug." }];
  return [{ type: "PRINT", text: "You can't do that here.", cls: "bad" }];
};

// ---------------------------------------------------------------------------
// Forest handlers
// ---------------------------------------------------------------------------

function enterForestEffects(): GameEffect[] {
  return [
    { type: "SET_LOCATION", location: "forest" },
    { type: "SET_FLAG", key: "forestStep", value: 0 },
    { type: "PRINT", text: "" },
    { type: "PRINT", text: "[ FOREST ]", cls: "sys" },
    {
      type: "PRINT",
      text: "You are in a forest. The trees are tall and look exactly the same.",
    },
    {
      type: "PRINT",
      text: "You cannot see the sky through the canopy.",
    },
  ];
}

const handleForestLook: CommandHandler = (state, cmd) => {
  if (state.location !== "forest" || cmd.verb !== "look") return null;
  if (cmd.noun === "tree" || cmd.noun === "trees") {
    return [{ type: "PRINT", text: "They are trees. You're not a botanist." }];
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
  return [{ type: "PRINT", text: pickForestDesc(state) }];
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
        { type: "PRINT", text: "YOU ARE OUT OF THE FOREST.", cls: "sys" },
        { type: "DELAY", ms: 600 },
        ...enterClearingEffects(state.turns + 1),
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

// ---------------------------------------------------------------------------
// Clearing handlers
// ---------------------------------------------------------------------------

function enterClearingEffects(turnsAfterEntry: number): GameEffect[] {
  const base: GameEffect[] = [
    { type: "SET_LOCATION", location: "clearing" },
    { type: "PRINT", text: "[ CLEARING ]", cls: "sys" },
    {
      type: "PRINT",
      text: "You step into a wide moonlit clearing at the edge of the forest.",
    },
    { type: "PRINT", text: "The grass is wet. The night is very, very quiet." },
    { type: "DELAY", ms: 400 },
  ];

  if (turnsAfterEntry > 25) {
    return [
      ...base,
      { type: "END_GAME", ending: "vampires" },
      { type: "PRINT", text: "" },
      {
        type: "PRINT",
        text: "Something is wrong with the runway lights. They aren't blinking.",
        cls: "bad",
      },
      { type: "DELAY", ms: 600 },
      { type: "PRINT", text: "They are eyes.", cls: "bad" },
      { type: "DELAY", ms: 900 },
      { type: "PRINT", text: "" },
      {
        type: "PRINT",
        text: "While you were lost, the world fell. Mom was the first to go.",
        cls: "bad",
      },
      { type: "DELAY", ms: 600 },
      { type: "PRINT", text: "THE VAMPIRES WON. GAME OVER.", cls: "bad" },
      { type: "PRINT", text: "" },
      {
        type: "PRINT",
        text: "(type RESTART to try again. it won't help.)",
        cls: "sys",
      },
    ];
  }

  return [
    ...base,
    {
      type: "PRINT",
      text: "In the distance you can see the airport lights. You sprint.",
    },
    { type: "DELAY", ms: 700 },
    { type: "END_GAME", ending: "win" },
    {
      type: "PRINT",
      text: "You make the 7 PM pickup with three minutes to spare.",
      cls: "sys",
    },
    { type: "PRINT", text: "Mom asks how the drive was. You say it was fine." },
    { type: "PRINT", text: "" },
    {
      type: "PRINT",
      text: "(this ending is statistically almost impossible. how did you do it?)",
      cls: "sys",
    },
    { type: "PRINT", text: "(type RESTART to play again.)", cls: "sys" },
  ];
}

const handleClearingLook: CommandHandler = (state, cmd) => {
  if (state.location !== "clearing" || cmd.verb !== "look") return null;
  return [
    {
      type: "PRINT",
      text: "Moonlit grass. Far away: blinking red runway lights.",
    },
  ];
};

const handleClearingFallback: CommandHandler = (state, cmd) => {
  if (state.location !== "clearing") return null;
  if (cmd.verb === "move") {
    return [
      { type: "PRINT", text: "It is too late to do that now.", cls: "bad" },
    ];
  }
  return [
    { type: "PRINT", text: "It is too late to do that now.", cls: "bad" },
  ];
};

// ---------------------------------------------------------------------------
// Unknown command fallback
// ---------------------------------------------------------------------------

const handleUnknown: CommandHandler = () => {
  return [{ type: "PRINT", text: "You can't do that here.", cls: "bad" }];
};

// ---------------------------------------------------------------------------
// Composed location handlers
// ---------------------------------------------------------------------------

const houseHandler = chain(
  handleHouseLook,
  handleHouseTake,
  handleHouseOpen,
  handleHouseMove,
  handleHouseFallback,
);

const forestHandler = chain(
  handleForestLook,
  handleForestTake,
  handleForestMove,
  handleForestFallback,
);

const clearingHandler = chain(handleClearingLook, handleClearingFallback);

const locationHandlers: Record<string, CommandHandler> = {
  house: houseHandler,
  forest: forestHandler,
  clearing: clearingHandler,
};

// ---------------------------------------------------------------------------
// Main dispatch
// ---------------------------------------------------------------------------

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
