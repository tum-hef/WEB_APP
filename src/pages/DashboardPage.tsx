import Dashboard from "../components/DashboardComponent";
import { useEffect, useState } from "react";
import {
  Breadcrumbs,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import axios, { AxiosError } from "axios";
import LinkCustom from "../components/LinkCustom";
import { ToastContainer, toast } from "react-toastify";
import DnsIcon from "@mui/icons-material/Dns";
import { useKeycloak } from "@react-keycloak/web";
import styled from "styled-components";
import { useLocation, useParams } from "react-router-dom";
import { NOTFOUND } from "./404";
import PublicIcon from "@mui/icons-material/Public";
import CardDataSpace from "../components/CardDataSpace";
import { useAppDispatch, useAppSelector, useIsOwner } from "../hooks/hooks";
import { RootState } from "../store/store";
import { setSelectedGroupId } from "../store/rolesSlice";
const Anchor = styled.a`
  text-decoration: none;
  color: inherit;
  &:hover {
    text-decoration: none;
    color: #1976d2;
  }
`;
interface ApiResponse {
  success: boolean;
  PORT?: number;
  message?: string;
  error_code?: number;
}
export default function DashboardPage() {
  const [userID, setUserID] = useState<string | null>(null);
  const group = useAppSelector((state: RootState) => {
    const id = state.roles.selectedGroupId;
    return state.roles.groups.find((g: any) => { return g.group_name_id === id });
  });
  const groupId = useAppSelector((state: any) => state.roles.selectedGroupId);
  const tempState = useAppSelector((state: RootState) => state);
  const [devices, setDevices] = useState<number | null>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [nodeRedPort, setNodeRedPort] = useState<number | null>(null);
  const [grafanaPort, setGrafanaPort] = useState<number | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;
  const { group_id } = useParams<{ group_id: string }>();
  const location = useLocation();
  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const queryParams = new URLSearchParams(location.search);
  const selectedGroupId = useAppSelector(state => state.roles.selectedGroupId);
  const dispatch = useAppDispatch();
  const isOwner = useIsOwner();




  const fetchData = async () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL;
    const email = localStorage.getItem("selected_others") === "true"
      ? localStorage.getItem("user_email")
      : userInfo?.preferred_username;


    if (!email || !selectedGroupId) {
      toast.error("User email and group ID are required.");
      return;
    }

    try {
      const response = await axios.post<ApiResponse>(
        `${backend_url}/frost-server`,
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
        setFrostServerPort(response.data.PORT!);
      } else {
        toast.error(response.data.message || "Failed to fetch Frost Server port.");
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const errorResponse = error.response?.data as ApiResponse;
        toast.error(errorResponse.message || "An error occurred.");
      } else {
        toast.error("An unexpected error occurred.");
      }
      console.error("Error fetching Frost Server port:", error);
    }
  };



  useEffect(() => {
    const selectedOthers = localStorage.getItem("selected_others");

    const fetchDataAndServices = async () => {
      try {
        console.log("selectedGroupId", selectedGroupId)
        if (!hasFetched && selectedGroupId) {
          setLoading(true);

          // Fetch Node-RED port and Frost Server port
          await getNodeRedPort();
          await getGrafanaPort()
          await fetchData();

          // Fetch devices if Frost Server is available
          if (frostServerPort) {
            await asyncGetDevices();
          }

          setHasFetched(true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // toast.error("An error occurred while loading data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDataAndServices();

    // Optional: re-fetch if user switches to another shared group
    if (selectedGroupId && selectedOthers === "true") {
      fetchDataAndServices(); // optionally re-call or just reset hasFetched
    }
  }, [frostServerPort, hasFetched, selectedGroupId]);



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
      toast.error("User email and group ID are required.");
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
      console.log("response checking", response)
      if (response.status === 200 && response.data.success) {
        console.log("aaaaa", response.data.PORT!)
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
    toast.error("User email and group ID are required.");
    
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
      console.log("Grafana PORT:", response.data.PORT!);
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


  const asyncGetDevices = async () => {
    try {
      const backend_url = process.env.REACT_APP_FROST_URL;
      const isDev = process.env.REACT_APP_IS_DEVELOPMENT === 'true';
      console.log("isDev", isDev)
      const url = isDev ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Things` : `https://${frostServerPort}-${backend_url}/FROST-Server/v1.0/Things`
      console.log("url", url)
      if (frostServerPort) {
        axios
          .get(url, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            if (res.status === 200 && res.data.value) {
              setDevices(res.data.value.length);
            }
          });
      }
    } catch (err) {
      console.log(err);
      toast.error("Error Getting Devices");
    }
  };



  // useEffect(()=>{
  // if(userID){
  //   fetchGroups()
  // }
  // },[userID])
  return (
    <Dashboard>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {error ? (
            <NOTFOUND />
          ) : (
            <>
              <Breadcrumbs
                aria-label="breadcrumb"
                style={{
                  marginBottom: "10px",
                }}
              >
                <Typography color="text.primary">Landing Page</Typography>
              </Breadcrumbs>
              <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm container>
                  <Grid item xs container direction="column" spacing={2}>
                    <Grid item xs>
                      <Typography
                        gutterBottom
                        variant="h3"
                        component="div"
                        mt={5}
                      >
                        HEF sensorHUB - Dashboard
                      </Typography>
                      {group && group?.attributes && (
                        <Typography
                          variant="body2"
                          gutterBottom
                          style={{
                            fontSize: "1.0rem",
                          }}
                        >
                          Project selected: <b>{selectedGroupId && (group?.project_name ? group?.project_name : group?.attributes?.group_name)} </b>,
                          click
                          <LinkCustom
                            style={{
                              color: "blue",
                            }}
                            to="/dashboard"
                            onClick={() => {
                              localStorage.removeItem("group_id");
                              localStorage.removeItem("user_email");
                              localStorage.removeItem("selected_others");
                              dispatch(setSelectedGroupId(""))
                            }}
                          >
                            {" "}
                            here{" "}
                          </LinkCustom>
                          to change group.{" "}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid
                container
                spacing={2}
                mt={6}
                style={{
                  justifyContent: "center",
                }}
              >
                <Grid item lg={4} sm={6} xs={12}>
                  <div
                    style={{
                      opacity: (nodeRedPort && isOwner) ? 1 : 0.5,
                      pointerEvents: (nodeRedPort && isOwner) ? "auto" : "none",
                    }}
                  >
                    <Anchor
                      href={
                        nodeRedPort
                          ? process.env.REACT_APP_IS_DEVELOPMENT === 'true'
                            ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${nodeRedPort}`
                            : `https://${nodeRedPort}-${process.env.REACT_APP_NODERED_URL}`
                          : "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Card sx={{ maxWidth: 345 }} style={{ minWidth: "100%" }}>
                        <CardActionArea>
                          <CardMedia
                            style={{ height: "250px" }}
                            component="img"
                            image="../images/node-red-icon.png"
                            alt="Node-RED"
                          />
                          <CardContent style={{ textAlign: "center" }}>
                            <Typography variant="h5">Node RED</Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Anchor>
                  </div>
                </Grid>

                <Grid item lg={4} sm={6} xs={12}>
                  <div
                    style={{
                      opacity: (grafanaPort && isOwner) ? 1 : 0.5,
                      pointerEvents: (grafanaPort && isOwner) ? "auto" : "none",
                    }}
                  >
                    <Anchor
                      href={
                        grafanaPort
                          ? process.env.REACT_APP_IS_DEVELOPMENT === 'true'
                            ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${grafanaPort}`
                            : `https://${grafanaPort}-${process.env.REACT_APP_GRAFANA_URL}`
                          : "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Card sx={{ maxWidth: 345 }} style={{ minWidth: "100%" }}>
                        <CardActionArea>
                          <CardMedia
                            style={{ height: "250px" }}
                            component="img"
                            image="../images/grafana-icon.png"
                            alt="Grafana"
                          />
                          <CardContent style={{ textAlign: "center" }}>
                            <Typography variant="h5">Grafana</Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Anchor>
                  </div>
                </Grid>
                {/* Data Space */}
                <Grid item lg={4} sm={6} xs={12}>
                  <LinkCustom to={`/data-spaces/${group_id}`}>
                    <Card sx={{ maxWidth: 345 }} style={{ minWidth: "100%" }}>
                      <CardActionArea>
                        <CardMedia
                          style={{ height: "250px" }}
                          component="img"
                          image="../images/iot_devices.jpeg"
                          alt="Devices"
                        />
                        <CardContent style={{ textAlign: "center" }}>
                          <Typography variant="h5">Data Space</Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </LinkCustom>
                </Grid>

              </Grid>

              <Paper elevation={3} style={{ marginTop: "20px" }}>
                <Grid container spacing={2}>
                  <Grid xs={12} sm={12} md={12} lg={12} xl={12} item>
                    <Typography
                      gutterBottom
                      variant="h3"
                      component="div"
                      mt={5}
                      align="center"
                    >
                      Knowledge Section
                    </Typography>
                  </Grid>

                  <Grid item lg={4} sm={12} xl={4} xs={12}>
                    <CardDataSpace
                      redirection_path="database/frost"
                      card_name="Sensor Database"
                      Icon={
                        <DnsIcon
                          style={{
                            fontSize: 30,
                            marginTop: "10px",
                          }}
                        />
                      }
                    />
                  </Grid>
                  <Grid item lg={4} sm={12} xl={4} xs={12}>
                    <CardDataSpace
                      redirection_path="database/node_red"
                      card_name="Node RED"
                      Icon={
                        <DnsIcon
                          style={{
                            fontSize: 30,
                            marginTop: "10px",
                          }}
                        />
                      }
                    />
                  </Grid>
                  <Grid item lg={4} sm={12} xl={4} xs={12}>
                    <CardDataSpace
                      redirection_path="database/web_app"
                      card_name="Web App"
                      Icon={
                        <PublicIcon
                          style={{
                            fontSize: 30,
                            marginTop: "10px",
                          }}
                        />
                      }
                    />
                  </Grid>
                </Grid>
              </Paper>
            </>
          )}
        </>
      )}
    </Dashboard>
  );
}
