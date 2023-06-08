import { useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import HomePage from "../pages/Home";
import { PrivateRoute } from "./utils";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import Groups from "../pages/Groups";
import { StyledEngineProvider } from "@mui/styled-engine-sc";
import { create } from "jss";
import DataSpace from "../pages/DataSpace";
import { NOTFOUND } from "../pages/404";
import { RotatingLines } from "react-loader-spinner";
import { Grid } from "@material-ui/core";
import axios from "axios";
import Devices from "../pages/devices/ListDevices";
import Datastreams from "../pages/Datastream";
import Observervation from "../pages/Observation";
import Location from "../pages/Location";
import useTheme from "../hooks/useTheme";
import { ThemeProvider } from "styled-components/macro";
import StylesProvider from "@mui/styles/StylesProvider";
import jssPreset from "@mui/styles/jssPreset";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import createTheme from "../hooks/createTheme";
import DashboardPage from "../pages/DashboardPage";
import Impressum from "../pages/impressum";
import Register from "../pages/Register";
import StepperStore from "../pages/Stepper";
import ListClients from "../pages/ListClients";
import { toast } from "react-toastify";
import StoreDevice from "../pages/devices/StoreDevice";
import ListSensors from "../pages/sensors/ListSensors";
import StoreSensor from "../pages/sensors/StoreSensor";
import ListLocations from "../pages/location/ListLocation";
import ListDatastream from "../pages/datastreams/ListDatastream";
import ListObservationProperty from "../pages/observation_property/ListObservationProperty";
import StoreObservationProerties from "../pages/observation_property/StoreObservationProerties";
const styles = {
  container: {
    height: "100%",
    width: "100%",
    fontFamily: "Helvetica",
    margin: "0px",
    padding: "0px",
  },
};
// @ts-ignore
const jss = create({
  ...jssPreset(),
  insertionPoint: document.getElementById("jss-insertion-point")!,
});

const AppRouter = (props: any) => {
  const { initialized, keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const { classes } = props;
  const { theme } = useTheme();
  useEffect(() => {
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
              localStorage.removeItem("group_id");
              toast.error("Group not found");
            }
          }
        } catch (error) {
          localStorage.removeItem("group_id");
        }
      }
    };

    fetchData();
  }, []);

  if (!initialized) {
    return (
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
    // @ts-ignore */}
    <StylesProvider jss={jss}>
      <StyledEngineProvider injectFirst>
        <MuiThemeProvider theme={createTheme(theme)}>
          <ThemeProvider theme={createTheme(theme)}>
            <div className={classes.container}>
              <Router>
                <Switch>
                  <Route exact path="/" component={HomePage} />
                  <Route exact path="/register" component={Register} />
                  <Route exact path="/impressum" component={Impressum} />
                  <PrivateRoute
                    exact
                    path="/dashboard"
                    component={ListClients}
                  />
                  <PrivateRoute
                    exact
                    path="/dashboard/:group_id"
                    component={DashboardPage}
                  />
                  <PrivateRoute
                    exact
                    path="/data-spaces/:group_id"
                    component={DataSpace}
                  />
                  <PrivateRoute
                    exact
                    path="/stepper"
                    component={StepperStore}
                  />
                  <PrivateRoute exact path="/groups" component={Groups} />
                  {/* Devices */}
                  <PrivateRoute exact path="/devices" component={Devices} />
                  <PrivateRoute
                    exact
                    path="/devices/store"
                    component={StoreDevice}
                  />{" "}
                  {/* Location */}
                  <PrivateRoute
                    exact
                    path="/locations"
                    component={ListLocations}
                  />
                  {/* Sensors */}
                  <PrivateRoute exact path="/sensors" component={ListSensors} />
                  <PrivateRoute
                    exact
                    path="/sensors/store"
                    component={StoreSensor}
                  />
                  {/* Observation Properties */}
                  <PrivateRoute
                    exact
                    path="/observation_properties"
                    component={ListObservationProperty}
                  />{" "}
                  <PrivateRoute
                    exact
                    path="/observation_properties/store"
                    component={StoreObservationProerties}
                  />
                  {/* data streams */}
                  <PrivateRoute
                    exact
                    path="/datastreams"
                    component={ListDatastream}
                  />
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
                  <PrivateRoute
                    exact
                    path="/location/:id"
                    component={Location}
                  />
                  <Route path="*" component={NOTFOUND} />
                </Switch>
              </Router>
            </div>
          </ThemeProvider>
        </MuiThemeProvider>
      </StyledEngineProvider>
    </StylesProvider>
  );
};

AppRouter.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AppRouter);
