import { Avatar, Card, CardContent, Grid, Typography } from "@mui/material";
export const CardWidget = (props: any) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Grid container spacing={3} sx={{ justifyContent: "space-between" }}>
        <Grid item>
          <Typography color="" gutterBottom variant="overline">
            {props.title}
          </Typography>
          <Typography color="textPrimary" variant="h4">
            {props.value}
          </Typography>
        </Grid>
        <Grid item>
          <Avatar
            sx={{
              backgroundColor: "#1976D2",
              height: 56,
              width: 56,
            }}
          >
            {props.icon}
          </Avatar>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);
