import * as React from "react";
import {
  Route,
  Redirect,
  RouteComponentProps,
  useHistory,
} from "react-router-dom";
import type { RouteProps } from "react-router-dom";

import { useKeycloak } from "@react-keycloak/web";
import axios from "axios";

interface PrivateRouteParams extends RouteProps {
  component:
    | React.ComponentType<RouteComponentProps<any>>
    | React.ComponentType<any>;
}

export function PrivateRoute({
  component: Component,
  ...rest
}: PrivateRouteParams) {
  const { keycloak } = useKeycloak();
  const history = useHistory();
  React.useEffect(() => {
    const userInfo = keycloak?.idTokenParsed;
    const fetchData = async () => {
      const group_id = localStorage.getItem("group_id");
      if (keycloak && userInfo && userInfo.sub && group_id) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/get_clients?user_id=${userInfo.sub}`
          );

          if (response.status === 200 && response.data.groups) {
            // check if group_id from localstorage is in groups
            const group = response.data.groups.find(
              (group: any) => group.id === group_id
            );
            if (!group) {
              if (history.location.pathname !== "/dashboard") {
                history.push("/dashboard?message=no_group");
              }
            }
          }
        } catch (error) {
          if (history.location.pathname !== "/dashboard") {
            history.push("/dashboard?message=no_group");
          }
        }
      } else {
        if (history.location.pathname !== "/dashboard") {
          history.push("/dashboard?message=no_group");
        }
      }
    };

    fetchData();
  }, [history]);

  return (
    <Route
      {...rest}
      render={(props) =>
        keycloak?.authenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/",
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
}
