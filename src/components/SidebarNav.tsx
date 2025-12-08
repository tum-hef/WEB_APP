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
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import SchoolIcon from "@mui/icons-material/School";
import TabletAndroidIcon from "@mui/icons-material/TabletAndroid";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import BiotechSharpIcon from "@mui/icons-material/BiotechSharp";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DnsIcon from "@mui/icons-material/Dns";
import PublicIcon from "@mui/icons-material/Public";
import { toast } from "react-toastify";
import { useIsOwner } from "../hooks/hooks";
import InsightsIcon from "@mui/icons-material/Insights";
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
interface ApiResponse {
  success: boolean;
  PORT?: number;
  message?: string;
  error_code?: number;
}
const SidebarNav: React.FC<SidebarNavProps> = ({ items }) => {
  const { keycloak } = useKeycloak();
  const [nodeRedPort, setNodeRedPort] = useState<number | null>(null);
  const [grafanaPort, setGrafanaPort] = useState<number | null>(null);
  const [group_id, setGroup_id] = useState<string | null>(null);
  const userInfo = keycloak?.idTokenParsed;
  const location = useLocation();
  const token = keycloak?.token;
  const currentUrl = location.pathname;
  const isOwner = useIsOwner();
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
  const getNodeRedPort = async () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL;
    if (!backend_url) {
      toast.error("Backend URL is missing.");
      return;
    }

    const email: string | null =
      localStorage.getItem("selected_others") === "true"
        ? localStorage.getItem("user_email")
        : userInfo?.preferred_username || "";
    const group_id = localStorage.getItem("group_id");

    if (!email || !group_id) {
      // toast.error("User email and group ID are required.");
      return;
    }

    try {
      const response = await axios.post<ApiResponse>(
        `${backend_url}/node-red`,
        {
          user_email: email,
          group_id: group_id
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Include Keycloak token
          },
          validateStatus: (status) => true,
        }
      );

      if (response.status === 200 && response.data.success) {
        setNodeRedPort(response.data.PORT!);
      } else {
        toast.error(response.data.message || "Failed to fetch Node-RED port.");
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const errorResponse = error.response?.data as ApiResponse;
        toast.error(errorResponse.message || "An error occurred.");
      } else {
        toast.error("An unexpected error occurred.");
      }
      console.error("Error fetching Node-RED port:", error);
    }
  };

  const getGrafanaPort = async () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL;
    if (!backend_url) {
      toast.error("Backend URL is missing.");
      return;
    }
  
    const email: string | null =
      localStorage.getItem("selected_others") === "true"
        ? localStorage.getItem("user_email")
        : userInfo?.preferred_username || "";
    const group_id = localStorage.getItem("group_id");
  
    if (!email || !group_id) {
      // toast.error("User email and group ID are required.");
      return;
    }
  
    try {
      const response = await axios.get<ApiResponse>(
    `${backend_url}/grafana`,
    {
      params: {
        user_email: email,
        group_id: group_id,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ Include Keycloak token
      },
      validateStatus: (status) => true,
    }
  );
  
      console.log("Grafana response:", response);
  
      if (response.status === 200 && response.data.success) {
        setGrafanaPort(response.data.PORT!); // Assuming setGrafanaPort exists
      } else {
        toast.error(response.data.message || "Failed to fetch Grafana port.");
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const errorResponse = error.response?.data as ApiResponse;
        toast.error(errorResponse.message || "An error occurred.");
      } else {
        toast.error("An unexpected error occurred.");
      }
      console.error("Error fetching Grafana port:", error);
    }
  };

 

  const handleFrostEntities = () => {
    setOpenFrostEntities(!openFrostEntities);
  };

  useEffect(() => {
    const frostEntityPaths = [
      "/devices",
      "/sensors",
      "/observation_properties",
      "/datastreams",
      "/locations",
      "/observations"
    ];

    const knowledgePaths = [
      "/database/frost",
      "/database/node_red",
      "/database/web_app"
    ];

    const isFrostEntity = frostEntityPaths.includes(location.pathname);
    const isKnowledgeSection = knowledgePaths.includes(location.pathname);
    const isDataSpace = location.pathname.startsWith("/data-spaces");

    if (isFrostEntity) {
      setOpenDataSpace(true);
      setOpenFrostEntities(true);
      setOpenTraining(false);
    } else if (isKnowledgeSection) {
      setOpenTraining(true);
      setOpenDataSpace(false);
      setOpenFrostEntities(false);
    } else if (isDataSpace) {
      setOpenDataSpace(true);
      setOpenFrostEntities(false);
      setOpenTraining(false);
    } else {
      setOpenDataSpace(false);
      setOpenFrostEntities(false);
      setOpenTraining(false);
    }
  }, [location.pathname]);



  useEffect(() => {
    const fetchDataAndServices = async () => {
        const group_id = localStorage.getItem("group_id");
    setGroup_id(group_id);
   await getNodeRedPort();
   await  getGrafanaPort()

    }

     fetchDataAndServices()
    
  
  }, [nodeRedPort]);

  const handleLogout = () => {
    localStorage.clear();
    keycloak.logout({ redirectUri: window.location.origin }).then(() => {
    }).catch((err:unknown) => console.error("Logout failed", err));
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
              (currentUrl === "/dashboard" ||
                currentUrl === "/contact" ||
                currentUrl === "/database/frost" ||
                currentUrl === "/database/node_red" ||
                currentUrl === "/database/web_app") &&
                !group_id
                ? "/dashboard?message=no_group"
                : `/dashboard/${group_id}`
            }
          >
            <ListItem key={"Landing Page"} disablePadding>
              <ListItemButton selected={location.pathname === `/dashboard/${group_id}`}>
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
            disabled={
              (currentUrl === "/dashboard" ||
                currentUrl === "/contact" ||
                currentUrl === "/database/frost" ||
                currentUrl === "/database/node_red" ||
                currentUrl === "/database/web_app") &&
              !group_id
            }
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
                  <ListItem key={"Quick Entry"} disablePadding>
                    <ListItemButton selected={location.pathname === `/data-spaces/${group_id}`}>
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
                        primary={"Quick Entry"}
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
                <ListItemButton
                  sx={{ pl: 4 }}
                  selected={location.pathname === "/devices"}
                >
                  <ListItemIcon>
                    <TabletAndroidIcon
                      style={{
                        color:
                          location.pathname === "/devices" ? "#90caf9" : "white",
                        marginLeft: "40px",
                        marginRight: "10px",
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Devices"
                    style={{ color: "white" }}
                    primaryTypographyProps={{ fontSize: "18px" }}
                  />
                </ListItemButton>
              </LinkCustom>
              <LinkCustom to="/sensors">
                <ListItemButton
                  sx={{ pl: 4 }}
                  selected={location.pathname === "/sensors"}
                >
                  <ListItemIcon>
                    <DeviceThermostatIcon
                      style={{
                        color:
                          location.pathname === "/sensors" ? "#90caf9" : "white",
                        marginLeft: "40px",
                        marginRight: "10px",
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Sensor Types"
                    style={{ color: "white" }}
                    primaryTypographyProps={{ fontSize: "18px" }}
                  />
                </ListItemButton>
              </LinkCustom>
              <LinkCustom to="/observation_properties">
                <ListItemButton
                  sx={{ pl: 4 }}
                  selected={location.pathname === "/observation_properties"}
                >
                  <ListItemIcon>
                    <PersonSearchIcon
                      style={{
                        color:
                          location.pathname === "/observation_properties"
                            ? "#90caf9"
                            : "white",
                        marginLeft: "40px",
                        marginRight: "10px",
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Measurement property"
                    style={{ color: "white" }}
                    primaryTypographyProps={{ fontSize: "18px" }}
                  />
                </ListItemButton>
              </LinkCustom>
              <LinkCustom to="/datastreams">
                <ListItemButton
                  sx={{ pl: 4 }}
                  selected={location.pathname === "/datastreams"}
                >
                  <ListItemIcon>
                    <FolderSpecialIcon
                      style={{
                        color:
                          location.pathname === "/datastreams" ? "#90caf9" : "white",
                        marginLeft: "40px",
                        marginRight: "10px",
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Datastreams"
                    style={{ color: "white" }}
                    primaryTypographyProps={{ fontSize: "18px" }}
                  />
                </ListItemButton>
              </LinkCustom>
              <LinkCustom to="/locations">
                <ListItemButton
                  sx={{ pl: 4 }}
                  selected={location.pathname === "/locations"}
                >
                  <ListItemIcon>
                    <LocationOnIcon
                      style={{
                        color:
                          location.pathname === "/locations" ? "#90caf9" : "white",
                        marginLeft: "40px",
                        marginRight: "10px",
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Locations"
                    style={{ color: "white" }}
                    primaryTypographyProps={{ fontSize: "18px" }}
                  />
                </ListItemButton>
              </LinkCustom>
              <LinkCustom to="/observations">
                <ListItemButton
                  sx={{ pl: 4 }}
                  selected={location.pathname === "/observations"}
                >
                  <ListItemIcon>
                    <BiotechSharpIcon
                      style={{
                        color:
                          location.pathname === "/observations" ? "#90caf9" : "white",
                        marginLeft: "40px",
                        marginRight: "10px",
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Observations"
                    style={{ color: "white" }}
                    primaryTypographyProps={{ fontSize: "18px" }}
                  />
                </ListItemButton>
              </LinkCustom>
            </List>
          </Collapse>

         {nodeRedPort && process.env.REACT_APP_NODERED_URL && (
  <a
    href={`https://${nodeRedPort}-${process.env.REACT_APP_NODERED_URL}`}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      textDecoration: "none",
      pointerEvents:
        currentUrl === "/dashboard" ||
        currentUrl === "/contact" ||
        currentUrl === "/database/frost" ||
        currentUrl === "/database/node_red" ||
        currentUrl === "/database/web_app" ||
        !isOwner
          ? "none"
          : "auto",
      cursor:
        currentUrl === "/dashboard" ||
        currentUrl === "/contact" ||
        currentUrl === "/database/frost" ||
        currentUrl === "/database/node_red" ||
        currentUrl === "/database/web_app" ||
        !isOwner
          ? "not-allowed"
          : "pointer",
    }}
    onClick={(e) => {
      if (
        currentUrl === "/dashboard" ||
        currentUrl === "/contact" ||
        currentUrl === "/database/frost" ||
        currentUrl === "/database/node_red" ||
        currentUrl === "/database/web_app" ||
        !isOwner
      ) {
        e.preventDefault();
      }
    }}
  >
    <ListItemButton
      disabled={
        (!isOwner ||
          currentUrl === "/dashboard" ||
          currentUrl === "/contact" ||
          currentUrl === "/database/frost" ||
          currentUrl === "/database/node_red" ||
          currentUrl === "/database/web_app") &&
        !group_id
      }
    >
      <ListItemIcon>
        <WorkspacesIcon
          style={{
            color:
              !isOwner ||
              currentUrl === "/dashboard" ||
              currentUrl === "/contact" ||
              currentUrl === "/database/frost" ||
              currentUrl === "/database/node_red" ||
              currentUrl === "/database/web_app"
                ? "gray"
                : "white",
          }}
        />
      </ListItemIcon>
      <ListItemText
        primaryTypographyProps={{ fontSize: "18px" }}
        style={{
          color:
            !isOwner ||
            currentUrl === "/dashboard" ||
            currentUrl === "/contact" ||
            currentUrl === "/database/frost" ||
            currentUrl === "/database/node_red" ||
            currentUrl === "/database/web_app"
              ? "gray"
              : "white",
        }}
        primary={"Node RED"}
      />
    </ListItemButton>
  </a>
)}

{grafanaPort && process.env.REACT_APP_GRAFANA_URL && (
  <a
    href={`https://${grafanaPort}-${process.env.REACT_APP_GRAFANA_URL}`}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      textDecoration: "none",
      pointerEvents:
        currentUrl === "/dashboard" ||
        currentUrl === "/contact" ||
        currentUrl === "/database/frost" ||
        currentUrl === "/database/node_red" ||
        currentUrl === "/database/web_app"
          ? "none"
          : "auto",
      cursor:
        currentUrl === "/dashboard" ||
        currentUrl === "/contact" ||
        currentUrl === "/database/frost" ||
        currentUrl === "/database/node_red" ||
        currentUrl === "/database/web_app"
          ? "not-allowed"
          : "pointer",
    }}
    onClick={(e) => {
      if (
        currentUrl === "/dashboard" ||
        currentUrl === "/contact" ||
        currentUrl === "/database/frost" ||
        currentUrl === "/database/node_red" ||
        currentUrl === "/database/web_app"
      ) {
        e.preventDefault();
      }
    }}
  >
    <ListItemButton
      disabled={
        (currentUrl === "/dashboard" ||
          currentUrl === "/contact" ||
          currentUrl === "/database/frost" ||
          currentUrl === "/database/node_red" ||
          currentUrl === "/database/web_app") &&
        !group_id
      }
    >
      <ListItemIcon>
        <InsightsIcon
          style={{
            color:
              currentUrl === "/dashboard" ||
              currentUrl === "/contact" ||
              currentUrl === "/database/frost" ||
              currentUrl === "/database/node_red" ||
              currentUrl === "/database/web_app"
                ? "gray"
                : "white",
          }}
        />
      </ListItemIcon>
      <ListItemText
        primaryTypographyProps={{ fontSize: "18px" }}
        style={{
          color:
            currentUrl === "/dashboard" ||
            currentUrl === "/contact" ||
            currentUrl === "/database/frost" ||
            currentUrl === "/database/node_red" ||
            currentUrl === "/database/web_app"
              ? "gray"
              : "white",
        }}
        primary={"Grafana"}
      />
    </ListItemButton>
  </a>
)}

<LinkCustom
  to="/log_books"
  onClick={(event) => {
    if (
      (currentUrl === "/dashboard" ||
        currentUrl === "/contact" ||
        currentUrl === "/database/frost" ||
        currentUrl === "/database/node_red" ||
        currentUrl === "/database/web_app") &&
      !group_id
    ) {
      event.preventDefault();
    }
  }}
>
  <ListItem key={"Log Book"} disablePadding>
    <ListItemButton
      selected={location.pathname === "/log_books"}
      disabled={
        (currentUrl === "/dashboard" ||
          currentUrl === "/contact" ||
          currentUrl === "/database/frost" ||
          currentUrl === "/database/node_red" ||
          currentUrl === "/database/web_app") &&
        !group_id
      }
    >
      <ListItemIcon>
        <MenuBookIcon
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
        primary={"Log Book"}
      />
    </ListItemButton>
  </ListItem>
</LinkCustom>



          <LinkCustom
            to="/reports"
            onClick={(event) => {
              if (
                (currentUrl === "/dashboard" ||
                  currentUrl === "/contact" ||
                  currentUrl === "/database/frost" ||
                  currentUrl === "/database/node_red" ||
                  currentUrl === "/database/web_app") &&
                !group_id
              ) {
                event.preventDefault();
              }
            }}
          >
            <ListItem key={"Reports"} disablePadding>
              <ListItemButton
                selected={location.pathname === "/reports"}
                disabled={
                  (currentUrl === "/dashboard" ||
                    currentUrl === "/contact" ||
                    currentUrl === "/database/frost" ||
                    currentUrl === "/database/node_red" ||
                    currentUrl === "/database/web_app") &&
                  !group_id
                }
              >
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
          <LinkCustom to="/contact">
            <ListItem key={"Contact"} disablePadding>
              <ListItemButton selected={location.pathname === "/contact"}>
                <ListItemIcon>
                  <QuestionMarkIcon
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
                  primary={"Contact"}
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
              primary="Knowledge Section"
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
                <ListItem key={"Sensor Database"} disablePadding>
                  <ListItemButton selected={location.pathname === "/database/frost"}>
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
                      primary={"Sensor Database"}
                    />
                  </ListItemButton>
                </ListItem>
              </LinkCustom>
              <LinkCustom to={`/database/node_red`}>
                <ListItem key={"Node Red"} disablePadding>
                  <ListItemButton selected={location.pathname === "/database/node_red"}>
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
              </LinkCustom>{" "}
              <LinkCustom to={`/database/web_app`}>
                <ListItem key={"Web App"} disablePadding>
                  <ListItemButton selected={location.pathname === "/database/web_app"}>
                    <ListItemIcon>
                      <PublicIcon
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
                      primary={"Web App"}
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
              {/* <ListItemText
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
              /> */}
              <img
                src="/images/tum_logo.png"
                alt="logo"
                style={{ width: "55px", marginRight: "10px" }}
              />
            </ListItemButton>
          </ListItem>
        </Items>
      </List>
    </ScrollbarComponent>
  );
};

export default SidebarNav;
