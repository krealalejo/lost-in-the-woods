import "@testing-library/jest-dom";
import { vi } from "vitest";

globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

Object.defineProperty(globalThis, "location", {
  value: { reload: vi.fn() },
  writable: true,
});
