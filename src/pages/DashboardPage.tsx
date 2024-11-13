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
import axios from "axios";
import LinkCustom from "../components/LinkCustom";
import { ToastContainer, toast } from "react-toastify";
import DnsIcon from "@mui/icons-material/Dns";
import { useKeycloak } from "@react-keycloak/web";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { NOTFOUND } from "./404";
import PublicIcon from "@mui/icons-material/Public";
import CardDataSpace from "../components/CardDataSpace";
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
  const [hasFetched, setHasFetched] = useState(false);

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
    if (frostServerPort !== null && !hasFetched) {
      fetchGroups();
      getNodeRedPort();
      asyncGetDevices();
      setHasFetched(true);  // Set this to true so it doesn't run again
      setLoading(false);
    } else if (frostServerPort === null) {
      fetchData();
      setLoading(false);
    }
  }, [frostServerPort, hasFetched]);

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
      const backend_url = process.env.REACT_APP_FROST_URL;  
      const isDev = process.env.REACT_APP_IS_DEVELOPMENT === 'true';  
      console.log("isDev",isDev)
      const url = isDev  ?  `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Things` : `https://${frostServerPort}-${backend_url}/FROST-Server/v1.0/Things` 
      console.log("url",url)
      if(frostServerPort){
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
 


  useEffect(()=>{
  if(userID){
    fetchGroups()
  }
  },[userID])
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
                      {group && group?.attributes?.group_name && (
                        <Typography
                          variant="body2"
                          gutterBottom
                          style={{
                            fontSize: "1.0rem",
                          }}
                        >
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
                      href={ process.env.REACT_APP_IS_DEVELOPMENT  === 'true' ?  `${process.env.REACT_APP_BACKEND_URL_ROOT}:${nodeRedPort}`  : `https://${nodeRedPort}-${process.env.REACT_APP_NODERED_URL}`}
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
                            width="100%"
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
                              Node RED
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
