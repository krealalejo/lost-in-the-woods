import { describe, expect, it } from "vitest";
import type { GameState } from "../engine/types";
import { ITEMS, handle } from "../stories/abyssal-pressure/handlers";
import { abyssalPressureStory } from "../stories/abyssal-pressure/index";
import { MAPS, renderMapTokens } from "../stories/abyssal-pressure/maps";
import { DIR_ALIASES, parse } from "../stories/abyssal-pressure/parser";
import { ALL_STORIES } from "../stories/index";
import { makeGameHelpers } from "./game-test-utils";

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    location: "module_c",
    inventory: [],
    flags: {},
    turns: 0,
    ended: null,
    ...overrides,
  };
}

const { effectTypes, firstPrint, allPrints } = makeGameHelpers(handle, parse);

// ─── parser ──────────────────────────────────────────────────────────────────

describe("abyssal-pressure parser", () => {
  it("empty string → verb:null noun:null", () => {
    const r = parse("");
    expect(r.verb).toBeNull();
    expect(r.noun).toBeNull();
  });

  it("only fillers → verb:null noun:null", () => {
    const r = parse("go to the");
    expect(r.verb).toBeNull();
    expect(r.noun).toBeNull();
  });

  it("single direction alias → move + canonical", () => {
    expect(parse("n")).toEqual({ verb: "move", noun: "north", raw: "n" });
    expect(parse("s")).toEqual({ verb: "move", noun: "south", raw: "s" });
    expect(parse("e")).toEqual({ verb: "move", noun: "east", raw: "e" });
    expect(parse("w")).toEqual({ verb: "move", noun: "west", raw: "w" });
    expect(parse("north")).toEqual({
      verb: "move",
      noun: "north",
      raw: "north",
    });
    expect(parse("forward")).toEqual({
      verb: "move",
      noun: "north",
      raw: "forward",
    });
    expect(parse("fwd")).toEqual({ verb: "move", noun: "north", raw: "fwd" });
    expect(parse("back")).toEqual({ verb: "move", noun: "south", raw: "back" });
  });

  it("direction verb alone (after filler strip) → move", () => {
    const r = parse("go north");
    expect(r.verb).toBe("move");
    expect(r.noun).toBe("north");
  });

  it("verb alias normalisation", () => {
    expect(parse("look").verb).toBe("look");
    expect(parse("l").verb).toBe("look");
    expect(parse("examine").verb).toBe("look");
    expect(parse("x").verb).toBe("look");
    expect(parse("inspect").verb).toBe("look");
    expect(parse("read").verb).toBe("look");
    expect(parse("take").verb).toBe("take");
    expect(parse("get").verb).toBe("take");
    expect(parse("grab").verb).toBe("take");
    expect(parse("pick").verb).toBe("take");
    expect(parse("drop").verb).toBe("drop");
    expect(parse("reroute").verb).toBe("reroute");
    expect(parse("restore").verb).toBe("reroute");
    expect(parse("connect").verb).toBe("reroute");
    expect(parse("fix").verb).toBe("reroute");
    expect(parse("launch").verb).toBe("launch");
    expect(parse("enter").verb).toBe("enter");
    expect(parse("walk").verb).toBe("move");
    expect(parse("run").verb).toBe("move");
    expect(parse("head").verb).toBe("move");
    expect(parse("crawl").verb).toBe("move");
    expect(parse("inventory").verb).toBe("inv");
    expect(parse("inv").verb).toBe("inv");
    expect(parse("i").verb).toBe("inv");
    expect(parse("help").verb).toBe("help");
    expect(parse("?").verb).toBe("help");
    expect(parse("wait").verb).toBe("wait");
    expect(parse("z").verb).toBe("wait");
    expect(parse("yell").verb).toBe("yell");
    expect(parse("scream").verb).toBe("yell");
    expect(parse("shout").verb).toBe("yell");
    expect(parse("quit").verb).toBe("quit");
    expect(parse("restart").verb).toBe("restart");
    expect(parse("reset").verb).toBe("restart");
    expect(parse("leave").verb).toBe("leave");
    expect(parse("exit").verb).toBe("leave");
  });

  it("unknown verb passed through", () => {
    expect(parse("swim").verb).toBe("swim");
  });

  it("noun preserved", () => {
    const r = parse("take beacon");
    expect(r.verb).toBe("take");
    expect(r.noun).toBe("beacon");
  });

  it("direction in noun resolved", () => {
    const r = parse("go n");
    expect(r.verb).toBe("move");
    expect(r.noun).toBe("north");
  });

  it("fillers stripped from noun", () => {
    const r = parse("take the beacon");
    expect(r.noun).toBe("beacon");
  });

  it("special chars removed", () => {
    const r = parse("take! beacon.");
    expect(r.verb).toBe("take");
    expect(r.noun).toBe("beacon");
  });

  it("DIR_ALIASES exports correct mappings", () => {
    expect(DIR_ALIASES.n).toBe("north");
    expect(DIR_ALIASES.s).toBe("south");
    expect(DIR_ALIASES.e).toBe("east");
    expect(DIR_ALIASES.w).toBe("west");
  });
});

// ─── maps ─────────────────────────────────────────────────────────────────────

describe("renderMapTokens", () => {
  it("{P} → player span", () => {
    expect(renderMapTokens("{P}")).toContain('<span class="player">@</span>');
  });

  it("{N:text} → note span", () => {
    expect(renderMapTokens("{N:///}")).toContain(
      '<span class="note">///</span>',
    );
  });

  it("{LBL:text} → label span", () => {
    expect(renderMapTokens("{LBL:WIN}")).toContain(
      '<span class="label">WIN</span>',
    );
  });

  it("{D:text} → dim span", () => {
    expect(renderMapTokens("{D:you}")).toContain(
      '<span class="dim">you</span>',
    );
  });

  it("{F:text} → faint span", () => {
    expect(renderMapTokens("{F:fog}")).toContain(
      '<span class="faint">fog</span>',
    );
  });

  it("< and > escaped", () => {
    const out = renderMapTokens("a<b>c");
    expect(out).toContain("&lt;");
    expect(out).toContain("&gt;");
  });

  it("MAPS has all required keys", () => {
    [
      "module_c",
      "corridor",
      "reactor",
      "airlock",
      "ending_escape",
      "ending_crush",
    ].forEach((k) => expect(MAPS[k]).toBeDefined());
  });
});

// ─── story index ─────────────────────────────────────────────────────────────

describe("ALL_STORIES", () => {
  it("contains both stories", () => {
    const ids = ALL_STORIES.map((s) => s.id);
    expect(ids).toContain("lost-in-woods");
    expect(ids).toContain("abyssal-pressure");
  });
});

// ─── abyssalPressureStory ────────────────────────────────────────────────────

describe("abyssalPressureStory", () => {
  it("initialState returns correct defaults", () => {
    const s = abyssalPressureStory.initialState();
    expect(s.location).toBe("module_c");
    expect(s.inventory).toEqual([]);
    expect(s.flags).toEqual({});
    expect(s.turns).toBe(0);
    expect(s.ended).toBeNull();
  });

  it("initialState fresh each call", () => {
    const a = abyssalPressureStory.initialState();
    const b = abyssalPressureStory.initialState();
    a.inventory.push({ name: "x", description: "" });
    expect(b.inventory).toHaveLength(0);
  });

  it("id / title / version", () => {
    expect(abyssalPressureStory.id).toBe("abyssal-pressure");
    expect(abyssalPressureStory.title).toBe("ABYSSAL PRESSURE");
    expect(abyssalPressureStory.version).toBeDefined();
  });

  it("getIntro returns non-empty effects starting with title PRINT", () => {
    const fx = abyssalPressureStory.getIntro();
    expect(fx.length).toBeGreaterThan(0);
    const first = fx[0];
    expect(first.type).toBe("PRINT");
    if (first.type === "PRINT") expect(first.text).toMatch(/ABYSSAL/i);
  });

  it("getMap returns html for each location", () => {
    for (const loc of ["module_c", "corridor", "reactor", "airlock"]) {
      const html = abyssalPressureStory.getMap({
        ...abyssalPressureStory.initialState(),
        location: loc,
      });
      expect(html.length).toBeGreaterThan(0);
    }
  });

  it("getMap escape ending", () => {
    const html = abyssalPressureStory.getMap({
      ...abyssalPressureStory.initialState(),
      ended: "escape",
    });
    expect(html).toMatch(/E S C A P E D/);
  });

  it("getMap crush ending", () => {
    const html = abyssalPressureStory.getMap({
      ...abyssalPressureStory.initialState(),
      ended: "crush",
    });
    expect(html).toMatch(/3 4 0/);
  });

  it("getMap unknown location returns empty string", () => {
    const html = abyssalPressureStory.getMap({
      ...abyssalPressureStory.initialState(),
      location: "void",
    });
    expect(html).toBe("");
  });

  it("has paths array", () => {
    expect(Array.isArray(abyssalPressureStory.paths)).toBe(true);
    expect(abyssalPressureStory.paths!.length).toBeGreaterThan(0);
  });
});

// ─── handle — universal ──────────────────────────────────────────────────────

describe("abyssal-pressure handle — universal", () => {
  it("always prepends INCREMENT_TURNS", () => {
    expect(effectTypes(makeState(), "help")[0]).toBe("INCREMENT_TURNS");
  });

  it("help returns PRINT effects", () => {
    const fx = handle(makeState(), parse("help"));
    expect(fx.filter((e) => e.type === "PRINT").length).toBeGreaterThan(0);
  });

  it("inv empty", () => {
    expect(firstPrint(makeState(), "i")).toMatch(/nothing/i);
  });

  it("inv with items lists names", () => {
    const state = makeState({ inventory: [ITEMS.emergency_beacon] });
    expect(firstPrint(state, "inv")).toMatch(/emergency beacon/);
  });

  it("restart produces RELOAD effect", () => {
    expect(effectTypes(makeState(), "restart")).toContain("RELOAD");
  });

  it("quit produces END_GAME", () => {
    expect(effectTypes(makeState(), "quit")).toContain("END_GAME");
  });

  it("wait prints station groan", () => {
    expect(firstPrint(makeState(), "wait")).toMatch(/waiting/i);
  });

  it("yell outside airlock — hull message", () => {
    const text = firstPrint(makeState({ location: "corridor" }), "yell");
    expect(text).toMatch(/hull/i);
  });

  it("yell inside airlock — echo message", () => {
    const text = firstPrint(makeState({ location: "airlock" }), "yell");
    expect(text).toMatch(/echo/i);
  });

  it("scream aliases to yell", () => {
    const fx = handle(makeState(), parse("scream"));
    expect(fx.some((e) => e.type === "PRINT")).toBe(true);
  });
});

// ─── module_c ────────────────────────────────────────────────────────────────

describe("abyssal-pressure handle — module_c", () => {
  it("look room without beacon", () => {
    const prints = allPrints(makeState(), "look");
    expect(prints.join(" ")).toMatch(/beacon/i);
  });

  it("look room with beacon already taken", () => {
    const state = makeState({ inventory: [ITEMS.emergency_beacon] });
    const prints = allPrints(state, "look");
    expect(prints.join(" ")).not.toMatch(/beacon sits/i);
  });

  it("look window", () => {
    expect(firstPrint(makeState(), "look window")).toMatch(/black/i);
  });

  it("look porthole", () => {
    expect(firstPrint(makeState(), "look porthole")).toMatch(/black/i);
  });

  it("look beacon item", () => {
    expect(firstPrint(makeState(), "look beacon")).toMatch(/beacon/i);
  });

  it("look unknown noun falls through to fallback", () => {
    expect(firstPrint(makeState(), "look chair")).toMatch(/can't do that/i);
  });

  it("take beacon when not held", () => {
    expect(effectTypes(makeState(), "take beacon")).toContain(
      "ADD_TO_INVENTORY",
    );
  });

  it("take beacon when already held", () => {
    const state = makeState({ inventory: [ITEMS.emergency_beacon] });
    expect(firstPrint(state, "take beacon")).toMatch(/already/i);
  });

  it("take other item", () => {
    expect(firstPrint(makeState(), "take suit")).toMatch(/nothing/i);
  });

  it("move north without beacon warns but moves", () => {
    const fx = handle(makeState(), parse("north"));
    const prints = fx
      .filter((e) => e.type === "PRINT")
      .map((e) => ("text" in e ? e.text : ""));
    const setLoc = fx.find((e) => e.type === "SET_LOCATION");
    expect(setLoc).toBeDefined();
    expect(prints.join(" ")).toMatch(/beacon/i);
  });

  it("move north with beacon moves silently", () => {
    const state = makeState({ inventory: [ITEMS.emergency_beacon] });
    const fx = handle(state, parse("north"));
    const setLoc = fx.find((e) => e.type === "SET_LOCATION");
    expect(setLoc).toBeDefined();
    if (setLoc && "location" in setLoc)
      expect(setLoc.location).toBe("corridor");
  });

  it("move non-north blocked", () => {
    expect(firstPrint(makeState(), "south")).toMatch(/north/i);
  });

  it("leave proxies to move north", () => {
    const fx = handle(makeState(), parse("leave"));
    expect(fx.find((e) => e.type === "SET_LOCATION")).toBeDefined();
  });

  it("unknown command fallback", () => {
    expect(firstPrint(makeState(), "swim")).toMatch(/can't do that/i);
  });
});

// ─── corridor ────────────────────────────────────────────────────────────────

describe("abyssal-pressure handle — corridor", () => {
  const base = () => makeState({ location: "corridor" });

  it("look room unpowered", () => {
    const text = allPrints(base(), "look").join(" ");
    expect(text).toMatch(/RED/);
  });

  it("look room powered", () => {
    const state = { ...base(), flags: { power_rerouted: true } };
    expect(allPrints(state, "look").join(" ")).toMatch(/GREEN/);
  });

  it("look door unpowered", () => {
    expect(firstPrint(base(), "look door")).toMatch(/POWER FAULT/);
  });

  it("look door powered", () => {
    const state = { ...base(), flags: { power_rerouted: true } };
    expect(firstPrint(state, "look door")).toMatch(/NOMINAL/);
  });

  it("look bulkhead same as look door", () => {
    expect(firstPrint(base(), "look bulkhead")).toMatch(/POWER FAULT/);
  });

  it("look unknown noun falls through to fallback", () => {
    expect(firstPrint(base(), "look chair")).toMatch(/can't do that/i);
  });

  it("move south → module_c", () => {
    const fx = handle(base(), parse("south"));
    const loc = fx.find((e) => e.type === "SET_LOCATION");
    expect(loc && "location" in loc ? loc.location : "").toBe("module_c");
  });

  it("move east → reactor", () => {
    const fx = handle(base(), parse("east"));
    const loc = fx.find((e) => e.type === "SET_LOCATION");
    expect(loc && "location" in loc ? loc.location : "").toBe("reactor");
  });

  it("move north unpowered → blocked", () => {
    expect(firstPrint(base(), "north")).toMatch(/sealed/i);
  });

  it("move north powered → airlock", () => {
    const state = { ...base(), flags: { power_rerouted: true } };
    const fx = handle(state, parse("north"));
    const loc = fx.find((e) => e.type === "SET_LOCATION");
    expect(loc && "location" in loc ? loc.location : "").toBe("airlock");
  });

  it("move west → blocked", () => {
    expect(firstPrint(base(), "west")).toMatch(/blocked/i);
  });

  it("unknown command fallback", () => {
    expect(firstPrint(base(), "swim")).toMatch(/can't do that/i);
  });
});

// ─── reactor ─────────────────────────────────────────────────────────────────

describe("abyssal-pressure handle — reactor", () => {
  const base = () => makeState({ location: "reactor" });

  it("look room without suit shows locker", () => {
    expect(allPrints(base(), "look").join(" ")).toMatch(/locker/i);
  });

  it("look room with suit hides locker", () => {
    const state = { ...base(), inventory: [ITEMS.pressure_suit] };
    expect(allPrints(state, "look").join(" ")).not.toMatch(/locker/i);
  });

  it("look panel unpowered", () => {
    expect(firstPrint(base(), "look panel")).toMatch(/AIRLOCK POWER CIRCUIT/);
  });

  it("look routing panel unpowered", () => {
    expect(firstPrint(base(), "look routing panel")).toMatch(
      /AIRLOCK POWER CIRCUIT/,
    );
  });

  it("look panel powered", () => {
    const state = { ...base(), flags: { power_rerouted: true } };
    expect(firstPrint(state, "look panel")).toMatch(/NOMINAL/);
  });

  it("look locker without suit", () => {
    expect(firstPrint(base(), "look locker")).toMatch(/PRESSURE SUIT/);
  });

  it("look red locker without suit", () => {
    expect(firstPrint(base(), "look red locker")).toMatch(/PRESSURE SUIT/);
  });

  it("look locker with suit", () => {
    const state = { ...base(), inventory: [ITEMS.pressure_suit] };
    expect(firstPrint(state, "look locker")).toMatch(/already took/i);
  });

  it("look unknown noun falls through to fallback", () => {
    expect(firstPrint(base(), "look chair")).toMatch(/can't do that/i);
  });

  it("reroute power first time sets flag and prints", () => {
    const fx = handle(base(), parse("reroute power"));
    expect(fx.find((e) => e.type === "SET_FLAG")).toBeDefined();
    expect(fx.filter((e) => e.type === "PRINT").length).toBeGreaterThan(0);
  });

  it("reroute with no noun (just 'reroute')", () => {
    const fx = handle(base(), parse("reroute"));
    expect(fx.find((e) => e.type === "SET_FLAG")).toBeDefined();
  });

  it("reroute panel target", () => {
    const fx = handle(base(), parse("reroute panel"));
    expect(fx.find((e) => e.type === "SET_FLAG")).toBeDefined();
  });

  it("reroute circuit target", () => {
    const fx = handle(base(), parse("reroute circuit"));
    expect(fx.find((e) => e.type === "SET_FLAG")).toBeDefined();
  });

  it("reroute switch target", () => {
    const fx = handle(base(), parse("reroute switch"));
    expect(fx.find((e) => e.type === "SET_FLAG")).toBeDefined();
  });

  it("reroute already done", () => {
    const state = { ...base(), flags: { power_rerouted: true } };
    expect(firstPrint(state, "reroute power")).toMatch(/already/i);
  });

  it("use panel → reroutes", () => {
    const fx = handle(base(), parse("use panel"));
    expect(fx.find((e) => e.type === "SET_FLAG")).toBeDefined();
  });

  it("activate panel → reroutes", () => {
    const fx = handle(base(), parse("activate panel"));
    expect(fx.find((e) => e.type === "SET_FLAG")).toBeDefined();
  });

  it("reroute non-panel noun falls through to fallback", () => {
    expect(firstPrint(base(), "reroute chair")).toMatch(/can't do that/i);
  });

  it("take suit when not held prompts to open locker", () => {
    expect(firstPrint(base(), "take suit")).toMatch(/open/i);
  });

  it("take pressure suit when not held prompts to open", () => {
    expect(firstPrint(base(), "take pressure suit")).toMatch(/open/i);
  });

  it("take suit when already held", () => {
    const state = { ...base(), inventory: [ITEMS.pressure_suit] };
    expect(firstPrint(state, "take suit")).toMatch(/already/i);
  });

  it("take other item → nothing here", () => {
    expect(firstPrint(base(), "take beacon")).toMatch(/nothing/i);
  });

  it("open locker without suit → gives suit", () => {
    const fx = handle(base(), parse("open locker"));
    expect(fx.find((e) => e.type === "ADD_TO_INVENTORY")).toBeDefined();
  });

  it("open red locker without suit → gives suit", () => {
    const fx = handle(base(), parse("open red locker"));
    expect(fx.find((e) => e.type === "ADD_TO_INVENTORY")).toBeDefined();
  });

  it("open with no noun → opens locker", () => {
    const fx = handle(base(), parse("open"));
    expect(fx.find((e) => e.type === "ADD_TO_INVENTORY")).toBeDefined();
  });

  it("open suit (synonymn) → gives suit", () => {
    const fx = handle(base(), parse("open suit"));
    expect(fx.find((e) => e.type === "ADD_TO_INVENTORY")).toBeDefined();
  });

  it("open locker when suit already held", () => {
    const state = { ...base(), inventory: [ITEMS.pressure_suit] };
    expect(firstPrint(state, "open locker")).toMatch(/already open/i);
  });

  it("open unknown target → falls through to fallback", () => {
    expect(firstPrint(base(), "open beacon")).toMatch(/can't do that/i);
  });

  it("move west → corridor", () => {
    const fx = handle(base(), parse("west"));
    const loc = fx.find((e) => e.type === "SET_LOCATION");
    expect(loc && "location" in loc ? loc.location : "").toBe("corridor");
  });

  it("move south → corridor", () => {
    const fx = handle(base(), parse("south"));
    const loc = fx.find((e) => e.type === "SET_LOCATION");
    expect(loc && "location" in loc ? loc.location : "").toBe("corridor");
  });

  it("move east → blocked", () => {
    expect(firstPrint(base(), "east")).toMatch(/blocked/i);
  });

  it("leave → moves west to corridor", () => {
    const fx = handle(base(), parse("leave"));
    const loc = fx.find((e) => e.type === "SET_LOCATION");
    expect(loc && "location" in loc ? loc.location : "").toBe("corridor");
  });

  it("unknown command fallback", () => {
    expect(firstPrint(base(), "swim")).toMatch(/can't do that/i);
  });
});

// ─── airlock ─────────────────────────────────────────────────────────────────

describe("abyssal-pressure handle — airlock", () => {
  const base = () => makeState({ location: "airlock" });

  it("look room without suit warns about suit", () => {
    expect(allPrints(base(), "look").join(" ")).toMatch(/pressure suit/i);
  });

  it("look room with suit shows ready", () => {
    const state = { ...base(), inventory: [ITEMS.pressure_suit] };
    expect(allPrints(state, "look").join(" ")).toMatch(/LAUNCH/);
  });

  it("look window", () => {
    expect(firstPrint(base(), "look window")).toMatch(/darkness|dark/i);
  });

  it("look port", () => {
    expect(firstPrint(base(), "look port")).toMatch(/darkness|dark/i);
  });

  it("look porthole", () => {
    expect(firstPrint(base(), "look porthole")).toMatch(/darkness|dark/i);
  });

  it("look pod", () => {
    expect(firstPrint(base(), "look pod")).toMatch(/escape pod/i);
  });

  it("look escape pod", () => {
    expect(firstPrint(base(), "look escape pod")).toMatch(/escape pod/i);
  });

  it("look unknown noun falls through to fallback", () => {
    expect(firstPrint(base(), "look chair")).toMatch(/pod is waiting/i);
  });

  it("launch without suit → crush ending", () => {
    const fx = handle(base(), parse("launch pod"));
    const end = fx.find((e) => e.type === "END_GAME");
    expect(end && "ending" in end ? end.ending : "").toBe("crush");
  });

  it("launch with suit + beacon → escape ending with beacon text", () => {
    const state = {
      ...base(),
      inventory: [ITEMS.pressure_suit, ITEMS.emergency_beacon],
    };
    const fx = handle(state, parse("launch pod"));
    const end = fx.find((e) => e.type === "END_GAME");
    expect(end && "ending" in end ? end.ending : "").toBe("escape");
    const texts = fx
      .filter((e) => e.type === "PRINT")
      .map((e) => ("text" in e ? e.text : ""));
    expect(texts.join(" ")).toMatch(/beacon/i);
  });

  it("launch with suit but no beacon → escape ending without beacon text", () => {
    const state = { ...base(), inventory: [ITEMS.pressure_suit] };
    const fx = handle(state, parse("launch"));
    const end = fx.find((e) => e.type === "END_GAME");
    expect(end && "ending" in end ? end.ending : "").toBe("escape");
    const texts = fx
      .filter((e) => e.type === "PRINT")
      .map((e) => ("text" in e ? e.text : ""));
    expect(texts.join(" ")).not.toMatch(/activate the emergency beacon/i);
  });

  it("activate pod → launches", () => {
    const state = { ...base(), inventory: [ITEMS.pressure_suit] };
    expect(effectTypes(state, "activate pod")).toContain("END_GAME");
  });

  it("enter pod → launches", () => {
    const state = { ...base(), inventory: [ITEMS.pressure_suit] };
    expect(effectTypes(state, "enter pod")).toContain("END_GAME");
  });

  it("launch non-pod target falls through to fallback", () => {
    expect(firstPrint(base(), "launch beacon")).toMatch(/pod is waiting/i);
  });

  it("move south → corridor", () => {
    const fx = handle(base(), parse("south"));
    const loc = fx.find((e) => e.type === "SET_LOCATION");
    expect(loc && "location" in loc ? loc.location : "").toBe("corridor");
  });

  it("move north → blocked", () => {
    expect(firstPrint(base(), "north")).toMatch(/blocked/i);
  });

  it("unknown command fallback", () => {
    expect(firstPrint(base(), "swim")).toMatch(/pod is waiting/i);
  });
});

// ─── unknown location ─────────────────────────────────────────────────────────

describe("abyssal-pressure handle — unknown location", () => {
  it("returns increment + fallback print", () => {
    const fx = handle(makeState({ location: "void" }), parse("look"));
    expect(fx[0].type).toBe("INCREMENT_TURNS");
    expect(fx.some((e) => e.type === "PRINT")).toBe(true);
  });
});
