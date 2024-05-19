import React from "react";
import "./App.module.scss";
import { Home } from "./pages/Home";
import { Main } from "./pages/Main";

export const App = () => {
  return (
    <div className="App">
      {/* <Home /> */}
      <Main />
    </div>
  );
};
