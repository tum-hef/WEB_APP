import { useState, useEffect } from "react";
import axios from "axios";
import DataTable, { ExpanderComponentProps } from "react-data-table-component";
import ContentBar from "../components/ContentBar";
import { Button, Grid, Typography } from "@mui/material";
import LinkCustom from "../components/LinkCustom";
import CastIcon from "@mui/icons-material/Cast";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useParams } from "react-router-dom";
import GoogleMap from "google-map-react";

const Location = () => {
  const [location, setLocation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { id } = useParams<{ id: string }>();
  const getLocation = async () => {
    try {
      await axios
        .get(`https://iot.hef.tum.de/frost/v1.0/Things(${id})/Locations`)
        .then((response) => {
          setLoading(false);
          setLocation(response.data.value);
          const ifameData = document.getElementById(
            "iframeId"
          ) as HTMLIFrameElement;
          if (ifameData) {
            ifameData.src = `https://maps.google.com/maps?q=${response.data.value[0].location.coordinates[1]},${response.data.value[0].location.coordinates[0]}&hl=es;&output=embed`;
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  loading && <div>Loading...</div>;
  return (
    <ContentBar>
      <Grid container justifyContent="center" alignItems="center">
        <Typography variant="h5" component="div" gutterBottom mb={2}>
          {location[0]?.name}
        </Typography>
        {location && (
          <iframe id="iframeId" height="500px" width="100%"></iframe>
        )}
      </Grid>
    </ContentBar>
  );
};

export default Location;
