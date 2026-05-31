import "@testing-library/jest-dom";
import { vi } from "vitest";

globalThis.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

Object.defineProperty(globalThis, "location", {
  value: { reload: vi.fn() },
  writable: true,
});
