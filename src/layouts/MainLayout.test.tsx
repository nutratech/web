import React from "react";
import { unmountComponentAtNode, render } from "react-dom";
import { act } from "react-dom/test-utils";
import MainLayout from "./MainLayout";

// TODO: mock Header component so we don't need this
jest.mock("react-router", () => ({
  useNavigate: (): (() => void) => jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  Outlet: (): JSX.Element => <></>,
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

describe("MainLayout", () => {
  it("renders", () => {
    act(() => {
      render(<MainLayout />, container);
    });
    const app = document.getElementById("app");
    expect(app).not.toBeNull();
  });
});
