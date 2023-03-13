import React from "react";
import styled, { css } from "styled-components/macro";
import ReactPerfectScrollbar from "react-perfect-scrollbar";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import { SidebarItemsType } from "../types/sidebar";

import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import GridViewIcon from "@mui/icons-material/GridView";
import LinkCustom from "./LinkCustom";

import AccountTreeIcon from "@mui/icons-material/AccountTree";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import "../vendor/perfect-scrollbar.css";
import { useKeycloak } from "@react-keycloak/web";

const baseScrollbar = css`
  background-color: ${(props) => props.theme.sidebar.background};
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  flex-grow: 1;
`;

const Scrollbar = styled.div`
  ${baseScrollbar}
`;

const PerfectScrollbar = styled(ReactPerfectScrollbar)`
  ${baseScrollbar}
`;

const Items = styled.div`
  padding-top: ${(props) => props.theme.spacing(2.5)};
  padding-bottom: ${(props) => props.theme.spacing(2.5)};
`;

type SidebarNavProps = {
  items: {
    title: string;
    pages: SidebarItemsType[];
  }[];
};

const SidebarNav: React.FC<SidebarNavProps> = ({ items }) => {
  const { keycloak } = useKeycloak();

  const handleLogout = () => {
    keycloak.logout();
  };
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("md"));
  const ScrollbarComponent = (
    matches ? PerfectScrollbar : Scrollbar
  ) as React.ElementType;

  return (
    <ScrollbarComponent>
      <List>
        <Items>
          <LinkCustom to="/dashboard">
            <ListItem key={"Dashboard"} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <GridViewIcon
                    style={{
                      color: "white",
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  style={{
                    color: "white",
                  }}
                  primaryTypographyProps={{ fontSize: "18px" }}
                  primary={"Dashboard"}
                />
              </ListItemButton>
            </ListItem>
          </LinkCustom>
          <LinkCustom to="/projects">
            <ListItem key={"Projects"} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <AccountTreeIcon
                    style={{
                      color: "white",
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{ fontSize: "18px" }}
                  style={{
                    color: "white",
                  }}
                  primary={"Projects"}
                />
              </ListItemButton>
            </ListItem>
          </LinkCustom>
          <LinkCustom to="/notifications">
            <ListItem key={"Notifications"} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <NotificationsIcon
                    style={{
                      color: "white",
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  style={{
                    color: "white",
                  }}
                  primaryTypographyProps={{ fontSize: "18px" }}
                  primary={"Notifications"}
                />
              </ListItemButton>
            </ListItem>
          </LinkCustom>{" "}
          <LinkCustom to="/reports">
            <ListItem key={"Reports"} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <TextSnippetIcon
                    style={{
                      color: "white",
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{ fontSize: "18px" }}
                  style={{
                    color: "white",
                  }}
                  primary={"Reports"}
                />
              </ListItemButton>
            </ListItem>
          </LinkCustom>{" "}
          <LinkCustom to="/trainings">
            <ListItem key={"Trainings "} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <TextSnippetIcon
                    style={{
                      color: "white",
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{ fontSize: "18px" }}
                  primary={"Trainings"}
                  style={{
                    color: "white",
                  }}
                />
              </ListItemButton>
            </ListItem>
          </LinkCustom>{" "}
          <ListItem key={"Logout"} disablePadding onClick={handleLogout}>
            <ListItemButton>
              <ListItemIcon>
                <LogoutIcon
                  style={{
                    color: "white",
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{ fontSize: "18px" }}
                style={{
                  color: "white",
                }}
                primary={"Logout"}
              />
            </ListItemButton>
          </ListItem>
        </Items>
      </List>
    </ScrollbarComponent>
  );
};

export default SidebarNav;
