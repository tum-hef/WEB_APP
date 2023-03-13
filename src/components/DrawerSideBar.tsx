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
    keycloak.logout();
  };
  return (
    <div>
      <Toolbar />
      <Box
        alignContent={"center"}
        textAlign={"center"}
        // remove margin top
        mt={-5}
        mb={2}
      >
        <Typography variant="h6" noWrap>
          Parid
        </Typography>
      </Box>

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
          <ListItem key={"Projects"} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <AccountTreeIcon />
              </ListItemIcon>
              <ListItemText primary={"Projects"} />
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
        <LinkCustom to="/trainings">
          <ListItem key={"Trainings "} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <TextSnippetIcon />
              </ListItemIcon>
              <ListItemText primary={"Trainings"} />
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
