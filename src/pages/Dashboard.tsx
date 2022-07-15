import ContentBar from "../components/ContentBar";

import { Grid } from "@mui/material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import StorageIcon from "@mui/icons-material/Storage";
import TabletAndroidIcon from "@mui/icons-material/TabletAndroid";
import { CardWidget } from "../components/CardWidget";

export default function Dashboard(props: any) {
  return (
    <ContentBar>
      <Grid container spacing={3}>
        <Grid item lg={3} sm={6} xl={3} xs={12}>
          <CardWidget title="Devices" value="2" icon={<TabletAndroidIcon />} />
        </Grid>
        <Grid item lg={3} sm={6} xl={3} xs={12}>
          <CardWidget title="Servers" value="10" icon={<StorageIcon />} />
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
        </Grid>
      </Grid>
    </ContentBar>
  );
}
