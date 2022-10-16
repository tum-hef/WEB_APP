import * as React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import HomePage from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import { PrivateRoute } from "./utils";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import Groups from "../pages/Groups";
import { StyledEngineProvider } from "@mui/styled-engine-sc";

import Servers from "../pages/Servers";
import { NOTFOUND } from "../pages/404";
import { RotatingLines } from "react-loader-spinner";
import { Grid } from "@material-ui/core";

import Devices from "../pages/Devices";
import Datastreams from "../pages/Datastream";
import Observervation from "../pages/Observation";
import Location from "../pages/Location";
import Store from "../pages/Store";
import useTheme from "../hooks/useTheme";
import { ThemeProvider } from "styled-components/macro";

import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import createTheme from "../hooks/createTheme";
import LandingPage from "../pages/LandingPage";
const styles = {
  container: {
    height: "100%",
    width: "100%",
    fontFamily: "Helvetica",
    margin: "0px",
    padding: "0px",
  },
};

const AppRouter = (props: any) => {
  const { initialized } = useKeycloak();
  const { classes } = props;
  const { theme } = useTheme();

  if (!initialized) {
    return (
      // ADD GRID CENTER
      <Grid container justify="center" alignItems="center">
        <RotatingLines
          strokeColor="grey"
          strokeWidth="5"
          animationDuration="0.75"
          width="96"
          visible={true}
        />
      </Grid>
    );
  }

  return (
    <StyledEngineProvider injectFirst>
      <MuiThemeProvider theme={createTheme(theme)}>
        <ThemeProvider theme={createTheme(theme)}>
          <div className={classes.container}>
            <Router>
              <Switch>
                <Route exact path="/" component={HomePage} />
                <PrivateRoute exact path="/dashboard" component={LandingPage} />
                <PrivateRoute exact path="/projects" component={Servers} />
                <PrivateRoute exact path="/groups" component={Groups} />
                <PrivateRoute exact path="/devices" component={Devices} />
                <PrivateRoute exact path="/devices/store" component={Store} />
                <PrivateRoute
                  exact
                  path="/datastreams/:id"
                  component={Datastreams}
                />
                <PrivateRoute
                  exact
                  path="/observation/:id"
                  component={Observervation}
                />{" "}
                <PrivateRoute exact path="/location/:id" component={Location} />
                <Route path="*" component={NOTFOUND} />
              </Switch>
            </Router>
          </div>
        </ThemeProvider>
      </MuiThemeProvider>
    </StyledEngineProvider>
  );
};

AppRouter.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AppRouter);
