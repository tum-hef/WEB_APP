import React, {  useState } from "react";
import styled from "styled-components/macro";
import { Box, CssBaseline, Paper as MuiPaper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { spacing } from "@mui/system";
import { useLocation } from "react-router-dom";

import GlobalStyle from "./GlobalStyle";
import dashboardItems from "./dashboardItems";
import Sidebar from "./Sidebar";
import Navbar from "./navbar/Navbar";
import Footer from "./Footer";
import "react-toastify/dist/ReactToastify.css";
import { useKeycloak } from "@react-keycloak/web";

const drawerWidth = 258;

const Root = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Drawer = styled.div`
  ${(props) => props.theme.breakpoints.up("md")} {
    width: ${drawerWidth}px;
    flex-shrink: 0;
  }
`;

const AppContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 100%;
`;

const Paper = styled(MuiPaper)(spacing);

const MainContent = styled(Paper)`
  flex: 1;
  background: ${(props) => props.theme.palette.background.default};

  @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
    flex: none;
  }

  .MuiPaper-root .MuiPaper-root {
    box-shadow: none;
  }
`;

const DashboardComponent: React.FC = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation(); // Get the current route
  const isImpressumRoute = location.pathname === "/impressum";
  const documentationRoute = location.pathname == "/database/web_app"
  const { keycloak } = useKeycloak();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const theme = useTheme();
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
  const hideSidebar = !keycloak?.authenticated && (isImpressumRoute || documentationRoute);
  // useEffect(()=>{
  //  console.log("keycloak?.authenticated",keycloak?.authenticated)
  // },[keycloak])


  return (
    <Root>
      <CssBaseline />
      <GlobalStyle />
      {!hideSidebar   && ( // Conditionally render the sidebar
        <Drawer>
          <Box sx={{ display: { xs: "block", lg: "none" } }}>
            <Sidebar
              PaperProps={{ style: { width: drawerWidth } }}
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              items={dashboardItems}
            />
          </Box>
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Sidebar
              PaperProps={{ style: { width: drawerWidth } }}
              items={dashboardItems}
            />
          </Box>
        </Drawer>
      )}
      <AppContent>
        <Navbar onDrawerToggle={handleDrawerToggle} />
        <MainContent
          p={isLgUp ? 12 : 5}
          style={{
            backgroundColor: "#F7F9FC",
          }}
        >
          {children}
        </MainContent>
        <Footer />
      </AppContent>
    </Root>
  );
};

export default DashboardComponent;
function useEffect(arg0: () => void, arg1: import("keycloak-js").default[]) {
  throw new Error("Function not implemented.");
}

