/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useState } from "react";
import { unmountComponentAtNode, render } from "react-dom";
import { act } from "react-dom/test-utils";
import type BodyFatForm from "../../../models/BodyFatForm";
import BodyFatCalculator from "./BodyFatCalculator";

jest.mock("react", () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const actualReact = jest.requireActual("react") as Record<string, unknown>;
  return {
    ...actualReact,
    useState: jest.fn((x: unknown) => [x, jest.fn()]),
    useEffect: jest.fn(),
  };
});

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
    (useState as jest.Mock).mockImplementation((x: unknown) => [x, jest.fn()]);
    act(() => {
      render(<BodyFatCalculator />, container);
    });
    const calculator = document.getElementById("body-fat-calculator");
    expect(calculator).not.toBeNull();
  });

  describe("input change", () => {
    it("updates the body fat form", () => {
      const mockFormSetState = jest.fn();
      const mockDataSetState = jest.fn();
      (useState as jest.Mock).mockImplementationOnce(
        (x: unknown) => [x, mockFormSetState]
      ).mockImplementationOnce(
        (x: unknown) => [x, mockDataSetState]
      ).mockImplementationOnce(
        (x: unknown) => [x, jest.fn()]
      ).mockImplementationOnce(
        (x: unknown) => [x, jest.fn()]
      );
      act(() => {
        render(<BodyFatCalculator />, container);
        const inputs = container.getElementsByTagName("input");
        const input = inputs.namedItem("age");
        const nativeInputValueSetter
          // eslint-disable-next-line @typescript-eslint/unbound-method
          = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, "25");
        const ev2 = new Event("change", { bubbles: true });
        input!.dispatchEvent(ev2);
      });
      expect(mockFormSetState).toHaveBeenCalledWith({
        age: 25,
      } as BodyFatForm);
    });
  });
});
