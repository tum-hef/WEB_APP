import ContentBar from "../components/ContentBar";

import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from "@mui/material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import StorageIcon from "@mui/icons-material/Storage";
import TabletAndroidIcon from "@mui/icons-material/TabletAndroid";
import { CardWidget } from "../components/CardWidget";
import LinkCustom from "../components/LinkCustom";

export default function Dashboard(props: any) {
  return (
    <ContentBar>
      <Grid
        container
        spacing={2}
        style={{
          // add center
          justifyContent: "center",
        }}
      >
        {/* <Grid item lg={3} sm={6} xl={3} xs={12}>
          <CardWidget title="Devices" value="2" icon={<TabletAndroidIcon />} />
        </Grid>
        <Grid item lg={3} sm={6} xl={3} xs={12}>
          <CardWidget title="Projects" value="10" icon={<StorageIcon />} />
        </Grid>{" "}
        <Grid item lg={3} sm={6} xl={3} xs={12}>
          <CardWidget
            title="Notifications"
            value="1"
            icon={<NotificationsNoneIcon />}
          />
        </Grid>{" "}
        <Grid item lg={3} sm={6} xl={3} xs={12}>
          <CardWidget title="Reports" value="6" icon={<ListAltIcon />} />
        </Grid>{" "} */}
        <Grid item lg={6} sm={12} xl={6} xs={12}>
          <LinkCustom to="/projects">
            <Card sx={{ maxWidth: 345 }}>
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="140"
                  image="https://www.herzing.edu/sites/default/files/styles/fp_960_480/public/images/blog/group_projects.png.webp?itok=tQSafZj0"
                  alt="green iguana"
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
            <Card sx={{ maxWidth: 345 }}>
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="140"
                  image="https://thumbs.dreamstime.com/b/cute-gadgets-cartoon-characters-funny-electronic-device-isolated-set-vector-illustration-smartphone-headphones-fitness-tracker-172926365.jpg"
                  alt="green iguana"
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
    </ContentBar>
  );
}
