import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { store } from "./redux/store.js";
import "./index.css";
import { VideoCallProvider } from "./components/chat/VideoCallContext.jsx";
import eruda from "er";

eruda.init();
ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <Provider store={store}>
    <VideoCallProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </VideoCallProvider>
  </Provider>,
  // </React.StrictMode>,
);
