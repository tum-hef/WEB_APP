import { useCallback, useEffect } from "react";
import { Link, Redirect, useLocation } from "react-router-dom";
import Button from "@mui/material/Button";
import { useKeycloak } from "@react-keycloak/web";
import {
  Box,
  CssBaseline,
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
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Main Content */}
        <Box
          sx={{
            display: "flex",
            flex: 1,
          }}
        >
          {/* Left Part */}
          <Box
            sx={{
              flex: 1,
              backgroundColor: "#003359",
              backgroundImage:
                "linear-gradient(to left, transparent 100%, #003359 50%), url(/images/design_element.png)",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center center",
              backgroundSize: "cover",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
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
            </Box>
          </Box>

          {/* Center Divider (Vertical Line) */}
          <Box
            sx={{
              width: "2px", // Adjust this value to increase/decrease the line width
              backgroundColor: "black", // Line color
            }}
          />

          {/* Right Part */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#003359",
              padding: { xs: 2, sm: 4 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                width: "100%",
                maxWidth: "500px",
                gap: 2,
              }}
            >
              <Button
                fullWidth
                variant="contained"
                onClick={login}
                sx={{
                  backgroundColor: "white",
                  color: "#003359",
                  fontWeight: "bold",
                  fontSize: { xs: "18px", sm: "26px" },
                  textTransform: "none",
                }}
              >
                Log in
              </Button>
              <Link
                to={"/register"}
                style={{ textDecoration: "none", width: "100%" }}
              >
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    backgroundColor: "white",
                    color: "#003359",
                    fontWeight: "bold",
                    fontSize: { xs: "18px", sm: "26px" },
                    textTransform: "none",
                  }}
                >
                  Register
                </Button>
              </Link>
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            width: "100%",
            backgroundColor: "#003359",
            textAlign: "center",
            padding: 1,
            color: "white",
          }}
        >
          <Footer />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default HomePage;
