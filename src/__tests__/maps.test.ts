import { describe, expect, it } from "vitest";
import { MAPS, renderMapTokens } from "../stories/lost-in-woods/maps";

describe("renderMapTokens", () => {
  it("escapes < and >", () => {
    expect(renderMapTokens("a < b > c")).toBe("a &lt; b &gt; c");
  });

  it("replaces {P} with player span", () => {
    expect(renderMapTokens("{P}")).toBe('<span class="player">@</span>');
  });

  it("replaces {K} with note span K", () => {
    expect(renderMapTokens("{K}")).toBe('<span class="note">K</span>');
  });

  it("replaces {N} with note span N", () => {
    expect(renderMapTokens("{N}")).toBe('<span class="note">N</span>');
  });

  it("replaces {N:text} with note span", () => {
    expect(renderMapTokens("{N:o   o}")).toBe(
      '<span class="note">o   o</span>',
    );
  });

  it("replaces {LBL:text} with label span", () => {
    expect(renderMapTokens("{LBL:LIVING ROOM}")).toBe(
      '<span class="label">LIVING ROOM</span>',
    );
  });

  it("replaces {D:text} with dim span", () => {
    expect(renderMapTokens("{D:you}")).toBe('<span class="dim">you</span>');
  });

  it("replaces {F:text} with faint span", () => {
    expect(renderMapTokens("{F:.}")).toBe('<span class="faint">.</span>');
  });

  it("passes through unmatched text unchanged", () => {
    expect(renderMapTokens("hello world")).toBe("hello world");
  });

  it("handles multiple tokens in one string", () => {
    const result = renderMapTokens("{P} {D:you}");
    expect(result).toContain('<span class="player">@</span>');
    expect(result).toContain('<span class="dim">you</span>');
  });
});

describe("MAPS", () => {
  it("has tent map", () => {
    expect(MAPS.tent).toBeDefined();
    expect(typeof MAPS.tent).toBe("string");
  });

  it("has forest map", () => {
    expect(MAPS.forest).toBeDefined();
  });

  it("has road map", () => {
    expect(MAPS.road).toBeDefined();
  });

  it("has ending_presence map", () => {
    expect(MAPS.ending_presence).toBeDefined();
  });

  it("tent map shows flashlight", () => {
    expect(MAPS.tent).toMatch(/flashlight/i);
  });

  it("road map shows car", () => {
    expect(MAPS.road).toMatch(/car/i);
  });
});
