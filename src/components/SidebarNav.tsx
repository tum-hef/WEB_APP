import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components/macro";
import ReactPerfectScrollbar from "react-perfect-scrollbar";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import DisplaySettingsIcon from "@mui/icons-material/DisplaySettings";
import { SidebarItemsType } from "../types/sidebar";
import {
  Collapse,
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
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import "../vendor/perfect-scrollbar.css";
import { useKeycloak } from "@react-keycloak/web";
import axios from "axios";
import { useLocation } from "react-router-dom";

import { ExpandLess, ExpandMore } from "@mui/icons-material";
import SchoolIcon from "@mui/icons-material/School";
import TabletAndroidIcon from "@mui/icons-material/TabletAndroid";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import BiotechSharpIcon from "@mui/icons-material/BiotechSharp";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import DnsIcon from "@mui/icons-material/Dns";
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
  const [group_id, setGroup_id] = useState<string | null>(null);
  const userInfo = keycloak?.idTokenParsed;
  const location = useLocation();
  const currentUrl = location.pathname;
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
  const [openDataSpace, setOpenDataSpace] = useState(false);
  const [openTraining, setOpenTraining] = useState(false);
  const [openFrostEntities, setOpenFrostEntities] = useState(false);
  const handleDataSpace = () => {
    setOpenDataSpace(!openDataSpace);
    setOpenFrostEntities(false);
  };
  const handleTraining = () => {
    setOpenTraining(!openTraining);
  };

  const handleFrostEntities = () => {
    setOpenFrostEntities(!openFrostEntities);
  };

  useEffect(() => {
    const group_id = localStorage.getItem("group_id");
    setGroup_id(group_id);
    getNodeRedPort();
  }, [nodeRedPort]);

  const handleLogout = () => {
    localStorage.removeItem("group_id");
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
          <LinkCustom
            to={
              currentUrl === "/dashboard"
                ? "/dashboard"
                : `/dashboard/${group_id}`
            }
          >
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
          <ListItemButton
            onClick={handleDataSpace}
            disabled={currentUrl === "/dashboard"}
          >
            <ListItemIcon>
              <AccountTreeIcon
                style={{
                  color: "white",
                }}
              />
            </ListItemIcon>
            <ListItemText
              primary="Data Space"
              style={{
                color: "white",
              }}
              primaryTypographyProps={{ fontSize: "18px" }}
            />
            {openDataSpace ? (
              <ExpandLess
                style={{
                  color: "white",
                }}
              />
            ) : (
              <ExpandMore
                style={{
                  color: "white",
                }}
              />
            )}
          </ListItemButton>
          <Collapse in={openDataSpace} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {group_id && (
                <LinkCustom to={`/data-spaces/${group_id}`}>
                  <ListItem key={"Data Entry"} disablePadding>
                    <ListItemButton>
                      <ListItemIcon>
                        <DisplaySettingsIcon
                          style={{
                            color: "white",
                            marginLeft: "20px",
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        style={{
                          color: "white",
                        }}
                        primaryTypographyProps={{ fontSize: "18px" }}
                        primary={"Data Entry"}
                      />
                    </ListItemButton>
                  </ListItem>
                </LinkCustom>
              )}

              <ListItemButton onClick={handleFrostEntities}>
                <ListItemIcon>
                  <MenuOutlinedIcon
                    style={{
                      color: "white",
                      marginLeft: "20px",
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Data Items"
                  style={{
                    color: "white",
                  }}
                  primaryTypographyProps={{ fontSize: "18px" }}
                />
                {openFrostEntities ? (
                  <ExpandLess
                    style={{
                      color: "white",
                    }}
                  />
                ) : (
                  <ExpandMore
                    style={{
                      color: "white",
                    }}
                  />
                )}
              </ListItemButton>
            </List>
          </Collapse>{" "}
          <Collapse in={openFrostEntities} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <LinkCustom to="/devices">
                <ListItemButton sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <TabletAndroidIcon
                      style={{
                        color: "white",
                        marginLeft: "40px",
                        marginRight: "10px",
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Devices"
                    style={{
                      color: "white",
                    }}
                    primaryTypographyProps={{ fontSize: "18px" }}
                  />
                </ListItemButton>
              </LinkCustom>
            </List>{" "}
            <List component="div" disablePadding>
              <LinkCustom to="/sensors">
                <ListItemButton sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <DeviceThermostatIcon
                      style={{
                        color: "white",
                        marginLeft: "40px",
                        marginRight: "10px",
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Sensor Types"
                    style={{
                      color: "white",
                    }}
                    primaryTypographyProps={{ fontSize: "18px" }}
                  />
                </ListItemButton>
              </LinkCustom>
            </List>{" "}
            <List component="div" disablePadding>
              <LinkCustom to="/observation_properties">
                <ListItemButton sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <PersonSearchIcon
                      style={{
                        color: "white",
                        marginLeft: "40px",
                        marginRight: "10px",
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Measurement property"
                    style={{
                      color: "white",
                    }}
                    primaryTypographyProps={{ fontSize: "18px" }}
                  />
                </ListItemButton>
              </LinkCustom>
            </List>{" "}
            <List component="div" disablePadding>
              <LinkCustom to="/datastreams">
                <ListItemButton sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <FolderSpecialIcon
                      style={{
                        color: "white",
                        marginLeft: "40px",
                        marginRight: "10px",
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Datastreams"
                    style={{
                      color: "white",
                    }}
                    primaryTypographyProps={{ fontSize: "18px" }}
                  />
                </ListItemButton>
              </LinkCustom>
            </List>{" "}
            <List component="div" disablePadding>
              <LinkCustom to="/locations">
                <ListItemButton sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <LocationOnIcon
                      style={{
                        color: "white",
                        marginLeft: "40px",
                        marginRight: "10px",
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Locations"
                    style={{
                      color: "white",
                    }}
                    primaryTypographyProps={{ fontSize: "18px" }}
                  />
                </ListItemButton>
              </LinkCustom>
            </List>{" "}
            <List component="div" disablePadding>
              <LinkCustom to="/observations">
                <ListItemButton sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <BiotechSharpIcon
                      style={{
                        color: "white",
                        marginLeft: "40px",
                        marginRight: "10px",
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Observations"
                    style={{
                      color: "white",
                    }}
                    primaryTypographyProps={{ fontSize: "18px" }}
                  />
                </ListItemButton>
              </LinkCustom>
            </List>
          </Collapse>
          {nodeRedPort && process.env.REACT_APP_BACKEND_URL_ROOT && (
            <a
              href={`${process.env.REACT_APP_BACKEND_URL_ROOT}:${nodeRedPort}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: "none",
                pointerEvents: currentUrl === "/dashboard" ? "none" : "auto", // Disable pointer events if currentUrl is "/dashboard"
                cursor: currentUrl === "/dashboard" ? "not-allowed" : "pointer", // Change cursor style if currentUrl is "/dashboard"
              }}
              onClick={(e) => {
                if (currentUrl === "/dashboard") {
                  e.preventDefault(); // Prevent redirect if currentUrl is "/dashboard"
                }
              }}
            >
              <ListItemButton disabled={currentUrl === "/dashboard"}>
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
                  primary={"Node RED"}
                />
              </ListItemButton>
            </a>
          )}
          <LinkCustom
            to="/reports"
            onClick={(event) => {
              if (currentUrl === "/dashboard") {
                event.preventDefault(); // Prevent redirect if currentUrl is "/dashboard"
              }
            }}
          >
            <ListItem key={"Reports"} disablePadding>
              <ListItemButton disabled={currentUrl === "/dashboard"}>
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
          </LinkCustom>
          <ListItemButton onClick={handleTraining}>
            <ListItemIcon>
              <SchoolIcon
                style={{
                  color: "white",
                }}
              />
            </ListItemIcon>
            <ListItemText
              primary="Database"
              style={{
                color: "white",
              }}
              primaryTypographyProps={{ fontSize: "18px" }}
            />
            {openTraining ? (
              <ExpandLess
                style={{
                  color: "white",
                }}
              />
            ) : (
              <ExpandMore
                style={{
                  color: "white",
                }}
              />
            )}
          </ListItemButton>
          <Collapse in={openTraining} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <LinkCustom to={`/database/frost`}>
                <ListItem key={"FROST"} disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      <DnsIcon
                        style={{
                          color: "white",
                          marginLeft: "20px",
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      style={{
                        color: "white",
                      }}
                      primaryTypographyProps={{ fontSize: "18px" }}
                      primary={"FROST"}
                    />
                  </ListItemButton>
                </ListItem>
              </LinkCustom>
              <LinkCustom to={`/database/node_red`}>
                <ListItem key={"Node Red"} disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      <DnsIcon
                        style={{
                          color: "white",
                          marginLeft: "20px",
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      style={{
                        color: "white",
                      }}
                      primaryTypographyProps={{ fontSize: "18px" }}
                      primary={"Node RED"}
                    />
                  </ListItemButton>
                </ListItem>
              </LinkCustom>
            </List>
          </Collapse>
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
          </ListItem>{" "}
          <ListItem>
            <ListItemButton
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "20px",
              }}
            >
              <ListItemText
                primaryTypographyProps={{ fontSize: "18px" }}
                style={{
                  color: "white",
                  marginTop: "20px",
                  alignSelf: "center",
                  alignItems: "center",
                  justifyContent: "center",
                  display: "flex",
                }}
                primary={"HEF sensorHUB"}
              />
            </ListItemButton>
          </ListItem>
        </Items>
      </List>
    </ScrollbarComponent>
  );
};

export default SidebarNav;
