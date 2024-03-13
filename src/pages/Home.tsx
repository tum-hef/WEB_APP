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
import Footer from "../components/Footer";

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
        {/* Left Part */}
        <Grid item xs={false} sm={3} md={6}>
          <Grid
            container
            direction="row"
            alignItems="center"
            sx={{
              height: "100%",
            }}
            style={{
              backgroundColor: "#003359",
            }}
          >
            <Grid
              item
              md={6}
              sx={{
                display: "flex",
                justifyContent: "center", // Center the content horizontally
                backgroundColor: "#003359",
                backgroundImage:
                  "linear-gradient(to left, transparent 100%, #003359 50%), url(/images/design_element.png)",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "50% center",
                backgroundSize: "90% auto",
                border: "none",
                height: "100%",
              }}
            />
            <Grid
              item
              md={6}
              sx={{ backgroundColor: "#003359", border: "none" }}
            >
              <Typography
                component="h1"
                variant="h5"
                style={{
                  color: "white",
                  marginTop: "20px",
                  marginRight: "20px",
                  fontWeight: "bold",
                  fontSize: "30px",
                  textAlign: "center",
                  backgroundColor: "#003359",
                  marginLeft: "-30px",
                }}
              >
                HEF sensorHUB
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        {/* Right Part */}
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
            direction="row"
            alignItems="center"
            sx={{
              height: "100%",
            }}
            style={{
              backgroundColor: "#003359",
            }}
          >
            <Grid item md={6}>
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
                    marginRight: "580px",
                  }}
                />
              </Grid>{" "}
            </Grid>{" "}
            <Grid item md={6}>
              {/* <Grid container justifyContent="flex-end">
                <Grid item>
                  <Typography
                    component="h1"
                    variant="h6"
                    style={{
                      color: "white",
                      marginRight: "20px",
                      marginTop: "15px",
                      fontWeight: "bold",
                      fontSize: "30px",
                      marginLeft: "-50px",
                    }}
                  >
                    HEF
                  </Typography>
                  <Typography
                    component="h1"
                    variant="h6"
                    style={{
                      color: "white",
                      marginRight: "20px",
                      marginTop: "-10px",
                      marginLeft: "-50px",
                    }}
                  >
                    Hans Eisenmann-Forum
                  </Typography>
                  <Typography
                    component="h1"
                    variant="h6"
                    style={{
                      color: "white",
                      marginRight: "20px",
                      marginTop: "-10px",
                      marginLeft: "-50px",
                    }}
                  >
                    für Agrarwissenschaften
                  </Typography>
                </Grid>

                <Grid item>
                  <img
                    src="/images/tum_logo.png"
                    alt="logo"
                    style={{
                      width: "150px",
                      height: "80px",
                      marginTop: "20px",
                      marginRight: "40px",
                    }}
                  />
                </Grid>
              </Grid> */}
              <Box
                sx={{
                  my: 8,
                  mx: 4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginBottom: "70px",
                  marginLeft: "-230px",
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
                  {/* Buttons */}
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
            </Grid>{" "}
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            backgroundColor: "#003359",
            textAlign: "center",
            padding: "20px 0",
            position: "absolute",
            bottom: 0,
            width: "100%",
          }}
        >
          <Grid
            container
            justifyContent="center" // Center the content horizontally
          >
            <Grid item>
              <Typography
                component="h1"
                variant="h6"
                style={{
                  color: "white",
                  marginRight: "20px",
                  marginTop: "15px",
                  fontWeight: "bold",
                  fontSize: "17px",
                  marginLeft: "-50px",
                }}
              >
                HEF
              </Typography>
              <Typography
                component="h1"
                variant="h6"
                style={{
                  color: "white",
                  marginRight: "20px",
                  marginTop: "-10px",
                  fontSize: "17px",
                  marginLeft: "-50px",
                }}
              >
                Hans Eisenmann-Forum
              </Typography>
              <Typography
                style={{
                  color: "white",
                  marginRight: "20px",
                  marginTop: "-10px",
                  marginLeft: "-50px",
                  fontSize: "17px",
                }}
              >
                für Agrarwissenschaften
              </Typography>
            </Grid>

            <Grid item>
              <img
                src="/images/tum_logo.png"
                alt="logo"
                style={{
                  width: "100px",
                  height: "50px",
                  marginTop: "20px",
                  marginRight: "40px",
                }}
              />
            </Grid>
          </Grid>{" "}
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default HomePage;
