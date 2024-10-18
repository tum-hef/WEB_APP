import { useState, useEffect } from "react";
import axios from "axios";
import { Button, Grid, Typography } from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { useParams } from "react-router-dom";
import Dashboard from "../components/DashboardComponent";
import { ToastContainer, toast } from "react-toastify";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import LinkCustom from "../components/LinkCustom";
const Location = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;
  const [longitude, setLongitude] = useState<number | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  // const [current_time, setCurrentTime] = useState<Date | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const { id } = useParams<{ id: string }>();

  const customMarkerIcon = new L.Icon({
    iconUrl: require("../assets/pinpoint.png"), // Specify the correct path to your custom icon
    iconSize: [30, 30],
  });

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
      const isDev = process.env.REACT_APP_NODE_ENV === 'development';   
     const url = isDev ?  `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Locations(${id})` : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Locations(${id})`
      axios
        .get(
          url,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          if (response.status === 200 && response.data.location.coordinates) {
            setLatitude(response.data.location.coordinates[1]);
            setLongitude(response.data.location.coordinates[0]);

            axios
              .get(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${response.data.location.coordinates[1]}&lon=${response.data.location.coordinates[0]}`
              )
              .then((response) => {
                if (response.data.display_name) {
                  setDisplayName(response.data.display_name);
                }
              });
          }
        })
        .catch((err) => {
          toast.error("Error Getting Location");
        });
    } catch (error) {}
  };

  useEffect(() => {
    if (frostServerPort !== null) {
      getLocation();
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
      <LinkCustom to="/devices">
        <Button
          variant="contained"
          color="primary"
          style={{
            marginBottom: "10px",
          }}
        >
          Devices
        </Button>
      </LinkCustom>

      {displayName && (
        <Grid container justifyContent="left" alignItems="left">
          <Typography variant="h6" component="h6" m={2}>
            <b>Location Name: </b> {displayName}
          </Typography>{" "}
        </Grid>
      )}
      {latitude && longitude && (
        <>
          <Grid container justifyContent="left" alignItems="left">
            <Typography variant="h6" component="h6" m={2}>
              <b>Location on map: </b>
            </Typography>
          </Grid>

          {/* add text left */}
          <Grid item xs={12} sm={12}>
            <MapContainer
              center={[latitude, longitude]}
              zoom={14}
              scrollWheelZoom={false}
              style={{ height: "60vh", width: "30wh" }}
            >
              <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                position={[latitude, longitude]}
                icon={customMarkerIcon}
              ></Marker>
            </MapContainer>
          </Grid>
        </>
      )}
    </Dashboard>
  );
};

export default Location;
