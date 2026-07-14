import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

// jsdom does not implement ResizeObserver, but HeroUI components (like ScrollShadow)
// rely on it. We mock it globally here to prevent ReferenceErrors during UI tests.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

afterEach(() => {
  cleanup();
});
