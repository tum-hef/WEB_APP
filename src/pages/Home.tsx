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
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        {/* Left Part */}
        <Grid
          item
          xs={12}
          sm={6}
          md={6}
          sx={{
            display: "flex", 
            backgroundColor: "#003359",
            backgroundImage:
              "linear-gradient(to left, transparent 100%, #003359 50%), url(/images/design_element.png)",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center", 
            backgroundSize: { xs: "cover", sm: "contain" }, 
          }}
        >
          <Grid
            container
            direction="column"
            alignItems="center"
            justifyContent="center"
            sx={{ height: "100%" }}
          >
            <Typography
              component="h1"
              variant="h5"
              sx={{
                color: "white",
                fontWeight: "bold",
                fontSize: { xs: "20px", md: "30px" }, 
                textAlign: "center",
                mt: 3,
              }}
            >
              HEF sensorHUB
            </Typography>
          </Grid>
        </Grid>

        {/* Right Part */}
        <Grid
          item
          xs={12}
          sm={6}
          md={6}
          component={Paper}
          elevation={6}
          square
          sx={{ backgroundColor: "#003359", borderLeft: "1px solid #003359" }}
        >
         <Grid container justifyContent="center" spacing={2}>
  <Grid item xs={12} sm={6}>
    <Button
      fullWidth
      variant="contained"
      onClick={login}
      sx={{
        mt: { xs: 2, sm: 3 },  // Adjust margin for mobile
        mb: { xs: 1, sm: 2 },
        backgroundColor: "white",
        color: "#003359",
        fontWeight: "bold",
        fontSize: { xs: "18px", sm: "26px" }, // Responsive font size
        textTransform: "none",
      }}
    >
      Log in
    </Button>
  </Grid>
  <Grid item xs={12} sm={6}>
    <Link to={"/register"} style={{ textDecoration: "none", width: "100%" }}>
      <Button
        fullWidth
        variant="contained"
        sx={{
          mt: { xs: 2, sm: 3 },  // Adjust margin for mobile
          mb: { xs: 1, sm: 2 },
          backgroundColor: "white",
          color: "#003359",
          fontWeight: "bold",
          fontSize: { xs: "18px", sm: "26px" }, // Responsive font size
          textTransform: "none",
        }}
      >
        Register
      </Button>
    </Link>
  </Grid>
</Grid>
        </Grid>

        {/* Footer */}
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
          <Grid container justifyContent="center">
            <Grid item>
              <Typography
                component="h1"
                variant="h6"
                sx={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: { xs: "15px", sm: "17px" },
                }}
              >
                HEF Hans Eisenmann-Forum für Agrarwissenschaften
              </Typography>
            </Grid>

            <Grid item>
              <img
                src="/images/tum_logo.png"
                alt="logo"
                style={{
                  width: "80px",
                  height: "40px",
                  marginTop: "20px",
                  marginRight: "40px",
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default HomePage;
