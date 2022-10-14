import { useState, useEffect } from "react";
import axios from "axios";
import ContentBar from "../components/ContentBar";
import { Grid, Typography } from "@mui/material";

import { useParams } from "react-router-dom";

const Location = () => {
  const [location, setLocation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [current_time, setCurrentTime] = useState<Date | null>(null);
  const [displayName, setDisplayName] = useState("");

  const { id } = useParams<{ id: string }>();

  const get_last_update_time = async () => {
    try {
      const response = await axios.get(
        `https://iot.hef.tum.de/frost/v1.0/Locations(${id})/HistoricalLocations`
      );
      console.log(response.data);
      setCurrentTime(new Date(response.data.value[0].time));
    } catch (error) {
      console.log(error);
    }
  };

  const getLocation = async () => {
    try {
      await axios
        .get(`https://iot.hef.tum.de/frost/v1.0/Things(${id})/Locations`)
        .then((response) => {
          console.log(
            response.data.value[0].location.coordinates[0], // longitude
            response.data.value[0].location.coordinates[1] // latitude
          );
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
                  console.log(response.data[0].display_name);
                  setDisplayName(response.data[0].display_name);
                });
            }
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setLoading(true);
    getLocation();
    get_last_update_time();
    setLoading(false);
  }, []);

  loading && <div>Loading...</div>;
  return (
    <ContentBar>
      <Grid container justifyContent="left" alignItems="left">
        <Typography variant="h6" component="h6">
          <b>Location Name: </b> {displayName}
        </Typography>{" "}
        <Typography variant="h6" component="h6">
          <b>Last Update: </b> {current_time?.toLocaleString()}
        </Typography>{" "}
      </Grid>
      <Grid container justifyContent="left" alignItems="left">
        <Typography variant="h6" component="h6">
          <b>Location on map: </b>
        </Typography>
      </Grid>

      {/* add text left */}
      {location && (
        <iframe id="iframeId" height="500px" width="100%" title="map"></iframe>
      )}
    </ContentBar>
  );
};

export default Location;
