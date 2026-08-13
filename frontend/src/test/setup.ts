import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

vi.stubGlobal("matchMedia", (query: string): MediaQueryList => ({
  matches: false,
  media: query,
  onchange: null,

  addListener: () => {},
  removeListener: () => {},

  addEventListener: () => {},
  removeEventListener: () => {},

  dispatchEvent: () => false,
}));

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
  vi.useRealTimers();
});
