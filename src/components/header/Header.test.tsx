import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import Header from "./Header";

jest.mock("react-router", () => ({
  useNavigate: (): (() => void) => () => {},
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

describe("Header", () => {
  it("renders", () => {
    act(() => {
      render(<Header />, container);
    });
    const homeLogo = document.getElementById("nav-home-logo");
    expect(homeLogo?.textContent).toEqual("Nutra, LLC.");
  });
});
