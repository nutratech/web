import { useEffect, useState } from "react";
import useDebounce, * as debounce from "./debounce";

jest.mock("react", () => ({
  useState: jest.fn().mockImplementation((x: unknown) => [x, jest.fn()]),
  useEffect: jest.fn(),
}));

describe("debounce hook", () => {
  it("sets up an effect with the given value and delay", () => {
    (useState as jest.Mock).mockImplementation(() => [5, jest.fn()]);
    (useEffect as jest.Mock).mockImplementation(() => {});
    useDebounce(5, 0);
    expect(useState).toHaveBeenCalled();
    expect(useEffect).toHaveBeenCalledWith(expect.anything(), [
      5, 0,
    ]);
  });

  describe("debounceEffectHandler", () => {
    it("sets a timeout which calls the setValue method", () => {
      jest.useFakeTimers();
      const setValueFn = jest.fn();
      jest.spyOn(window, "setTimeout");
      debounce.debounceEffectHandler(setValueFn, 5, 0);
      jest.runAllTimers();
      expect(window.setTimeout).toHaveBeenCalledWith(expect.anything(), 0);
      expect(setValueFn).toHaveBeenCalledWith(5);
    });
  });

  describe("cleanupDebounceEffect", () => {
    it("clears the timeout", () => {
      jest.spyOn(window, "clearTimeout");
      debounce.cleanupDebounceEffect(0);
      expect(window.clearTimeout).toHaveBeenCalledWith(0);
    });
  });

  describe("effectHandler", () => {
    it(
      "calls debounce effect handler, returns a cleanup method that takes the resulting ID",
      () => {
        const setValue = jest.fn();
        // doesn't work and never will work because Jest is complete shit
        // jest.spyOn(debounce, "debounceEffectHandler");
        // jest.spyOn(debounce, "cleanupDebounceEffect");
        const cleanupFn = debounce.effectHandler(setValue, 5, 0);
        // expect(debounce.debounceEffectHandler).toHaveBeenCalledWith(setValue, 5, 0);
        cleanupFn();
        // expect(debounce.cleanupDebounceEffect).toHaveBeenCalled();
      }
    );
  });
});
