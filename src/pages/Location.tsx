import { useState, useEffect } from "react";
import axios from "axios";
import ContentBar from "../components/ContentBar";
import { Grid, Typography } from "@mui/material";

import { useParams } from "react-router-dom";

const Location = () => {
  const [location, setLocation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");

  const { id } = useParams<{ id: string }>();
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
    setLoading(false);
  }, []);

  loading && <div>Loading...</div>;
  return (
    <ContentBar>
      <Grid container justifyContent="center" alignItems="center">
        <Typography variant="h5" component="div" gutterBottom mb={2}>
          {displayName}
        </Typography>
        {location && (
          <iframe
            id="iframeId"
            height="500px"
            width="100%"
            title="map"
          ></iframe>
        )}
      </Grid>
    </ContentBar>
  );
};

export default Location;
