import React, { useEffect, useState } from "react";
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
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import "../vendor/perfect-scrollbar.css";
import { useKeycloak } from "@react-keycloak/web";
import axios from "axios";
import { Link } from "react-router-dom";

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
  const [nodeRedPort, setNodeRedPort] = useState<number | null>(null);
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;

  const getNodeRedPort = async () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL;
    const email = userInfo?.preferred_username;
    await axios
      .get(`${backend_url}/node-red?email=${email}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.status === 200 && res.data.PORT) {
          setNodeRedPort(res.data.PORT);
        }
      });
  };

  useEffect(() => {
    getNodeRedPort();
  }, [nodeRedPort]);

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
            <ListItem key={"Landing Page"} disablePadding>
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
                  primary={"Landing Page"}
                />
              </ListItemButton>
            </ListItem>
          </LinkCustom>
          <LinkCustom to="/data-spaces">
            <ListItem key={"Data Space"} disablePadding>
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
                  primary={"Data Space"}
                />
              </ListItemButton>
            </ListItem>
          </LinkCustom>{" "}
          {nodeRedPort && process.env.REACT_APP_BACKEND_URL_ROOT && (
            <a
              href={`${process.env.REACT_APP_BACKEND_URL_ROOT}:${nodeRedPort}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: "none",
              }}
            >
              <ListItemButton>
                <ListItemIcon>
                  <WorkspacesIcon
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
                  primary={"Node Red"}
                />
              </ListItemButton>
            </a>
          )}
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
