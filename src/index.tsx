import "bootstrap/dist/css/bootstrap.min.css";

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";
import Home from "./pages/Home";
import MainLayout from "./layouts/MainLayout";
import BodyFatCalculator from "./pages/calculators/body-fat/BodyFatCalculator";

export default function init(): void {
  const rootEl = document.getElementById("root");
  if (!rootEl) {
    console.error("Failed to attach to root element, could not find the element");
  } else {
    const root = ReactDOM.createRoot(rootEl);
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="/calculators/body-fat" element={<BodyFatCalculator />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </React.StrictMode>
    );

    // If you want to start measuring performance in your app, pass a function
    // to log results (for example: reportWebVitals(console.log))
    // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
    void reportWebVitals();
  }
}

init();
