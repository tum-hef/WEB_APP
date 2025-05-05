import { Breadcrumbs, Grid, Paper, Typography, Button, IconButton } from "@mui/material";
import LinkCustom from "../components/LinkCustom";
import Dashboard from "../components/DashboardComponent";
import axios from "axios";
import { useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { NOTFOUND } from "./404";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import CardDataSpace from "../components/CardDataSpace";
import TabletAndroidIcon from "@mui/icons-material/TabletAndroid";
import ReactGA from "react-ga4";
import { GAactionsDataSpace } from "../utils/GA";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAppSelector, useIsOwner } from "../hooks/hooks";
interface ApiResponse {
  success: boolean;
  PORT?: number;
  message?: string;
  error_code?: number;
}
export default function DataSpace() {
  const { keycloak } = useKeycloak();
  const [datasteamSize, setDatastreamSize] = useState<number>(0);
  const [devices, setDevices] = useState<number | null>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;
  const [nodeRedPort, setNodeRedPort] = useState<number | null>(null);
  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [userID, setUserID] = useState<string | null>(null);
  const { group_id } = useParams<{ group_id: string }>();
  const [error, setError] = useState<boolean>(false);
  const [clientDetatils, setClientDetails] = useState<any>({});
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const selectedGroupId = useAppSelector(state => state.roles.selectedGroupId);
  const group = useAppSelector(state =>
    state.roles.groups.find(g => g.group_name_id === selectedGroupId)
  );
  const isOwner = useIsOwner();

  const toggleVisibility = () => setShowSecret(!showSecret)



  const fetchDataStreams = () => {
    console.log(frostServerPort);
    const backend_url = process.env.REACT_APP_FROST_URL;
    const isDev = process.env.REACT_APP_IS_DEVELOPMENT === 'true';
    const url = isDev ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Datastreams` : `https://${frostServerPort}-${backend_url}/FROST-Server/v1.0/Datastreams`
    axios
      .get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.status === 200 && res.data.value.length) {
          setDatastreamSize(res.data.value.length);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error Getting Datastreams");
      });
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
        toast.error(response?.data?.message || "Failed to fetch Node-RED port.");
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const errorResponse = error.response?.data as ApiResponse;
        toast.error(errorResponse?.message || "An error occurred.");
      } else {
        toast.error("An unexpected error occurred.");
      }
      console.error("Error fetching Node-RED port:", error);
    }
  };
  const asyncGetDevices = async (retryCount = 3) => {
    const backend_url = process.env.REACT_APP_FROST_URL;
    const isDev = process.env.REACT_APP_IS_DEVELOPMENT === "true";
    const url = isDev
      ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Things`
      : `https://${frostServerPort}-${backend_url}/FROST-Server/v1.0/Things`;

    let attempt = 0;

    while (attempt < retryCount) {
      try {
        const res = await axios.get(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 200 && res.data.value) {
          setDevices(res.data.value.length);
          return; // Exit on success
        }
      } catch (err) {
        attempt += 1;
        console.error(`Attempt ${attempt}: Failed to fetch devices`, err);
        if (attempt >= retryCount) {
          toast.error("Error fetching devices. Please try again later.");
        }
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  };


  const fetchData = async () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL;
    const email = localStorage.getItem("selected_others") === "true"
      ? localStorage.getItem("user_email")
      : userInfo?.preferred_username;
    const group_id = localStorage.getItem("group_id");

    if (!email || !group_id) {
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

  const getClientDetails = async () => {
    if (frostServerPort) {
      let backend_url = process.env.REACT_APP_BACKEND_URL;
      let URL = `${backend_url}/get_client_details?client_id=${`frost_${frostServerPort}`}`;
      try {
        const response = await axios.get(URL, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          setClientDetails(response.data);
        }
      } catch (error) {
        console.error("Error fetching client details:", error);
      }
    }

  }
  useEffect(() => {
    ReactGA.event({
      category: GAactionsDataSpace.category,
      action: GAactionsDataSpace.action,
      label: GAactionsDataSpace.label,
    });


    getNodeRedPort();
    if (frostServerPort) {
      getClientDetails()
    }

    if (frostServerPort !== null) {
      fetchDataStreams();
      asyncGetDevices(); // Retry logic included
    } else {
      fetchData();
    }

    setLoading(false);
  }, [frostServerPort]);


  return (
    <Dashboard>
      {loading ? (
        <p>Loading</p>
      ) : error ? (
        <NOTFOUND />
      ) : (
        <>
          <Breadcrumbs
            aria-label="breadcrumb"
            style={{
              marginBottom: "10px",
            }}
          >
            {" "}
            <LinkCustom to="/">Data Space</LinkCustom>
            <Typography color="text.primary">Specs</Typography>
          </Breadcrumbs>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12} lg={12}>
              <Typography
                variant="h2"
                component="h3"
                style={{
                  alignContent: "center",
                  textAlign: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                  color: "#233044",
                }}
              >
                Data Space Specs
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={6}>
              <CardDataSpace
                redirection_path="stepper"
                card_name="Stepper" 
                isOwner={isOwner}
                Icon={
                  <DriveFileRenameOutlineIcon
                    style={{
                      fontSize: 30,
                      marginTop: "10px",
                    }}
                  />
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={6}>
              <CardDataSpace
                redirection_path="devices"
                card_name="Devices & Data"
                Icon={
                  <TabletAndroidIcon
                    style={{
                      fontSize: 30,
                      marginTop: "10px",
                    }}
                  />
                }
              />
            </Grid>
          </Grid>

          <Paper
            sx={{
              p: 2,
              margin: "30px",
              maxWidth: "100%",
              flexGrow: 1,
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "#1A2027" : "#fff",
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={6} sm container>
                <Grid item xs>
                  <Typography
                    variant="h6"
                    gutterBottom
                    style={{
                      marginBottom: "20px",
                    }}
                  >
                    <span
                      style={{
                        color: "#233044",
                      }}
                    >
                      URL:
                    </span>{" "}
                    <LinkCustom
                      style={{
                        borderBottom: "1px solid #233044",
                      }}
                      to="#"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(
                          process.env.REACT_APP_IS_DEVELOPMENT === 'true' ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0` : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0`,
                          "_blank",
                          "noopener,noreferrer"
                        );
                      }}
                    >
                      {process.env.REACT_APP_IS_DEVELOPMENT === 'true' ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0` : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0`}
                    </LinkCustom>
                  </Typography>{" "}
                  <Typography
                    variant="h6"
                    gutterBottom
                    style={{
                      marginBottom: "20px",
                    }}
                  >
                    <span
                      style={{
                        color: "#233044",
                      }}
                    >
                      Devices{" "}
                      <LinkCustom
                        style={{
                          borderBottom: "1px solid #233044",
                        }}
                        to={`devices`}
                      >
                        {"(URL)"}
                      </LinkCustom>
                      :
                    </span>{" "}
                    {devices}
                  </Typography>{" "}
                  <Typography
                    variant="h6"
                    gutterBottom
                    style={{
                      marginBottom: "20px",
                    }}
                  >
                    <span
                      style={{
                        color: "#233044",
                      }}
                    >
                      Datastreams :
                    </span>{" "}
                    {datasteamSize}
                  </Typography>{" "}
                  <Typography
                    variant="h6"
                    gutterBottom
                    style={{
                      marginBottom: "20px",
                    }}
                  >
                    <span
                      style={{
                        color: "#233044",
                      }}
                    >
                      Client ID:
                    </span>{" "}
                    {datasteamSize}
                  </Typography>{" "}
                  <>
                    <Typography
                      variant="h6"
                      gutterBottom
                      style={{ marginBottom: "20px" }}
                    >
                      <span style={{ color: "#233044" }}>Client ID:</span>{" "}
                      {clientDetatils?.client_id}
                    </Typography>

                    <Typography
                      variant="h6"
                      gutterBottom
                      style={{ marginBottom: "10px" }}
                    >
                      <span style={{ color: "#233044" }}>Client Secret:</span>{" "}
                      {showSecret ? clientDetatils?.client_secret : "••••••••••••"}
                      <span><IconButton onClick={toggleVisibility} size="small">
                        {showSecret ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                      </span>
                    </Typography>


                  </>
                </Grid>

              </Grid>
              <Grid item xs={6} sm container>
                <Grid item xs>
                  <Typography
                    variant="h6"
                    gutterBottom
                    style={{
                      marginBottom: "20px",
                    }}
                  >
                    <span
                      style={{
                        color: "#233044",
                      }}
                    >
                      Server Technology:
                    </span>{" "}
                    The FRaunhofer Opensource SensorThings-Server
                  </Typography>{" "}
                  <Typography
                    variant="h6"
                    gutterBottom
                    style={{
                      marginBottom: "20px",
                    }}
                  >
                    <span
                      style={{
                        color: "#233044",
                      }}
                    >
                      ID of FROST:
                    </span>{" "}
                    {frostServerPort}
                  </Typography>{" "}
                  <Typography
                    variant="h6"
                    gutterBottom
                    style={{
                      marginBottom: "20px",
                    }}
                  >
                    <span
                      style={{
                        color: "#233044",
                      }}
                    >
                      Database:
                    </span>{" "}
                    PostgreSQL
                  </Typography>{" "}
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}
    </Dashboard>
  );
}
