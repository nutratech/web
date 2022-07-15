import React from "react";
import { unmountComponentAtNode, render } from "react-dom";
import { act } from "react-dom/test-utils";
import BodyFatCalculator from "./BodyFatCalculator";

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

describe("BodyFatCalculator", () => {
  it("renders", () => {
    act(() => {
      render(<BodyFatCalculator />, container);
    });
    const calculator = document.getElementById("body-fat-calculator");
    expect(calculator).not.toBeNull();
  });
});
