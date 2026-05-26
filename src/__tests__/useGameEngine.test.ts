import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GameEffect, GameState } from "../engine/types";
import { useGameEngine } from "../hooks/useGameEngine";
import type { ParsedCommand, Story } from "../stories/types";

const { pushLineMock, typeLineMock, clearLinesMock } = vi.hoisted(() => ({
  pushLineMock: vi.fn(),
  typeLineMock: vi.fn((): Promise<void> => Promise.resolve()),
  clearLinesMock: vi.fn(),
}));

vi.mock("../hooks/useTypewriter", () => ({
  useTypewriter: () => ({
    lines: [],
    pushLine: pushLineMock,
    typeLine: typeLineMock,
    clearLines: clearLinesMock,
  }),
}));

function makeStory(overrides: Partial<Story> = {}): Story {
  return {
    id: "test",
    title: "Test",
    initialState: (): GameState => ({
      location: "start",
      inventory: [],
      flags: {},
      turns: 0,
      ended: null,
    }),
    getIntro: (): GameEffect[] => [{ type: "PRINT", text: "Welcome" }],
    getMap: () => "",
    parse: (raw: string): ParsedCommand => ({
      verb: raw.trim() || null,
      noun: null,
      raw,
    }),
    handle: (_state, cmd): GameEffect[] => [
      { type: "PRINT", text: `ok: ${cmd.verb}` },
    ],
    ...overrides,
  };
}

async function mountIdle(story: Story) {
  const utils = renderHook(() => useGameEngine(story));
  await waitFor(() => expect(utils.result.current.busy).toBe(false));
  return utils;
}

describe("useGameEngine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    typeLineMock.mockResolvedValue(undefined);
  });

  it("initializes state from story.initialState", async () => {
    const { result } = await mountIdle(makeStory());
    expect(result.current.state.location).toBe("start");
    expect(result.current.state.inventory).toEqual([]);
  });

  it("runs intro on mount", async () => {
    await mountIdle(makeStory());
    expect(typeLineMock).toHaveBeenCalledWith("Welcome", undefined);
  });

  it("submit calls story.handle", async () => {
    const handle = vi.fn((): GameEffect[] => []);
    const { result } = await mountIdle(makeStory({ handle }));
    await act(async () => {
      await result.current.submit("look");
    });
    expect(handle).toHaveBeenCalled();
  });

  it("submit pushes command to output", async () => {
    const { result } = await mountIdle(makeStory());
    await act(async () => {
      await result.current.submit("look");
    });
    expect(pushLineMock).toHaveBeenCalledWith("look", "cmd");
  });

  it("submit ignores empty input", async () => {
    const handle = vi.fn((): GameEffect[] => []);
    const { result } = await mountIdle(makeStory({ handle }));
    await act(async () => {
      await result.current.submit("   ");
    });
    expect(handle).not.toHaveBeenCalled();
  });

  it("submit ignores when game ended", async () => {
    const handle = vi.fn((): GameEffect[] => []);
    const story = makeStory({
      handle,
      initialState: () => ({
        location: "start",
        inventory: [],
        flags: {},
        turns: 0,
        ended: "win",
      }),
    });
    const { result } = await mountIdle(story);
    await act(async () => {
      await result.current.submit("look");
    });
    expect(handle).not.toHaveBeenCalled();
  });

  it("unknown verb prints error without calling handle", async () => {
    const handle = vi.fn((): GameEffect[] => []);
    const story = makeStory({
      handle,
      parse: (): ParsedCommand => ({ verb: null, noun: null, raw: "???" }),
    });
    const { result } = await mountIdle(story);
    await act(async () => {
      await result.current.submit("???");
    });
    expect(handle).not.toHaveBeenCalled();
    expect(typeLineMock).toHaveBeenCalledWith(
      expect.stringContaining("don't understand"),
      "bad",
    );
  });

  it("SET_LOCATION effect updates state", async () => {
    const story = makeStory({
      handle: (): GameEffect[] => [
        { type: "SET_LOCATION", location: "forest" },
      ],
    });
    const { result } = await mountIdle(story);
    await act(async () => {
      await result.current.submit("go");
    });
    expect(result.current.state.location).toBe("forest");
  });

  it("SET_FLAG effect updates state", async () => {
    const story = makeStory({
      handle: (): GameEffect[] => [
        { type: "SET_FLAG", key: "opened", value: true },
      ],
    });
    const { result } = await mountIdle(story);
    await act(async () => {
      await result.current.submit("open");
    });
    expect(result.current.state.flags.opened).toBe(true);
  });

  it("ADD_TO_INVENTORY effect updates state", async () => {
    const keyItem = { name: "key", description: "" };
    const story = makeStory({
      handle: (): GameEffect[] => [{ type: "ADD_TO_INVENTORY", item: keyItem }],
    });
    const { result } = await mountIdle(story);
    await act(async () => {
      await result.current.submit("take");
    });
    expect(result.current.state.inventory.map((i) => i.name)).toContain("key");
  });

  it("REMOVE_FROM_INVENTORY effect updates state", async () => {
    const keyItem = { name: "key", description: "" };
    const story = makeStory({
      initialState: () => ({
        location: "start",
        inventory: [keyItem],
        flags: {},
        turns: 0,
        ended: null,
      }),
      handle: (): GameEffect[] => [
        { type: "REMOVE_FROM_INVENTORY", item: keyItem },
      ],
    });
    const { result } = await mountIdle(story);
    await act(async () => {
      await result.current.submit("drop");
    });
    expect(result.current.state.inventory.map((i) => i.name)).not.toContain(
      "key",
    );
  });

  it("INCREMENT_TURNS effect updates state", async () => {
    const story = makeStory({
      handle: (): GameEffect[] => [{ type: "INCREMENT_TURNS" }],
    });
    const { result } = await mountIdle(story);
    await act(async () => {
      await result.current.submit("wait");
    });
    expect(result.current.state.turns).toBe(1);
  });

  it("END_GAME effect updates state", async () => {
    const story = makeStory({
      handle: (): GameEffect[] => [{ type: "END_GAME", ending: "win" }],
    });
    const { result } = await mountIdle(story);
    await act(async () => {
      await result.current.submit("finish");
    });
    expect(result.current.state.ended).toBe("win");
  });

  it("historyPrev returns empty with no history", async () => {
    const { result } = await mountIdle(makeStory());
    expect(result.current.historyPrev()).toBe("");
  });

  it("historyNext returns empty with no history", async () => {
    const { result } = await mountIdle(makeStory());
    expect(result.current.historyNext()).toBe("");
  });

  it("historyPrev navigates backwards through submitted commands", async () => {
    const { result } = await mountIdle(makeStory());

    await act(async () => {
      await result.current.submit("look");
    });
    await act(async () => {
      await result.current.submit("north");
    });

    expect(result.current.historyPrev()).toBe("north");
    expect(result.current.historyPrev()).toBe("look");
  });

  it("historyNext navigates forward after going back", async () => {
    const { result } = await mountIdle(makeStory());

    await act(async () => {
      await result.current.submit("look");
    });
    await act(async () => {
      await result.current.submit("north");
    });

    result.current.historyPrev();
    result.current.historyPrev();
    expect(result.current.historyNext()).toBe("north");
  });

  it("historyNext returns empty string when navigated past end", async () => {
    const { result } = await mountIdle(makeStory());

    await act(async () => {
      await result.current.submit("look");
    });

    result.current.historyPrev();
    expect(result.current.historyNext()).toBe("");
  });

  it("DELAY effect resolves after specified ms", async () => {
    const story = makeStory({
      handle: (): GameEffect[] => [{ type: "DELAY", ms: 0 }],
    });
    const { result } = await mountIdle(story);

    await act(async () => {
      await result.current.submit("go");
    });

    expect(result.current.busy).toBe(false);
  });

  it("RELOAD effect completes without error", async () => {
    const story = makeStory({
      handle: (): GameEffect[] => [{ type: "RELOAD" }],
    });
    const { result } = await mountIdle(story);

    await act(async () => {
      await result.current.submit("go");
    });

    expect(result.current.busy).toBe(false);
  });

  it("reset restores initial state and re-runs intro", async () => {
    const story = makeStory({
      handle: (): GameEffect[] => [{ type: "SET_LOCATION", location: "far" }],
    });
    const { result } = await mountIdle(story);

    await act(async () => {
      await result.current.submit("go");
    });
    expect(result.current.state.location).toBe("far");

    await act(async () => {
      await result.current.reset();
    });

    expect(result.current.state.location).toBe("start");
    expect(clearLinesMock).toHaveBeenCalled();
  });
});
