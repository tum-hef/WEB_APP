import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import React from "react";
import LinkCustom from "../components/LinkCustom";
import Dashboard from "../components/DashboardComponent";
import axios from "axios";
import { useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { NOTFOUND } from "./404";
import TabletAndroidIcon from "@mui/icons-material/TabletAndroid";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import BiotechSharpIcon from "@mui/icons-material/BiotechSharp";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import CardDataSpace from "../components/CardDataSpace";
export default function DataSpace() {
  const { keycloak } = useKeycloak();
  const [datasteamSize, setDatastreamSize] = useState<number>(0);
  const [observationSize, setObservationSize] = useState<number>(0);
  const [devices, setDevices] = useState<number | null>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;
  const [nodeRedPort, setNodeRedPort] = useState<number | null>(null);
  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [userID, setUserID] = useState<string | null>(null);
  const [group, setGroup] = useState<any>({});
  const { group_id } = useParams<{ group_id: string }>();
  const [error, setError] = useState<boolean>(false);

  const fetchGroups = async () => {
    if (keycloak && userInfo && userInfo.sub) {
      setUserID(userInfo.sub);

      if (userID) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/get_clients?user_id=${userID}`
          );

          if (response.status === 200 && response.data.groups) {
            // check if group_id is in groups
            if (group_id) {
              const group = response.data.groups.find(
                (group: any) => group.id === group_id
              );
              if (!group) {
                toast.error("Group is not valid");
                setError(true);
              } else {
                setGroup(group);
              }
            }
          } else if (response.status === 404 && response.data.message) {
            toast.error(response.data.message);
          } else {
            toast.error("Error fetching clients");
          }
        } catch (error) {
          toast.error("An error occurred while fetching clients.");
          console.log(error);
        }
      }
    }
  };

  const fetchDataStreams = () => {
    console.log(frostServerPort);
    const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
    axios
      .get(`${backend_url}:${frostServerPort}/FROST-Server/v1.0/Datastreams`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log(JSON.stringify(res.data.value.length));
        if (res.status === 200 && res.data.value.length) {
          setDatastreamSize(res.data.value.length);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error Getting Datastreams");
      });
  };

  const fetchObservations = () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;

    axios
      .get(`${backend_url}:${frostServerPort}/FROST-Server/v1.0/Observations`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.status === 200 && res.data["@iot.count"]) {
          setObservationSize(res.data["@iot.count"]);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error Getting Observations");
      });
  };

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

  const asyncGetDevices = async () => {
    try {
      const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
      axios
        .get(`${backend_url}:${frostServerPort}/FROST-Server/v1.0/Things`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          if (res.status === 200 && res.data.value) {
            console.log(res.data.value);
            setDevices(res.data.value.length);
          }
        });
    } catch (err) {
      console.log(err);
      toast.error("Error Getting Devices");
    }
  };

  const fetchData = async () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL;
    const email = userInfo?.preferred_username;
    await axios
      .get(`${backend_url}/frost-server?email=${email}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.status === 200 && res.data.PORT) {
          setFrostServerPort(res.data.PORT);
        }
      });
  };
  useEffect(() => {
    getNodeRedPort();
    asyncGetDevices();
    fetchGroups();
    if (frostServerPort !== null) {
      fetchDataStreams();
      fetchObservations();
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
            <Typography color="text.primary">Data Space</Typography>
          </Breadcrumbs>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4} lg={4}>
              <CardDataSpace
                redirection_path="devices"
                card_name="Devices"
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
            <Grid item xs={12} sm={6} md={4} lg={4}>
              <CardDataSpace
                redirection_path="sensors"
                card_name="Sensors"
                Icon={
                  <DeviceThermostatIcon
                    style={{
                      fontSize: 30,
                      marginTop: "10px",
                    }}
                  />
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={4}>
              <CardDataSpace
                redirection_path="observation_properties"
                card_name="Observed Properties"
                Icon={
                  <PersonSearchIcon
                    style={{
                      fontSize: 30,
                      marginTop: "10px",
                    }}
                  />
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={4}>
              <CardDataSpace
                redirection_path="datastreams"
                card_name="Datastreams"
                Icon={
                  <FolderSpecialIcon
                    style={{
                      fontSize: 30,
                      marginTop: "10px",
                    }}
                  />
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={4}>
              <CardDataSpace
                redirection_path="locations"
                card_name="Locations"
                Icon={
                  <LocationOnIcon
                    style={{
                      fontSize: 30,
                      marginTop: "10px",
                    }}
                  />
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={4}>
              <CardDataSpace
                redirection_path="observations"
                card_name="Observations"
                Icon={
                  <BiotechSharpIcon
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
              margin: "auto",
              maxWidth: 500,
              flexGrow: 1,
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "#1A2027" : "#fff",
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm container>
                <Grid item xs container direction="column" spacing={2}>
                  <Grid item xs>
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
                        ID:
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
                        URL:
                      </span>{" "}
                      <LinkCustom
                        style={{
                          borderBottom: "1px solid #233044",
                        }}
                        to={`${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0`}
                      >
                        {process.env.REACT_APP_BACKEND_URL_ROOT}:
                        {frostServerPort}
                        /FROST-Server/v1.0
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
                        Database:
                      </span>{" "}
                      PostgreSQL
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
                        Observations :{" "}
                      </span>{" "}
                      {observationSize}
                    </Typography>{" "}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}
    </Dashboard>
    // </ContentBar>
  );
}
