import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { Curtains } from "react-curtains";

ReactDOM.render(
  <React.StrictMode>
    <Curtains pixelRatio={Math.min(1.5, window.devicePixelRatio)}>
      <App />
    </Curtains>
  </React.StrictMode>,
  document.getElementById("root")
);
