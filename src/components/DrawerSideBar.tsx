import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import GridViewIcon from "@mui/icons-material/GridView";
import LinkCustom from "./LinkCustom";

import AccountTreeIcon from "@mui/icons-material/AccountTree";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import { useKeycloak } from "@react-keycloak/web";

export const DrawerSideBar = () => {
  const { keycloak } = useKeycloak();

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.clear();
    keycloak.logout({ redirectUri: window.location.origin }).then(() => {
      console.log("Logout successful");
    }).catch(err => console.error("Logout failed", err));
  };
  return (
    <div>
      <Toolbar />
      <Box alignContent={"center"} textAlign={"center"} mt={-5} mb={2}></Box>

      <Divider />
      <List>
        <LinkCustom to="/dashboard">
          <ListItem key={"Dashboard"} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <GridViewIcon />
              </ListItemIcon>
              <ListItemText primary={"Dashboard"} />
            </ListItemButton>
          </ListItem>
        </LinkCustom>
        <LinkCustom to="/projects">
          <ListItem key={"Data Space"} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <AccountTreeIcon />
              </ListItemIcon>
              <ListItemText primary={"Data Space"} />
            </ListItemButton>
          </ListItem>
        </LinkCustom>
        <LinkCustom to="/notifications">
          <ListItem key={"Notifications"} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <NotificationsIcon />
              </ListItemIcon>
              <ListItemText primary={"Notifications"} />
            </ListItemButton>
          </ListItem>
        </LinkCustom>{" "}
        <LinkCustom to="/reports">
          <ListItem key={"Reports"} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <TextSnippetIcon />
              </ListItemIcon>
              <ListItemText primary={"Reports"} />
            </ListItemButton>
          </ListItem>
        </LinkCustom>{" "}
        <LinkCustom to="/database">
          <ListItem key={"Database "} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <TextSnippetIcon />
              </ListItemIcon>
              <ListItemText primary={"Database"} />
            </ListItemButton>
          </ListItem>
        </LinkCustom>{" "}
        <ListItem key={"Logout"} disablePadding onClick={handleLogout}>
          <ListItemButton>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary={"Logout"} />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );
};
