import * as React from "react";
import ReactDOM from "react-dom";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import AppRouter from "./routes/index";
import keycloak from "./keycloak";
import { Provider } from 'react-redux';
import { store } from './store/store';
import GroupInitializer from "./components/GroupIntializer";

const eventLogger = (event: unknown, error: unknown) => {
  console.log("onKeycloakEvent", event, error);
};

const tokenLogger = (tokens: unknown) => {
  console.log("onKeycloakTokens", tokens);
};
 console.log("process.env.REACT_APP_BACKEND_URL",process.env)
ReactDOM.render(
  <React.StrictMode> 
     <Provider store={store}>
    <ReactKeycloakProvider
      authClient={keycloak}
      onEvent={eventLogger}
      onTokens={tokenLogger}
    >
      <div
        style={{ margin: "0px", padding: "0px", width: "100%", height: "100%" }}
      > 
         <GroupInitializer />
        <AppRouter />
      </div>
    </ReactKeycloakProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
