import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter
import App from "./App";
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.render(
  <BrowserRouter> {/* Wrap App with BrowserRouter */}
    <App />
  </BrowserRouter>,
  document.getElementById("root")
);
