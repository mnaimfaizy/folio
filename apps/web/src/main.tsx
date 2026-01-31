import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import "./index.css";
import { setupStore } from "./store";

// Create the Redux store
const store = setupStore();

// Render the application
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode data-testid="strict-mode">
    <Provider store={store} data-testid="redux-provider">
      <App data-testid="app" />
    </Provider>
  </React.StrictMode>
);
