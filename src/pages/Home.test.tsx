import React from "react";
import { unmountComponentAtNode, render } from "react-dom";
import { act } from "react-dom/test-utils";
import Home from "./Home";

jest.mock("react-router", () => ({
  useNavigate: (): (() => void) => jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/init-declarations
let container: HTMLDivElement;

beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
});

describe("Home", () => {
  it("renders", () => {
    act(() => {
      render(<Home />, container);
    });
    const banner = document.getElementById("hero-banner");
    expect(banner).not.toBeNull();
  });
});
