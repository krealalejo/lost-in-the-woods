import { describe, expect, it } from "vitest";
import type { GameState } from "../engine/types";
import { handle, FOREST_SEQUENCE } from "../stories/lost-in-woods/handlers";
import { parse } from "../stories/lost-in-woods/parser";

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    location: "tent",
    inventory: [],
    flags: {},
    turns: 0,
    ended: null,
    ...overrides,
  };
}

function effectTypes(state: GameState, input: string) {
  return handle(state, parse(input)).map((e) => e.type);
}

function firstPrint(state: GameState, input: string): string {
  const effects = handle(state, parse(input));
  const print = effects.find((e) => e.type === "PRINT");
  return print && "text" in print ? print.text : "";
}

describe("handle — universal commands", () => {
  it("increments turns on every command", () => {
    const state = makeState();
    const effects = handle(state, parse("help"));
    expect(effects[0]).toEqual({ type: "INCREMENT_TURNS" });
  });

  it("help returns verb list", () => {
    const effects = handle(makeState(), parse("help"));
    const prints = effects.filter((e) => e.type === "PRINT");
    expect(prints.length).toBeGreaterThan(0);
  });

  it("inv with empty inventory reports empty pockets", () => {
    const text = firstPrint(makeState(), "inv");
    expect(text).toMatch(/empty/i);
  });

  it("inv with items lists them", () => {
    const state = makeState({ inventory: ["flashlight"] });
    const text = firstPrint(state, "inventory");
    expect(text).toMatch(/flashlight/);
  });

  it("wait does not end game", () => {
    const effects = handle(makeState(), parse("wait"));
    expect(effects.find((e) => e.type === "END_GAME")).toBeUndefined();
  });

  it("quit produces END_GAME effect", () => {
    const types = effectTypes(makeState(), "quit");
    expect(types).toContain("END_GAME");
  });
});

describe("handle — tent", () => {
  it("take flashlight adds to inventory", () => {
    const effects = handle(
      makeState({ location: "tent" }),
      parse("take flashlight"),
    );
    expect(effects).toContainEqual({
      type: "ADD_TO_INVENTORY",
      item: "flashlight",
    });
  });

  it("take flashlight when already held reports duplicate", () => {
    const state = makeState({ location: "tent", inventory: ["flashlight"] });
    const text = firstPrint(state, "take flashlight");
    expect(text).toMatch(/already/i);
    const effects = handle(state, parse("take flashlight"));
    const addEffects = effects.filter((e) => e.type === "ADD_TO_INVENTORY");
    expect(addEffects.length).toBe(0);
  });

  it("leave enters forest", () => {
    const effects = handle(makeState({ location: "tent" }), parse("leave"));
    expect(effects).toContainEqual({
      type: "SET_LOCATION",
      location: "forest",
    });
  });

  it("exit enters forest", () => {
    const effects = handle(makeState({ location: "tent" }), parse("exit"));
    expect(effects).toContainEqual({
      type: "SET_LOCATION",
      location: "forest",
    });
  });

  it("north enters forest without flashlight", () => {
    const state = makeState({ location: "tent", inventory: [] });
    const effects = handle(state, parse("north"));
    expect(effects).toContainEqual({
      type: "SET_LOCATION",
      location: "forest",
    });
  });

  it("look describes tent interior", () => {
    const text = firstPrint(makeState({ location: "tent" }), "look");
    expect(text.length).toBeGreaterThan(0);
  });
});

describe("handle — tent linger", () => {
  const SHADOW_STRING =
    "A tall shadow stretches across the fabric of the tent.";

  it("turn 2 shows no shadow warning", () => {
    const state = makeState({ location: "tent", turns: 2 });
    const effects = handle(state, parse("dance"));
    const prints = effects.filter((e) => e.type === "PRINT");
    const shadowPrint = prints.find(
      (e) => "text" in e && e.text === SHADOW_STRING,
    );
    expect(shadowPrint).toBeUndefined();
  });

  it("turn 3 shows shadow warning", () => {
    const state = makeState({ location: "tent", turns: 3 });
    const effects = handle(state, parse("dance"));
    const prints = effects.filter((e) => e.type === "PRINT");
    const shadowPrint = prints.find(
      (e) => "text" in e && e.text === SHADOW_STRING,
    );
    expect(shadowPrint).toBeDefined();
  });

  it("turn 6 shows a more intense warning", () => {
    const state = makeState({ location: "tent", turns: 6 });
    const effects = handle(state, parse("dance"));
    const prints = effects.filter((e) => e.type === "PRINT");
    const lingerPrint = prints.find(
      (e) => "text" in e && e.text !== "You can't do that here.",
    );
    expect(lingerPrint).toBeDefined();
    expect(
      lingerPrint && "text" in lingerPrint ? lingerPrint.text : "",
    ).not.toBe(SHADOW_STRING);
  });

  it("turn 9 shows the panic warning", () => {
    const state = makeState({ location: "tent", turns: 9 });
    const effects = handle(state, parse("dance"));
    const prints = effects.filter((e) => e.type === "PRINT");
    const lingerPrint = prints.find(
      (e) => "text" in e && e.text !== "You can't do that here.",
    );
    expect(lingerPrint).toBeDefined();
    // turn 9 panic text is distinct from turn 6
    const turn6State = makeState({ location: "tent", turns: 6 });
    const turn6Effects = handle(turn6State, parse("dance"));
    const turn6Prints = turn6Effects.filter((e) => e.type === "PRINT");
    const turn6Linger = turn6Prints.find(
      (e) => "text" in e && e.text !== "You can't do that here.",
    );
    expect(
      lingerPrint && "text" in lingerPrint ? lingerPrint.text : "",
    ).not.toBe(turn6Linger && "text" in turn6Linger ? turn6Linger.text : "");
  });

  it("valid command at turn 3 does not show linger warning", () => {
    const state = makeState({ location: "tent", turns: 3 });
    const effects = handle(state, parse("take flashlight"));
    const prints = effects.filter((e) => e.type === "PRINT");
    const shadowPrint = prints.find(
      (e) => "text" in e && e.text === SHADOW_STRING,
    );
    expect(shadowPrint).toBeUndefined();
  });
});

function forestState(step: number, turns = 1): GameState {
  return makeState({
    location: "forest",
    flags: { forestStep: step },
    turns,
  });
}

describe("handle — forest sequence", () => {
  it("correct step advances forestStep", () => {
    const state = forestState(0);
    const dir = FOREST_SEQUENCE[0];
    const effects = handle(state, parse(dir));
    expect(effects).toContainEqual({
      type: "SET_FLAG",
      key: "forestStep",
      value: 1,
    });
  });

  it("wrong step resets forestStep to 0", () => {
    const state = forestState(3);
    const wrongDir = FOREST_SEQUENCE[0] === "north" ? "south" : "north";
    const effects = handle(state, parse(wrongDir));
    expect(effects).toContainEqual({
      type: "SET_FLAG",
      key: "forestStep",
      value: 0,
    });
    // Assert the reset PRINT is one of the 5 Akasawa lost-descriptions
    const prints = effects.filter((e) => e.type === "PRINT");
    const lostDescriptions = [
      "You keep walking, but you could swear you already passed this same twisted pine tree.",
      "The flashlight beam catches something hanging from a branch: a humanoid figure made of sticks and filthy rope.",
      "You find three stones stacked on the ground. You did not place them there. Something is guiding you in circles.",
      "Far away, you hear a child crying. It sounds wrong, as if something is imitating the noise.",
      "You check the compass, but the needle spins wildly without stopping. You are completely disoriented.",
    ];
    const descPrint = prints.find(
      (e) => "text" in e && lostDescriptions.includes(e.text),
    );
    expect(descPrint).toBeDefined();
  });

  it("completing sequence enters road", () => {
    const state = forestState(FOREST_SEQUENCE.length - 1, 1);
    const lastDir = FOREST_SEQUENCE.at(-1)!;
    const effects = handle(state, parse(lastDir));
    expect(effects).toContainEqual({
      type: "SET_LOCATION",
      location: "road",
    });
  });

  it("entering road with turns <= 25 triggers win", () => {
    const state = forestState(FOREST_SEQUENCE.length - 1, 1);
    const lastDir = FOREST_SEQUENCE.at(-1)!;
    const effects = handle(state, parse(lastDir));
    const endGame = effects.find((e) => e.type === "END_GAME");
    expect(endGame && "ending" in endGame ? endGame.ending : "").toBe("win");
  });

  it("entering road with turns > 25 triggers presence", () => {
    const state = forestState(FOREST_SEQUENCE.length - 1, 26);
    const lastDir = FOREST_SEQUENCE.at(-1)!;
    const effects = handle(state, parse(lastDir));
    const endGame = effects.find((e) => e.type === "END_GAME");
    expect(endGame && "ending" in endGame ? endGame.ending : "").toBe(
      "presence",
    );
  });

  it("entering road at exactly turns=24 (turnsAfterEntry=25) triggers win", () => {
    const state = forestState(FOREST_SEQUENCE.length - 1, 24);
    const effects = handle(state, parse(FOREST_SEQUENCE.at(-1)!));
    const endGame = effects.find((e) => e.type === "END_GAME");
    expect(endGame && "ending" in endGame ? endGame.ending : "").toBe("win");
  });

  it("entering road at exactly turns=25 (turnsAfterEntry=26) triggers presence", () => {
    const state = forestState(FOREST_SEQUENCE.length - 1, 25);
    const effects = handle(state, parse(FOREST_SEQUENCE.at(-1)!));
    const endGame = effects.find((e) => e.type === "END_GAME");
    expect(endGame && "ending" in endGame ? endGame.ending : "").toBe(
      "presence",
    );
  });
});

describe("handle — forest look (flashlight)", () => {
  it("look without flashlight is dark", () => {
    const state = forestState(0);
    // forestState has empty inventory by default
    const text = firstPrint(state, "look");
    expect(text).toMatch(/too dark/i);
  });

  it("look with flashlight gives prose", () => {
    const state = makeState({
      location: "forest",
      flags: { forestStep: 0 },
      inventory: ["flashlight"],
      turns: 1,
    });
    const text = firstPrint(state, "look");
    expect(text.length).toBeGreaterThan(0);
    expect(text).not.toMatch(/too dark/i);
  });
});

describe("handle — road", () => {
  it("look returns a road description", () => {
    const state = makeState({ location: "road" });
    const text = firstPrint(state, "look");
    expect(text.length).toBeGreaterThan(0);
  });

  it("unknown verb returns bad print", () => {
    const state = makeState({ location: "road" });
    const effects = handle(state, parse("dance"));
    const print = effects.find((e) => e.type === "PRINT");
    expect(print && "cls" in print ? print.cls : "").toBe("bad");
  });
});

describe("handle — yell", () => {
  it("yell in forest is swallowed by trees", () => {
    const state = makeState({ location: "forest" });
    const text = firstPrint(state, "yell");
    expect(text).toMatch(/trees/i);
  });

  it("yell in road gets an answer", () => {
    const state = makeState({ location: "road" });
    const text = firstPrint(state, "yell");
    expect(text).toMatch(/answers/i);
  });

  it("yell in tent uses default text", () => {
    const state = makeState({ location: "tent" });
    const text = firstPrint(state, "yell");
    expect(text.length).toBeGreaterThan(0);
    expect(text).not.toMatch(/trees/i);
    expect(text).not.toMatch(/answers/i);
  });
});

describe("handle — forest extra branches", () => {
  it("look at trees", () => {
    const text = firstPrint(forestState(0), "look trees");
    expect(text).toMatch(/trees/i);
  });

  it("look at ground", () => {
    const text = firstPrint(forestState(0), "look ground");
    expect(text).toMatch(/Pine needles/i);
  });

  it("look without noun gives forest description (flashlight)", () => {
    const state = makeState({
      location: "forest",
      flags: { forestStep: 0 },
      inventory: ["flashlight"],
      turns: 1,
    });
    const text = firstPrint(state, "look");
    expect(text.length).toBeGreaterThan(0);
  });

  it("look at unknown noun falls through", () => {
    const effects = handle(forestState(0), parse("look moon"));
    const print = effects.find((e) => e.type === "PRINT");
    expect(print && "cls" in print ? print.cls : "").toBe("bad");
  });

  it("take in forest returns nothing to take", () => {
    const text = firstPrint(forestState(0), "take stick");
    expect(text).toMatch(/nothing/i);
  });

  it("move with no direction prompts for direction", () => {
    const effects = handle(forestState(0), parse("go"));
    const print = effects.find((e) => e.type === "PRINT");
    expect(print && "cls" in print ? print.cls : "").toBe("bad");
  });

  it("open/use in forest returns nothing to use", () => {
    const text = firstPrint(forestState(0), "open door");
    expect(text).toMatch(/nothing/i);
  });
});
