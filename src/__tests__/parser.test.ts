import { describe, expect, it } from "vitest";
import { parse } from "../stories/lost-in-woods/parser";

describe("parse", () => {
  it("returns null verb on empty input", () => {
    expect(parse("")).toEqual({ verb: null, noun: null, raw: "" });
  });

  it("returns null verb on filler-only input", () => {
    const result = parse("the a an");
    expect(result.verb).toBeNull();
  });

  it("maps bare direction to move+noun", () => {
    expect(parse("n")).toEqual({ verb: "move", noun: "north", raw: "n" });
    expect(parse("north")).toEqual({
      verb: "move",
      noun: "north",
      raw: "north",
    });
    expect(parse("s")).toEqual({ verb: "move", noun: "south", raw: "s" });
    expect(parse("e")).toEqual({ verb: "move", noun: "east", raw: "e" });
    expect(parse("w")).toEqual({ verb: "move", noun: "west", raw: "w" });
  });

  it("strips fillers and normalises verb", () => {
    expect(parse("go to the north")).toEqual({
      verb: "move",
      noun: "north",
      raw: "go to the north",
    });
    expect(parse("get the keys")).toEqual({
      verb: "take",
      noun: "keys",
      raw: "get the keys",
    });
  });

  it("normalises verb aliases", () => {
    expect(parse("l").verb).toBe("look");
    expect(parse("x door").verb).toBe("look");
    expect(parse("inv").verb).toBe("inv");
    expect(parse("i").verb).toBe("inv");
    expect(parse("z").verb).toBe("wait");
  });

  it("preserves noun as-is when not a direction", () => {
    expect(parse("take keys")).toEqual({
      verb: "take",
      noun: "keys",
      raw: "take keys",
    });
    expect(parse("open door")).toEqual({
      verb: "open",
      noun: "door",
      raw: "open door",
    });
  });

  it("normalises noun directions", () => {
    expect(parse("go north")).toEqual({
      verb: "move",
      noun: "north",
      raw: "go north",
    });
  });

  it("normalises direction alias in noun position", () => {
    expect(parse("look n")).toEqual({
      verb: "look",
      noun: "north",
      raw: "look n",
    });
  });

  it("handles look with noun", () => {
    const result = parse("look fridge");
    expect(result.verb).toBe("look");
    expect(result.noun).toBe("fridge");
  });

  it("handles restart aliases", () => {
    expect(parse("restart").verb).toBe("restart");
    expect(parse("reset").verb).toBe("restart");
  });

  it("handles help aliases", () => {
    expect(parse("help").verb).toBe("help");
    expect(parse("?").verb).toBe("help");
  });
});
