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
let json_file = require("../utils/servers.json");
export default function LandingPage() {
  const [projects, setProjects] = useState<number | null>(0);
  const [devices, setDevices] = useState<number | null>(0);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    console.log("Dashboard useEffect");
    asyncGetProjects();
    asyncGetDevices();
    setLoading(false);
  }, []);

  const asyncGetProjects = async () => {
    try {
      setProjects(Object.keys(json_file).length);
      console.log("Projects: ", projects);
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
            amount="1.320+"
            percentagecolor={red[500]}
          />
        </Grid>{" "}
        <Grid item xs={12} sm={6} md={3}>
          <Stats
            title="Observations"
            amount="1.320+"
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
                  image="https://www.herzing.edu/sites/default/files/styles/fp_960_480/public/images/blog/group_projects.png.webp?itok=tQSafZj0"
                  alt="Projects"
                  style={{
                    height: "250px",
                    maxHeight: "250px",
                  }}
                />
                <CardContent
                  style={{
                    // add center
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography gutterBottom variant="h5" component="div">
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
                  image="https://www.pngall.com/wp-content/uploads/1/Electronic-PNG-Photo.png"
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
                  <Typography gutterBottom variant="h5" component="div">
                    Devices
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </LinkCustom>
        </Grid>{" "}
      </Grid>
    </Dashboard>
  );
}
