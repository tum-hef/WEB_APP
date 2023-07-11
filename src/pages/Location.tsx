import { useState, useEffect } from "react";
import axios from "axios";
import { Grid, Typography } from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { useParams } from "react-router-dom";
import Dashboard from "../components/DashboardComponent";
import { ToastContainer, toast } from "react-toastify";

const Location = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;
  const [location, setLocation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [current_time, setCurrentTime] = useState<Date | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const { id } = useParams<{ id: string }>();

  const get_last_update_time = async () => {
    try {
      const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
      const url = `${backend_url}:${frostServerPort}/FROST-Server/v1.0/HistoricalLocations(${id})`;
      console.log(url);
      axios
        .get(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          console.log(response.data.time);
          if (response.status === 200 && response.data.time) {
            setCurrentTime(new Date(response.data.time));
          }
        })
        .catch((err) => {
          console.log(err);
          toast.error("Error Getting Last Update Time");
        });
    } catch (error) {
      console.log(error);
    }
  };

  const fetchFrostPort = async () => {
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

  const getLocation = async () => {
    try {
      const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
      axios
        .get(
          `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Things(${id})/Locations`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          if (response.status === 200 && response.data.value) {
            setLocation(response.data.value);
            const ifameData = document.getElementById(
              "iframeId"
            ) as HTMLIFrameElement;
            if (ifameData) {
              ifameData.src = `https://maps.google.com/maps?q=${response.data.value[0].location.coordinates[1]},${response.data.value[0].location.coordinates[0]}&hl=es;&output=embed`;

              if (
                response.data.value[0].location.coordinates[0] &&
                response.data.value[0].location.coordinates[1]
              ) {
                axios
                  .get(
                    `https://nominatim.openstreetmap.org/search.php?q=
          ${response.data.value[0].location.coordinates[1]}
          ,${response.data.value[0].location.coordinates[0]}&polygon_geojson=1&format=json`
                  )
                  .then((response) => {
                    setDisplayName(response.data[0].display_name);
                  });
              }
            }
          }
        })
        .catch((err) => {
          toast.error("Error Getting Things");
        });
    } catch (error) {}
  };

  useEffect(() => {
    if (frostServerPort !== null) {
      getLocation();
      get_last_update_time();
    } else {
      fetchFrostPort();
    }
    setLoading(true);
    setLoading(false);
  }, [frostServerPort]);

  loading && <div>Loading...</div>;
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
      <Grid container justifyContent="left" alignItems="left">
        <Typography variant="h6" component="h6" m={2}>
          <b>Location Name: </b> {displayName}
        </Typography>{" "}
        <Typography variant="h6" component="h6" m={2}>
          <b>Last Update: </b> {current_time?.toLocaleString()}
        </Typography>{" "}
      </Grid>
      <Grid container justifyContent="left" alignItems="left">
        <Typography variant="h6" component="h6" m={2}>
          <b>Location on map: </b>
        </Typography>
      </Grid>

      {/* add text left */}
      {location && (
        <iframe id="iframeId" height="500px" width="100%" title="map"></iframe>
      )}
    </Dashboard>
  );
};

export default Location;
