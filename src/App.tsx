import React from "react";
import logo from "./logo.svg";
import "./App.scss";

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <img src={logo} className="app-logo" alt="logo" />
        <p>Nutra is the best company ever</p>
        <a className="app-link" href="https://nutra.tk" target="_blank" rel="noopener noreferrer">
          Go to Nutra
        </a>
      </header>
    </div>
  );
}

export default App;
