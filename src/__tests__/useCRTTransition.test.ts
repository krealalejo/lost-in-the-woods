import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockTimeline = {
  set: vi.fn(),
  to: vi.fn(),
  call: vi.fn(),
};
mockTimeline.set.mockReturnValue(mockTimeline);
mockTimeline.to.mockReturnValue(mockTimeline);
mockTimeline.call.mockReturnValue(mockTimeline);

vi.mock("gsap", () => ({
  gsap: {
    killTweensOf: vi.fn(),
    timeline: vi.fn(() => mockTimeline),
  },
}));

import { gsap } from "gsap";
import { useCRTTransition } from "../hooks/useCRTTransition";

describe("useCRTTransition", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTimeline.set.mockReturnValue(mockTimeline);
    mockTimeline.to.mockReturnValue(mockTimeline);
    mockTimeline.call.mockReturnValue(mockTimeline);
  });

  it("returns startTransition, backdropRef, lineRef", () => {
    const { result } = renderHook(() => useCRTTransition());
    expect(typeof result.current.startTransition).toBe("function");
    expect(result.current.backdropRef).toBeDefined();
    expect(result.current.lineRef).toBeDefined();
  });

  it("calls onSwitch immediately when refs are null", () => {
    const { result } = renderHook(() => useCRTTransition());
    const onSwitch = vi.fn();
    result.current.startTransition(onSwitch);
    expect(onSwitch).toHaveBeenCalledTimes(1);
  });

  it("does not call gsap when refs are null", () => {
    const { result } = renderHook(() => useCRTTransition());
    result.current.startTransition(vi.fn());
    expect(gsap.killTweensOf).not.toHaveBeenCalled();
    expect(gsap.timeline).not.toHaveBeenCalled();
  });

  it("runs gsap timeline when both refs are attached", () => {
    const { result } = renderHook(() => useCRTTransition());

    const backdrop = document.createElement("div");
    const line = document.createElement("div");
    (
      result.current.backdropRef as React.MutableRefObject<HTMLDivElement>
    ).current = backdrop;
    (result.current.lineRef as React.MutableRefObject<HTMLDivElement>).current =
      line;

    const onSwitch = vi.fn();
    result.current.startTransition(onSwitch);

    expect(gsap.killTweensOf).toHaveBeenCalledWith([backdrop, line]);
    expect(gsap.timeline).toHaveBeenCalled();
    expect(mockTimeline.call).toHaveBeenCalledWith(onSwitch);
  });
});
