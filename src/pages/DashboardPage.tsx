import Dashboard from "../components/DashboardComponent";
import { useEffect, useState } from "react";
import {
  Breadcrumbs,
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
import { useParams } from "react-router-dom";
import { NOTFOUND } from "./404";
const Anchor = styled.a`
  text-decoration: none;
  color: inherit;
  &:hover {
    text-decoration: none;
    color: #1976d2;
  }
`;
export default function DashboardPage() {
  const [userID, setUserID] = useState<string | null>(null);
  const [group, setGroup] = useState<any>({});
  const [devices, setDevices] = useState<number | null>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [nodeRedPort, setNodeRedPort] = useState<number | null>(null);

  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;
  const { group_id } = useParams<{ group_id: string }>();
  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);

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
    fetchGroups();
    getNodeRedPort();
    asyncGetDevices();
    if (frostServerPort == null) {
      fetchData();
    }
    setLoading(false);
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
                        variant="h4"
                        component="div"
                        mt={5}
                      >
                        TUM HEF DASHBOARD
                      </Typography>
                      {group && group?.attributes?.group_name && (
                        <Typography variant="body2" gutterBottom>
                          Group selected: <b>{group.attributes.group_name} </b>,
                          click
                          <LinkCustom
                            style={{
                              color: "blue",
                            }}
                            to="/dashboard"
                            onClick={() => {
                              localStorage.removeItem("group_id");
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
                            component="img"
                            height="140"
                            image="../images/node-red-icon.png"
                            alt="Devices"
                          />
                          <CardContent
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              gutterBottom
                              variant="h3"
                              component="div"
                            >
                              Node Red
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Anchor>
                  </Grid>
                )}
                <Grid item lg={6} sm={12} xl={6} xs={12}>
                  <LinkCustom to={`/data-spaces/${group_id}`}>
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
                          image="../images/iot_devices.jpeg"
                          alt="Devices"
                        />
                        <CardContent
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Typography gutterBottom variant="h3" component="div">
                            Data Space
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </LinkCustom>
                </Grid>{" "}
              </Grid>
            </>
          )}
        </>
      )}
    </Dashboard>
  );
}