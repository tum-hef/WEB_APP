import * as React from "react";
import ReactDOM from "react-dom";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import AppRouter from "./routes/index";
import keycloak from "./keycloak";

const eventLogger = (event: unknown, error: unknown) => {
  console.log("onKeycloakEvent", event, error);
};

const tokenLogger = (tokens: unknown) => {
  console.log("onKeycloakTokens", tokens);
};

ReactDOM.render(
  <React.StrictMode>
    <ReactKeycloakProvider
      authClient={keycloak}
      onEvent={eventLogger}
      onTokens={tokenLogger}
    >
      <div
        style={{ margin: "0px", padding: "0px", width: "100%", height: "100%" }}
      >
        <AppRouter />
      </div>
    </ReactKeycloakProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
