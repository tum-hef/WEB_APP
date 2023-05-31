import { Breadcrumbs, Grid, Paper, Typography } from "@mui/material";

import LinkCustom from "../components/LinkCustom";
import Dashboard from "../components/DashboardComponent";
import axios from "axios";
import { useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import { toast } from "react-toastify";

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
    if (frostServerPort !== null) {
      fetchDataStreams();
      fetchObservations();
    } else {
      fetchData();
    }
    setLoading(false);
  }, [frostServerPort]);

  return (
    // <ContentBar>
    <Dashboard>
      {/* <DataTable
        title="Data Space"
        columns={columns}
        data={projects}
        pagination={true}
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 15]}
      /> */}

      <Breadcrumbs
        aria-label="breadcrumb"
        style={{
          marginBottom: "10px",
        }}
      >
        {" "}
        <Typography color="text.primary">Landing Page</Typography>
      </Breadcrumbs>

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
                    {process.env.REACT_APP_BACKEND_URL_ROOT}:{frostServerPort}
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
    </Dashboard>
    // </ContentBar>
  );
}
