import Dashboard from "./Dashboard";
import { useEffect, useState } from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from "@mui/material";
import { red } from "@mui/material/colors";
import axios from "axios";
import LinkCustom from "../components/LinkCustom";
import { ToastContainer, toast } from "react-toastify";
import Stats from "../components/Stats";
import { useKeycloak } from "@react-keycloak/web";
import styled from "styled-components";
const Anchor = styled.a`
  text-decoration: none;
  color: inherit;
  &:hover {
    text-decoration: none;
    color: #1976d2;
  }
`;
let json_file = require("../utils/servers.json");
export default function LandingPage() {
  const [projects, setProjects] = useState<number | null>(0);
  const [devices, setDevices] = useState<number | null>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [nodeRedPort, setNodeRedPort] = useState<number | null>(null);
  const [datasteamSize, setDatastreamSize] = useState<number>(0);
  const [observationSize, setObservationSize] = useState<number>(0);
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);

  const fetchDataStreams = () => {
    console.log(frostServerPort)
    const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
    axios
      .get(`${backend_url}:${frostServerPort}/FROST-Server/v1.1/Datastreams`, {
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
        toast.error("Error Getting Datastreams1");
      });
  };

  const fetchObservations = () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
    axios
      .get(`${backend_url}:${frostServerPort}/FROST-Server/v1.1/Observations`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.status === 200 && res.data.value.length) {
          setObservationSize(res.data.value.length);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error Getting Observations");
      });
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
    if (frostServerPort !== null) {
      fetchDataStreams();
      fetchObservations();
    } else {
      fetchData();
    }
  }, [frostServerPort]);

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

  const asyncGetProjects = async () => {
    try {
      setProjects(Object.keys(json_file).length);
    } catch (err) {
      console.log(err);
      toast.error("Error Getting Projects");
    }
  };
  const asyncGetDevices = async () => {
    try {
      const response = await axios.get(
        "https://iot.hef.tum.de/frost/v1.0/Things"
      );
      setDevices(response.data.value.length);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
      toast.error("Error Getting Devices");
    }
  };

  return (
    <Dashboard>
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
        <Grid item xs={12} sm={6} md={3}>
          <Stats
            title="Projects"
            amount={projects}
            percentagecolor={red[500]}
          />
        </Grid>{" "}
        <Grid item xs={12} sm={6} md={3}>
          <Stats title="Devices" amount={devices} percentagecolor={red[500]} />
        </Grid>{" "}
        <Grid item xs={12} sm={6} md={3}>
          <Stats
            title="Datastreams"
            amount={datasteamSize}
            percentagecolor={red[500]}
          />
        </Grid>{" "}
        <Grid item xs={12} sm={6} md={3}>
          <Stats
            title="Observations"
            amount={observationSize}
            percentagecolor={red[500]}
          />
        </Grid>
      </Grid>{" "}
      <Grid
        container
        spacing={2}
        mt={6}
        style={{
          justifyContent: "center",
        }}
      >
        <Grid item lg={6} sm={12} xl={6} xs={12}>
          <LinkCustom to="/projects">
            <Card
              sx={{ maxWidth: 345 }}
              style={{
                minWidth: "100%",
              }}
            >
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="140"
                  width="100%"
                  image="./images/group_projects.png"
                  alt="Projects"
                  style={{
                    height: "250px",
                    maxHeight: "250px",
                  }}
                />
                <CardContent
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography gutterBottom variant="h3" component="div">
                    Projects
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </LinkCustom>
        </Grid>{" "}
        <Grid item lg={6} sm={12} xl={6} xs={12}>
          <LinkCustom to="/devices">
            <Card
              sx={{ maxWidth: 345 }}
              style={{
                minWidth: "100%",
              }}
            >
              <CardActionArea>
                <CardMedia
                  style={{
                    height: "250px",
                    maxHeight: "250px",
                  }}
                  component="img"
                  height="140"
                  image="./images/iot_devices.jpeg"
                  alt="Devices"
                />
                <CardContent
                  style={{
                    // add center
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography gutterBottom variant="h3" component="div">
                    Devices
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </LinkCustom>
        </Grid>{" "}
        {nodeRedPort && (
          <Grid item lg={6} sm={12} xl={6} xs={12}>
            <Anchor
              href={`${process.env.REACT_APP_BACKEND_URL_ROOT}:${nodeRedPort}`}
              target="_blank"
            >
              <Card
                sx={{ maxWidth: 345 }}
                style={{
                  minWidth: "100%",
                }}
              >
                <CardActionArea>
                  <CardMedia
                    style={{
                      height: "250px",
                      maxHeight: "250px",
                    }}
                    // image is very near

                    component="img"
                    height="140"
                    image="./images/node-red-icon.png"
                    alt="Devices"
                  />
                  <CardContent
                    style={{
                      // add center
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography gutterBottom variant="h3" component="div">
                      Node Red
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Anchor>
          </Grid>
        )}
      </Grid>
    </Dashboard>
  );
}
