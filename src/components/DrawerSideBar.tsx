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
import StorageIcon from "@mui/icons-material/Storage";
import GroupIcon from "@mui/icons-material/Group";
import LogoutIcon from "@mui/icons-material/Logout";
export const DrawerSideBar = (
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
      <LinkCustom to="/servers">
        <ListItem key={"Server"} disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <StorageIcon />
            </ListItemIcon>
            <ListItemText primary={"Server"} />
          </ListItemButton>
        </ListItem>
      </LinkCustom>
      <LinkCustom to="/groups">
        <ListItem key={"Group"} disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <GroupIcon />
            </ListItemIcon>
            <ListItemText primary={"Group"} />
          </ListItemButton>
        </ListItem>
      </LinkCustom>
      <a
        href="http://localhost:8080/realms/keycloak-react-auth/protocol/openid-connect/logout"
        style={{
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <ListItem key={"Logout"} disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary={"Logout"} />
          </ListItemButton>
        </ListItem>
      </a>
    </List>
  </div>
);
