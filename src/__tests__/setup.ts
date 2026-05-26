import "@testing-library/jest-dom";

globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

Object.defineProperty(globalThis, "location", {
  value: { reload: vi.fn() },
  writable: true,
});
