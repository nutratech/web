import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../App";

test("renders learn react link", () => {
  render(<App />);
  const linkElement = screen.getByText(/Nutra is the best company ever/i);
  expect(linkElement).toBeInTheDocument();
});
