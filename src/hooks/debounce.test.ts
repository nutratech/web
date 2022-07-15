import { useEffect, useState } from "react";
import useDebounce, { cleanupDebounceEffect, debounceEffectHandler } from "./debounce";

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
      debounceEffectHandler(setValueFn, 5, 0);
      jest.runAllTimers();
      expect(window.setTimeout).toHaveBeenCalledWith(expect.anything(), 0);
      expect(setValueFn).toHaveBeenCalledWith(5);
    });
  });

  describe("cleanupDebounceEffect", () => {
    it("clears the timeout", () => {
      jest.spyOn(window, "clearTimeout");
      cleanupDebounceEffect(0);
      expect(window.clearTimeout).toHaveBeenCalledWith(0);
    });
  });
});
