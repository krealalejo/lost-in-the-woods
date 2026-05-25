import { describe, expect, it } from "vitest";
import type { GameState } from "../engine/types";
import { handle, FOREST_SEQUENCE } from "../stories/lost-in-woods/handlers";
import { parse } from "../stories/lost-in-woods/parser";

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    location: "house",
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
    const state = makeState({ inventory: ["keys"] });
    const text = firstPrint(state, "inventory");
    expect(text).toMatch(/keys/);
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

describe("handle — house", () => {
  it("look describes living room", () => {
    const text = firstPrint(makeState(), "look");
    expect(text).toMatch(/living room/i);
  });

  it("take keys adds to inventory", () => {
    const effects = handle(makeState(), parse("take keys"));
    expect(effects).toContainEqual({ type: "ADD_TO_INVENTORY", item: "keys" });
  });

  it("take keys when already held reports duplicate", () => {
    const state = makeState({ inventory: ["keys"] });
    const text = firstPrint(state, "take keys");
    expect(text).toMatch(/already/i);
  });

  it("open door without keys is blocked", () => {
    const effects = handle(makeState(), parse("open door"));
    const print = effects.find((e) => e.type === "PRINT");
    expect(print && "cls" in print ? print.cls : "").toBe("bad");
  });

  it("open door with keys sets hasOpened flag", () => {
    const state = makeState({ inventory: ["keys"] });
    const effects = handle(state, parse("open door"));
    expect(effects).toContainEqual({
      type: "SET_FLAG",
      key: "hasOpened",
      value: true,
    });
  });

  it("move without keys is blocked", () => {
    const effects = handle(makeState(), parse("north"));
    const print = effects.find((e) => e.type === "PRINT");
    expect(print && "cls" in print ? print.cls : "").toBe("bad");
  });

  it("move with keys enters forest", () => {
    const state = makeState({ inventory: ["keys"] });
    const effects = handle(state, parse("north"));
    expect(effects).toContainEqual({
      type: "SET_LOCATION",
      location: "forest",
    });
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

  it("wrong step silently resets forestStep to 0", () => {
    const state = forestState(3);
    const wrongDir = FOREST_SEQUENCE[0] === "north" ? "south" : "north";
    const effects = handle(state, parse(wrongDir));
    expect(effects).toContainEqual({
      type: "SET_FLAG",
      key: "forestStep",
      value: 0,
    });
  });

  it("completing sequence enters clearing", () => {
    const state = forestState(FOREST_SEQUENCE.length - 1, 1);
    const lastDir = FOREST_SEQUENCE.at(-1)!;
    const effects = handle(state, parse(lastDir));
    expect(effects).toContainEqual({
      type: "SET_LOCATION",
      location: "clearing",
    });
  });

  it("entering clearing with turns <= 25 triggers win", () => {
    const state = forestState(FOREST_SEQUENCE.length - 1, 1);
    const lastDir = FOREST_SEQUENCE.at(-1)!;
    const effects = handle(state, parse(lastDir));
    const endGame = effects.find((e) => e.type === "END_GAME");
    expect(endGame && "ending" in endGame ? endGame.ending : "").toBe("win");
  });

  it("entering clearing with turns > 25 triggers vampires", () => {
    const state = forestState(FOREST_SEQUENCE.length - 1, 26);
    const lastDir = FOREST_SEQUENCE.at(-1)!;
    const effects = handle(state, parse(lastDir));
    const endGame = effects.find((e) => e.type === "END_GAME");
    expect(endGame && "ending" in endGame ? endGame.ending : "").toBe(
      "vampires",
    );
  });
});

describe("handle — clearing", () => {
  it("look returns description", () => {
    const state = makeState({ location: "clearing" });
    const text = firstPrint(state, "look");
    expect(text).toMatch(/moonlit/i);
  });

  it("unknown verb returns bad print", () => {
    const state = makeState({ location: "clearing" });
    const effects = handle(state, parse("dance"));
    const print = effects.find((e) => e.type === "PRINT");
    expect(print && "cls" in print ? print.cls : "").toBe("bad");
  });

  it("move in clearing returns bad print", () => {
    const state = makeState({ location: "clearing" });
    const effects = handle(state, parse("north"));
    const print = effects.find((e) => e.type === "PRINT");
    expect(print && "cls" in print ? print.cls : "").toBe("bad");
  });
});

describe("handle — house extra branches", () => {
  it("look at note/fridge shows note text", () => {
    const text = firstPrint(makeState(), "look note");
    expect(text).toMatch(/PICK UP MOM/i);
  });

  it("look at keys shows key description", () => {
    const text = firstPrint(makeState(), "look keys");
    expect(text).toMatch(/keyring/i);
  });

  it("look at unknown noun falls through", () => {
    const effects = handle(makeState(), parse("look sofa"));
    const print = effects.find((e) => e.type === "PRINT");
    expect(print && "cls" in print ? print.cls : "").toBe("bad");
  });

  it("open door when already open reports already open", () => {
    const state = makeState({
      inventory: ["keys"],
      flags: { hasOpened: true },
    });
    const text = firstPrint(state, "open door");
    expect(text).toMatch(/already open/i);
  });

  it("use keys opens door", () => {
    const state = makeState({ inventory: ["keys"] });
    const effects = handle(state, parse("use keys"));
    expect(effects).toContainEqual({
      type: "SET_FLAG",
      key: "hasOpened",
      value: true,
    });
  });

  it("drop item in house", () => {
    const text = firstPrint(makeState(), "drop keys");
    expect(text).toMatch(/rug/i);
  });

  it("take non-keys item returns bad print", () => {
    const effects = handle(makeState(), parse("take sofa"));
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

  it("yell in clearing gets an answer", () => {
    const state = makeState({ location: "clearing" });
    const text = firstPrint(state, "yell");
    expect(text).toMatch(/answers/i);
  });

  it("yell in house disturbs the neighbor's dog", () => {
    const text = firstPrint(makeState(), "yell");
    expect(text).toMatch(/dog/i);
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

  it("look without noun gives forest description", () => {
    const text = firstPrint(forestState(0), "look");
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
