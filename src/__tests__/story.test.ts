import { describe, expect, it } from "vitest";
import { lostInWoodsStory } from "../stories/lost-in-woods/index";

describe("lostInWoodsStory", () => {
  it("initialState returns correct defaults", () => {
    const state = lostInWoodsStory.initialState();
    expect(state.location).toBe("tent");
    expect(state.inventory).toEqual([]);
    expect(state.flags).toEqual({});
    expect(state.turns).toBe(0);
    expect(state.ended).toBeNull();
  });

  it("initialState returns fresh object each call", () => {
    const a = lostInWoodsStory.initialState();
    const b = lostInWoodsStory.initialState();
    a.inventory.push("test");
    expect(b.inventory).toHaveLength(0);
  });

  it("getIntro returns non-empty effects", () => {
    const effects = lostInWoodsStory.getIntro();
    expect(effects.length).toBeGreaterThan(0);
  });

  it("getIntro first effect is PRINT with title", () => {
    const effects = lostInWoodsStory.getIntro();
    const first = effects[0];
    expect(first.type).toBe("PRINT");
    if (first.type === "PRINT") {
      expect(first.text).toMatch(/LOST IN THE WOODS/i);
    }
  });

  it("getMap returns html string for tent", () => {
    const state = lostInWoodsStory.initialState();
    const html = lostInWoodsStory.getMap(state);
    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(0);
  });

  it("getMap returns presence map when ended=presence", () => {
    const state = { ...lostInWoodsStory.initialState(), ended: "presence" };
    const html = lostInWoodsStory.getMap(state);
    expect(html).toMatch(/P\s+R\s+E\s+S\s+E\s+N\s+C\s+E/i);
  });

  it("getMap returns empty string for unknown location", () => {
    const state = { ...lostInWoodsStory.initialState(), location: "nowhere" };
    const html = lostInWoodsStory.getMap(state);
    expect(html).toBe("");
  });

  it("has correct id and title", () => {
    expect(lostInWoodsStory.id).toBe("lost-in-woods");
    expect(lostInWoodsStory.title).toBe("LOST IN THE WOODS");
  });

  it("getMapItems returns flashlight when in tent without it", () => {
    const state = lostInWoodsStory.initialState();
    expect(lostInWoodsStory.getMapItems!(state)).toEqual(["flashlight"]);
  });

  it("getMapItems returns empty once flashlight is taken", () => {
    const state = {
      ...lostInWoodsStory.initialState(),
      inventory: ["flashlight"],
    };
    expect(lostInWoodsStory.getMapItems!(state)).toEqual([]);
  });

  it("has paths with the happy-path sequence", () => {
    expect(lostInWoodsStory.paths).toBeDefined();
    expect(Array.isArray(lostInWoodsStory.paths)).toBe(true);
    expect(lostInWoodsStory.paths!.length).toBeGreaterThanOrEqual(1);
    const firstPath = lostInWoodsStory.paths![0];
    expect(firstPath).toContain("take flashlight");
    expect(firstPath).toContain("leave");
  });
});
