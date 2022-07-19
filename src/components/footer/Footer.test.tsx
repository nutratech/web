import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import Footer from "./Footer";

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

describe("Footer", () => {
  it("renders", () => {
    act(() => {
      render(<Footer />, container);
    });
    expect(container.getElementsByTagName("footer")[0].textContent).toEqual("© 2022 - Nutra, LLC.");
  });
});
