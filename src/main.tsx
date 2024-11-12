import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { RecoilRoot } from "recoil";

import { ChainlitAPI, ChainlitContext } from '@chainlit/react-client';

const VITE_CHAINLIT_SERVER = import.meta.env.VITE_CHAINLIT_SERVER;
const apiClient = new ChainlitAPI(VITE_CHAINLIT_SERVER, "webapp");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChainlitContext.Provider value={apiClient}>
      <RecoilRoot>
        <App />
      </RecoilRoot>
    </ChainlitContext.Provider>
  </React.StrictMode>
);
