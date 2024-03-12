import { useCallback, useEffect } from "react";
import { Link, Redirect, useLocation } from "react-router-dom";
import Button from "@mui/material/Button";
import { useKeycloak } from "@react-keycloak/web";
import {
  Box,
  CssBaseline,
  Grid,
  Paper,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";
import ReactGA from "react-ga4";
import { GAactionsDashboard } from "../utils/GA";

const HomePage = () => {
  useEffect(() => {
    ReactGA.event({
      category: GAactionsDashboard.category,
      action: GAactionsDashboard.action,
      label: GAactionsDashboard.label,
    });
  }, []);
  const location = useLocation<{ [key: string]: unknown }>();
  const currentLocationState = location.state || {
    from: { pathname: "/dashboard" },
  };

  const { keycloak } = useKeycloak();

  const login = useCallback(() => {
    keycloak?.login();
  }, [keycloak]);

  if (keycloak?.authenticated) {
    console.log("Logged out");
    return <Redirect to={currentLocationState?.from as string} />;
  }
  const theme = createTheme();

  return (
    <ThemeProvider theme={theme}>
      <Grid
        container
        component="main"
        sx={{
          height: "100vh",
          border: "none",
        }}
      >
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={3}
          md={6}
          sx={{
            backgroundColor: "#003359",
            backgroundImage:
              "linear-gradient(to left, transparent 100%, #003359 50%), url(/images/design_element.png)",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "220% center",
            backgroundSize: "130% auto",
            border: "none",
            height: "100%",
            position: "relative",
          }}
        />
        <Grid
          item
          xs={12}
          sm={8}
          md={6}
          component={Paper}
          elevation={6}
          square
          style={{
            backgroundColor: "#003359",
            borderLeft: "1px solid #003359",
          }}
        >
          <Grid
            container
            justifyContent="flex-end"
            style={{
              textAlign: "right",
              paddingRight: "20px",
              paddingTop: "20px",
            }}
          >
            <Grid item>
              <Typography
                component="h1"
                variant="h6"
                style={{
                  alignSelf: "flex-end",
                  alignContent: "flex-end",
                  alignItems: "flex-end",
                  color: "white",
                  marginTop: "15px",
                  marginRight: "20px",
                  fontWeight: "bold",
                  fontSize: "30px",
                }}
              >
                HEF
              </Typography>{" "}
              <Typography
                component="h1"
                variant="h6"
                style={{
                  color: "white",
                  marginRight: "20px",
                  marginTop: "-10px",
                }}
              >
                Hans Eisenmann-Forum
              </Typography>{" "}
              <Typography
                component="h1"
                variant="h6"
                style={{
                  color: "white",
                  marginRight: "20px",
                  marginTop: "-10px",
                }}
              >
                für Agrarwissenschaften
              </Typography>
            </Grid>{" "}
            <Grid item>
              <img
                src="/images/tum_logo.png"
                alt="logo"
                style={{
                  width: "150px",
                  height: "80px",
                  marginTop: "20px",
                  marginRight: "20px",
                }}
              />
            </Grid>
          </Grid>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "50px",
              marginBottom: "-90px",
            }}
          >
            <Typography
              component="h1"
              variant="h5"
              style={{
                alignSelf: "flex-end",
                alignContent: "flex-end",
                alignItems: "flex-end",
                color: "white",
                marginTop: "15px",
                marginRight: "20px",
                fontWeight: "bold",
                fontSize: "30px",
              }}
            >
              SensorHUB
            </Typography>
          </Box>

          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "0px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Grid
                item
                sx={{
                  display: { xs: "none", sm: "block" },
                }}
              >
                <img
                  src="/images/light_blue_line.png"
                  alt="logo"
                  style={{
                    maxWidth: "150px",
                    maxHeight: "400px",
                    marginRight: "300px",
                  }}
                />
              </Grid>
              <Grid item>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, ml: -10 }}
                  onClick={login}
                  style={{
                    maxWidth: "100px",
                    maxHeight: "100px",
                    minWidth: "150px",
                    minHeight: "50px",
                    backgroundColor: "white",
                    color: "#003359",
                    fontWeight: "bold",
                    fontSize: "26px",
                    textTransform: "none",
                  }}
                >
                  Log in
                </Button>
              </Grid>

              <Grid item>
                <Link to={"/register"} style={{ textDecoration: "none" }}>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2, ml: 2, mr: 2 }}
                    style={{
                      maxWidth: "100px",
                      maxHeight: "100px",
                      minWidth: "150px",
                      minHeight: "50px",
                      backgroundColor: "white",
                      color: "#003359",
                      fontWeight: "bold",
                      fontSize: "26px",
                      textTransform: "none",
                    }}
                  >
                    Register
                  </Button>
                </Link>
              </Grid>
            </Box>
          </Box>
          {/* <Box
            sx={{ mt: -2, mb: 0 }}
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              marginRight: "20px",
              padding: "10px",
              marginTop: "-80px",
            }}
          >
            <img
              src="/images/hef_circle.png"
              alt="logo"
              style={{ width: "150px", height: "150px" }}
            />
          </Box> */}
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default HomePage;
