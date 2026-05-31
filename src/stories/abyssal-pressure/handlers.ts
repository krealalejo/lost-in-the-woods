import type { GameEffect, Item } from "../../engine/types";
import type { CommandHandler } from "../types";
import { chain, createHandle } from "../utils";

export const ITEMS: Record<string, Item> = {
  emergency_beacon: {
    name: "emergency beacon",
    description:
      "A yellow emergency locator beacon. Waterproof to 4,000m. Once activated on the surface, it will transmit your position for 48 hours. The activation pin is still attached.",
  },
  pressure_suit: {
    name: "pressure suit",
    description:
      "A deep-sea pressure suit. Red stenciling reads: EMERGENCY USE ONLY. The integrated life support gives four hours of air. A crack runs along the left wrist seal — not ideal, but it will hold for a fast ascent.",
  },
} as const;

// ─── UNIVERSAL ────────────────────────────────────────────────────────────────

const handleHelp: CommandHandler = (_, cmd) => {
  if (cmd.verb !== "help") return null;
  return [
    {
      type: "PRINT",
      text: "VERBS: look, take, drop, use, open, activate, reroute, launch, go, wait, inventory, help, restart",
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
    ? "You are carrying: " + state.inventory.map((i) => i.name).join(", ") + "."
    : "You are carrying nothing.";
  return [{ type: "PRINT", text }];
};

const handleRestart: CommandHandler = (_, cmd) => {
  if (cmd.verb !== "restart") return null;
  return [
    { type: "PRINT", text: "Rebooting...", cls: "sys" },
    { type: "DELAY", ms: 700 },
    { type: "RELOAD" },
  ];
};

const handleQuit: CommandHandler = (_, cmd) => {
  if (cmd.verb !== "quit") return null;
  return [
    { type: "END_GAME", ending: "quit" },
    { type: "PRINT", text: "Terminal disconnected.", cls: "sys" },
  ];
};

const handleWait: CommandHandler = (_, cmd) => {
  if (cmd.verb !== "wait") return null;
  return [
    {
      type: "PRINT",
      text: "The station groans under 340 atmospheres. Waiting is a luxury you do not have.",
    },
  ];
};

const handleYell: CommandHandler = (state, cmd) => {
  if (cmd.verb !== "yell") return null;
  if (state.location === "airlock") {
    return [
      {
        type: "PRINT",
        text: "Your voice echoes in the pressurized chamber. No one answers.",
      },
    ];
  }
  return [
    {
      type: "PRINT",
      text: "The hull amplifies sound. Whatever is outside goes still.",
    },
    { type: "PRINT", text: "Then the hull flexes. Once. Twice." },
  ];
};

const universalHandler = chain(
  handleHelp,
  handleInventory,
  handleRestart,
  handleQuit,
  handleWait,
  handleYell,
);

// ─── MODULE C ────────────────────────────────────────────────────────────────

const handleModuleCLook: CommandHandler = (state, cmd) => {
  if (state.location !== "module_c" || cmd.verb !== "look") return null;

  if (cmd.noun === "window" || cmd.noun === "porthole") {
    return [
      {
        type: "PRINT",
        text: "You press your face to the thick acrylic port. Beyond it: absolute black.",
      },
      {
        type: "PRINT",
        text: "Then something large drifts past. No bioluminescence. No features you can name. Just mass.",
      },
    ];
  }

  if (cmd.noun === "beacon" || cmd.noun === "emergency beacon") {
    return [
      {
        type: "PRINT",
        text: "A yellow locator beacon. You should take it before you leave.",
      },
    ];
  }

  if (cmd.noun) return null;

  const hasTaken = state.inventory.some((i) => i.name === "emergency beacon");
  const effects: GameEffect[] = [
    {
      type: "PRINT",
      text: "Module C. Emergency lighting casts everything in dim red. The forward bulkhead is buckled — structural damage from the impact.",
    },
    {
      type: "PRINT",
      text: "A porthole on the starboard wall looks into open water. The depth gauge reads 3,400m.",
    },
  ];
  if (!hasTaken) {
    effects.push({
      type: "PRINT",
      text: "An emergency beacon sits on the floor beside an overturned equipment rack.",
    });
  }
  effects.push({
    type: "PRINT",
    text: "The main corridor is to the north.",
  });
  return effects;
};

const handleModuleCTake: CommandHandler = (state, cmd) => {
  if (state.location !== "module_c" || cmd.verb !== "take") return null;
  if (cmd.noun === "beacon" || cmd.noun === "emergency beacon") {
    if (state.inventory.some((i) => i.name === "emergency beacon")) {
      return [{ type: "PRINT", text: "You already have the beacon." }];
    }
    return [
      { type: "ADD_TO_INVENTORY", item: ITEMS.emergency_beacon },
      { type: "PRINT", text: "Taken.", cls: "sys" },
    ];
  }
  return [
    {
      type: "PRINT",
      text: "There is nothing else worth taking here.",
      cls: "bad",
    },
  ];
};

const handleModuleCMove: CommandHandler = (state, cmd) => {
  if (state.location !== "module_c" || cmd.verb !== "move") return null;
  if (cmd.noun === "north" || cmd.noun === "forward") {
    const hasTaken = state.inventory.some((i) => i.name === "emergency beacon");
    const effects: GameEffect[] = [];
    if (!hasTaken) {
      effects.push({
        type: "PRINT",
        text: "The beacon catches your eye as you move toward the door. You should grab it before you go.",
        cls: "bad",
      });
    }
    return [
      ...effects,
      { type: "SET_LOCATION", location: "corridor" },
      { type: "PRINT", text: "[ MAIN CORRIDOR ]", cls: "sys" },
      {
        type: "PRINT",
        text: "A long pressurized connector stretches ahead. Emergency strip lighting lines the floor.",
      },
      {
        type: "PRINT",
        text: "East leads to Reactor Bay. North, a bulkhead door with a red POWER FAULT indicator.",
      },
    ];
  }
  return [
    {
      type: "PRINT",
      text: "The only way out is north through the corridor.",
      cls: "bad",
    },
  ];
};

const handleModuleCLeave: CommandHandler = (state, cmd) => {
  if (state.location !== "module_c") return null;
  if (cmd.verb !== "leave") return null;
  return handleModuleCMove(state, { ...cmd, verb: "move", noun: "north" });
};

const handleModuleCFallback: CommandHandler = (state, _cmd) => {
  if (state.location !== "module_c") return null;
  return [{ type: "PRINT", text: "You can't do that here.", cls: "bad" }];
};

// ─── CORRIDOR ────────────────────────────────────────────────────────────────

const handleCorridorLook: CommandHandler = (state, cmd) => {
  if (state.location !== "corridor" || cmd.verb !== "look") return null;

  if (cmd.noun === "door" || cmd.noun === "bulkhead") {
    const powered = state.flags.power_rerouted as boolean | undefined;
    if (powered) {
      return [
        {
          type: "PRINT",
          text: "The bulkhead door to the airlock bay. The indicator now reads: POWER NOMINAL. Green.",
        },
      ];
    }
    return [
      {
        type: "PRINT",
        text: "A heavy pressure bulkhead. The indicator above it is red: POWER FAULT. The door is sealed until someone reroutes power from the reactor bay.",
      },
    ];
  }

  if (cmd.noun) return null;

  const powered = state.flags.power_rerouted as boolean | undefined;
  return [
    {
      type: "PRINT",
      text: "The main connector corridor. Strip lighting flickers every few seconds.",
    },
    {
      type: "PRINT",
      text: powered
        ? "North: bulkhead door, indicator GREEN. East: Reactor Bay. South: Module C."
        : "North: bulkhead door, indicator RED — sealed. East: Reactor Bay. South: Module C.",
    },
  ];
};

const handleCorridorMove: CommandHandler = (state, cmd) => {
  if (state.location !== "corridor" || cmd.verb !== "move") return null;

  if (cmd.noun === "south") {
    return [
      { type: "SET_LOCATION", location: "module_c" },
      { type: "PRINT", text: "[ MODULE C ]", cls: "sys" },
      { type: "PRINT", text: "Back in the damaged module. The hull groans." },
    ];
  }

  if (cmd.noun === "east") {
    return [
      { type: "SET_LOCATION", location: "reactor" },
      { type: "PRINT", text: "[ REACTOR BAY ]", cls: "sys" },
      {
        type: "PRINT",
        text: "The reactor bay hums with residual power. Banks of equipment line the walls.",
      },
      {
        type: "PRINT",
        text: "An emergency routing panel glows amber on the far wall. A red locker is mounted beside it.",
      },
    ];
  }

  if (cmd.noun === "north") {
    const powered = state.flags.power_rerouted as boolean | undefined;
    if (!powered) {
      return [
        {
          type: "PRINT",
          text: "The bulkhead is sealed. The red indicator reads: POWER FAULT.",
          cls: "bad",
        },
        {
          type: "PRINT",
          text: "You need to reroute power from the reactor bay to release the lock.",
        },
      ];
    }
    return [
      { type: "SET_LOCATION", location: "airlock" },
      { type: "PRINT", text: "[ AIRLOCK / POD BAY ]", cls: "sys" },
      {
        type: "PRINT",
        text: "The pressurized airlock chamber. Your escape pod is docked at the far end, status lights green.",
      },
      {
        type: "PRINT",
        text: "A small observation port shows the exterior hull — and beyond it, the dark.",
      },
    ];
  }

  return [{ type: "PRINT", text: "That direction is blocked.", cls: "bad" }];
};

const handleCorridorFallback: CommandHandler = (state, _cmd) => {
  if (state.location !== "corridor") return null;
  return [{ type: "PRINT", text: "You can't do that here.", cls: "bad" }];
};

// ─── REACTOR ─────────────────────────────────────────────────────────────────

const handleReactorLook: CommandHandler = (state, cmd) => {
  if (state.location !== "reactor" || cmd.verb !== "look") return null;

  if (
    cmd.noun === "panel" ||
    cmd.noun === "routing panel" ||
    cmd.noun === "emergency panel"
  ) {
    const powered = state.flags.power_rerouted as boolean | undefined;
    if (powered) {
      return [
        {
          type: "PRINT",
          text: "The emergency routing panel. The airlock circuit reads: POWER NOMINAL.",
        },
      ];
    }
    return [
      {
        type: "PRINT",
        text: "The emergency routing panel. A single amber switch is labeled: AIRLOCK POWER CIRCUIT.",
      },
      {
        type: "PRINT",
        text: "Current status: OFF. You could reroute power from here.",
      },
    ];
  }

  if (cmd.noun === "locker" || cmd.noun === "red locker") {
    const hasSuit = state.inventory.some((i) => i.name === "pressure suit");
    if (hasSuit) {
      return [
        {
          type: "PRINT",
          text: "The empty locker. You already took the pressure suit.",
        },
      ];
    }
    return [
      {
        type: "PRINT",
        text: "A red emergency locker. Stenciled on the front: PRESSURE SUIT.",
      },
      { type: "PRINT", text: "You should open it." },
    ];
  }

  if (cmd.noun) return null;

  const hasSuit = state.inventory.some((i) => i.name === "pressure suit");
  return [
    {
      type: "PRINT",
      text: "Reactor Bay. The air smells of ozone and hot metal. The reactor itself is in emergency shutdown — stable, but producing no primary power.",
    },
    {
      type: "PRINT",
      text: hasSuit
        ? "The emergency routing panel glows amber on the far wall."
        : "The emergency routing panel glows amber on the far wall. A red locker is mounted beside it.",
    },
    { type: "PRINT", text: "West leads back to the corridor." },
  ];
};

const handleReactorReroute: CommandHandler = (state, cmd) => {
  if (state.location !== "reactor") return null;
  if (cmd.verb !== "reroute" && cmd.verb !== "use" && cmd.verb !== "activate")
    return null;
  const target = cmd.noun ?? "";
  const isPanelTarget =
    !target ||
    target.includes("power") ||
    target.includes("panel") ||
    target.includes("circuit") ||
    target.includes("switch");
  if (!isPanelTarget) return null;

  if (state.flags.power_rerouted) {
    return [
      {
        type: "PRINT",
        text: "Power is already rerouted. The airlock circuit reads: NOMINAL.",
      },
    ];
  }

  return [
    { type: "SET_FLAG", key: "power_rerouted", value: true },
    {
      type: "PRINT",
      text: "You flip the switch. The panel changes from amber to green.",
      cls: "sys",
    },
    { type: "DELAY", ms: 400 },
    {
      type: "PRINT",
      text: "Somewhere down the corridor, a heavy thunk as the bulkhead releases its lock.",
    },
    { type: "PRINT", text: "The airlock is now accessible." },
  ];
};

const handleReactorTake: CommandHandler = (state, cmd) => {
  if (state.location !== "reactor" || cmd.verb !== "take") return null;
  if (cmd.noun === "suit" || cmd.noun === "pressure suit") {
    if (state.inventory.some((i) => i.name === "pressure suit")) {
      return [
        { type: "PRINT", text: "You are already wearing the pressure suit." },
      ];
    }
    return [
      {
        type: "PRINT",
        text: "The locker is locked. Try opening it first.",
        cls: "bad",
      },
    ];
  }
  return [
    { type: "PRINT", text: "There is nothing here to take.", cls: "bad" },
  ];
};

const handleReactorOpen: CommandHandler = (state, cmd) => {
  if (state.location !== "reactor" || cmd.verb !== "open") return null;
  if (
    cmd.noun === "locker" ||
    cmd.noun === "red locker" ||
    cmd.noun === "suit" ||
    !cmd.noun
  ) {
    if (state.inventory.some((i) => i.name === "pressure suit")) {
      return [{ type: "PRINT", text: "The locker is already open and empty." }];
    }
    return [
      {
        type: "PRINT",
        text: "The locker swings open. Inside: a deep-sea pressure suit.",
        cls: "sys",
      },
      { type: "ADD_TO_INVENTORY", item: ITEMS.pressure_suit },
      { type: "PRINT", text: "Taken.", cls: "sys" },
    ];
  }
  return null;
};

const handleReactorMove: CommandHandler = (state, cmd) => {
  if (state.location !== "reactor" || cmd.verb !== "move") return null;
  if (cmd.noun === "west" || cmd.noun === "south") {
    return [
      { type: "SET_LOCATION", location: "corridor" },
      { type: "PRINT", text: "[ MAIN CORRIDOR ]", cls: "sys" },
      { type: "PRINT", text: "Back in the corridor." },
    ];
  }
  return [{ type: "PRINT", text: "That direction is blocked.", cls: "bad" }];
};

const handleReactorLeave: CommandHandler = (state, cmd) => {
  if (state.location !== "reactor") return null;
  if (cmd.verb !== "leave") return null;
  return handleReactorMove(state, { ...cmd, verb: "move", noun: "west" });
};

const handleReactorFallback: CommandHandler = (state, _cmd) => {
  if (state.location !== "reactor") return null;
  return [{ type: "PRINT", text: "You can't do that here.", cls: "bad" }];
};

// ─── AIRLOCK ─────────────────────────────────────────────────────────────────

const handleAirlockLook: CommandHandler = (state, cmd) => {
  if (state.location !== "airlock" || cmd.verb !== "look") return null;

  if (cmd.noun === "window" || cmd.noun === "port" || cmd.noun === "porthole") {
    return [
      {
        type: "PRINT",
        text: "Through the thick acrylic port: total darkness.",
      },
      {
        type: "PRINT",
        text: "Something large is pressed against the hull directly outside.",
      },
      { type: "PRINT", text: "It has been there for a while." },
    ];
  }

  if (cmd.noun === "pod" || cmd.noun === "escape pod") {
    return [
      {
        type: "PRINT",
        text: "The single-person escape pod. Status lights: all green. Ascent time to surface: approximately 22 minutes.",
      },
    ];
  }

  if (cmd.noun) return null;

  const hasSuit = state.inventory.some((i) => i.name === "pressure suit");
  return [
    {
      type: "PRINT",
      text: "The airlock chamber. Bare steel walls, a manual pressure gauge, and the docked escape pod at the far end.",
    },
    {
      type: "PRINT",
      text: hasSuit
        ? "You are wearing the pressure suit. The pod is ready. Type LAUNCH to activate the escape sequence."
        : "The pod is ready — but you have no pressure suit. An emergency ascent from 3,400m without one is a death sentence.",
    },
  ];
};

const handleAirlockLaunch: CommandHandler = (state, cmd) => {
  if (state.location !== "airlock") return null;
  if (cmd.verb !== "launch" && cmd.verb !== "activate" && cmd.verb !== "enter")
    return null;
  const target = cmd.noun ?? "";
  const isPodTarget =
    !target ||
    target.includes("pod") ||
    target.includes("escape") ||
    target.includes("sequence");
  if (!isPodTarget) return null;

  const hasSuit = state.inventory.some((i) => i.name === "pressure suit");
  const hasBeacon = state.inventory.some((i) => i.name === "emergency beacon");

  if (!hasSuit) {
    return [
      {
        type: "PRINT",
        text: "You seal yourself inside the pod and hit the launch sequence.",
        cls: "sys",
      },
      { type: "DELAY", ms: 800 },
      {
        type: "PRINT",
        text: "The pod detaches and begins its ascent. Without a pressure suit, decompression begins immediately.",
      },
      { type: "DELAY", ms: 600 },
      {
        type: "PRINT",
        text: "At 2,100m, the pain becomes impossible to describe.",
      },
      { type: "DELAY", ms: 400 },
      { type: "PRINT", text: "GAME OVER.", cls: "bad" },
      { type: "PRINT", text: "" },
      { type: "PRINT", text: "(type RESTART to try again.)", cls: "sys" },
      { type: "END_GAME", ending: "crush" },
    ];
  }

  const escapeEffects: GameEffect[] = [
    {
      type: "PRINT",
      text: "You seal yourself inside the pod and engage the launch sequence.",
      cls: "sys",
    },
    { type: "DELAY", ms: 600 },
    {
      type: "PRINT",
      text: "The docking clamps release. The pod shudders free of the station.",
    },
    { type: "DELAY", ms: 800 },
    {
      type: "PRINT",
      text: "Through the pod's viewport, the Mariana Bastion shrinks into the black below you.",
    },
    { type: "DELAY", ms: 500 },
    {
      type: "PRINT",
      text: "Something enormous moves through the dark alongside the ascending pod. For a long moment, it keeps pace.",
    },
    { type: "DELAY", ms: 700 },
    { type: "PRINT", text: "Then it turns back down. Into the trench." },
    { type: "DELAY", ms: 600 },
  ];

  if (hasBeacon) {
    escapeEffects.push(
      {
        type: "PRINT",
        text: "You activate the emergency beacon. It will broadcast your location for 48 hours.",
      },
      { type: "DELAY", ms: 400 },
    );
  }

  escapeEffects.push(
    {
      type: "PRINT",
      text: "At 06:14 the following morning, a Coast Guard cutter pulls you from the water.",
    },
    { type: "PRINT", text: "You survived.", cls: "sys" },
    { type: "PRINT", text: "" },
    { type: "PRINT", text: "(type RESTART to play again.)", cls: "sys" },
    { type: "END_GAME", ending: "escape" },
  );

  return escapeEffects;
};

const handleAirlockMove: CommandHandler = (state, cmd) => {
  if (state.location !== "airlock" || cmd.verb !== "move") return null;
  if (cmd.noun === "south") {
    return [
      { type: "SET_LOCATION", location: "corridor" },
      { type: "PRINT", text: "[ MAIN CORRIDOR ]", cls: "sys" },
      { type: "PRINT", text: "Back in the corridor." },
    ];
  }
  return [{ type: "PRINT", text: "That direction is blocked.", cls: "bad" }];
};

const handleAirlockFallback: CommandHandler = (state, _cmd) => {
  if (state.location !== "airlock") return null;
  return [
    {
      type: "PRINT",
      text: "The pod is waiting. Type LAUNCH to go.",
      cls: "bad",
    },
  ];
};

// ─── LOCATION ROUTING ────────────────────────────────────────────────────────

const moduleCHandler = chain(
  handleModuleCLook,
  handleModuleCTake,
  handleModuleCMove,
  handleModuleCLeave,
  handleModuleCFallback,
);

const corridorHandler = chain(
  handleCorridorLook,
  handleCorridorMove,
  handleCorridorFallback,
);

const reactorHandler = chain(
  handleReactorLook,
  handleReactorReroute,
  handleReactorTake,
  handleReactorOpen,
  handleReactorMove,
  handleReactorLeave,
  handleReactorFallback,
);

const airlockHandler = chain(
  handleAirlockLook,
  handleAirlockLaunch,
  handleAirlockMove,
  handleAirlockFallback,
);

const locationHandlers: Record<string, CommandHandler> = {
  module_c: moduleCHandler,
  corridor: corridorHandler,
  reactor: reactorHandler,
  airlock: airlockHandler,
};

export const handle = createHandle(universalHandler, locationHandlers);
