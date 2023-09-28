import { Paper } from "@material-ui/core";
import { Divider, Grid, TextField, Typography } from "@mui/material";
import React from "react";
import Dashboard from "../components/DashboardComponent";
import { useKeycloak } from "@react-keycloak/web";

function Details() {
    const { keycloak } = useKeycloak();
    const userInfo = keycloak?.idTokenParsed;
    console.log(userInfo);

  return (
    <Dashboard>
      {/* ADd page in middle of page */}
      <Paper
        style={{
          borderRadius: 10,
          padding: 20,
          textAlign: "center",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h1"
          style={{
            color: "#233044",
          }}
        >
          Updating Password
        </Typography>

        {/* add textfield for keeping name and password */}

        <Grid
          container
          spacing={3}
          style={{
            marginTop: 20,
            marginBottom: 20,
          }}
        >
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="name"
              name="name"
              label="Name"
              fullWidth
              autoComplete="given-name"
              disabled
              value={userInfo?.name}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="email"
              name="email"
              label="Email"
              fullWidth
              autoComplete="email"
              disabled
              value={userInfo?.email}
            />
          </Grid>
          <Divider
            style={{
              width: "100%",
              marginTop: 20,
              marginBottom: 20,
            }}
          />
        </Grid>
      </Paper>
    </Dashboard>
  );
}

export default Details;
