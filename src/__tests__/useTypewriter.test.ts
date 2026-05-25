import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTypewriter } from "../hooks/useTypewriter";

vi.mock("gsap", () => ({
  gsap: {
    to: vi.fn(
      (
        target: { i: number },
        opts: { i: number; onUpdate?: () => void; onComplete?: () => void },
      ) => {
        target.i = opts.i;
        opts.onUpdate?.();
        opts.onComplete?.();
      },
    ),
    killTweensOf: vi.fn(),
  },
}));

describe("useTypewriter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with empty lines", () => {
    const { result } = renderHook(() => useTypewriter());
    expect(result.current.lines).toEqual([]);
  });

  it("pushLine adds a non-typing line", () => {
    const { result } = renderHook(() => useTypewriter());
    act(() => {
      result.current.pushLine("hello", "cmd");
    });
    expect(result.current.lines).toHaveLength(1);
    expect(result.current.lines[0].text).toBe("hello");
    expect(result.current.lines[0].cls).toBe("cmd");
    expect(result.current.lines[0].typing).toBe(false);
  });

  it("pushLine without cls leaves cls undefined", () => {
    const { result } = renderHook(() => useTypewriter());
    act(() => {
      result.current.pushLine("hi");
    });
    expect(result.current.lines[0].cls).toBeUndefined();
  });

  it("clearLines removes all lines", () => {
    const { result } = renderHook(() => useTypewriter());
    act(() => {
      result.current.pushLine("a");
      result.current.pushLine("b");
    });
    act(() => {
      result.current.clearLines();
    });
    expect(result.current.lines).toHaveLength(0);
  });

  it("typeLine with text resolves and sets line after timeout", async () => {
    const { result } = renderHook(() => useTypewriter());
    let done = false;

    act(() => {
      result.current.typeLine("hello world").then(() => {
        done = true;
      });
    });

    expect(done).toBe(false);

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(done).toBe(true);
    expect(result.current.lines).toHaveLength(1);
    expect(result.current.lines[0].text).toBe("hello world");
    expect(result.current.lines[0].typing).toBe(false);
  });

  it("typeLine with empty text resolves after 120ms", async () => {
    const { result } = renderHook(() => useTypewriter());
    let done = false;

    act(() => {
      result.current.typeLine("").then(() => {
        done = true;
      });
    });

    await act(async () => {
      vi.advanceTimersByTime(120);
    });

    expect(done).toBe(true);
    expect(result.current.lines[0].typing).toBe(false);
  });

  it("assigns incrementing ids", () => {
    const { result } = renderHook(() => useTypewriter());
    act(() => {
      result.current.pushLine("a");
      result.current.pushLine("b");
    });
    expect(result.current.lines[0].id).toBe(0);
    expect(result.current.lines[1].id).toBe(1);
  });
});
