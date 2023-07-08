import React from "react";
import DashboardComponent from "../components/DashboardComponent";
import CardDataSpace from "../components/CardDataSpace";
import { Breadcrumbs, Grid, Typography } from "@mui/material";
import TabletAndroidIcon from "@mui/icons-material/TabletAndroid";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import BiotechSharpIcon from "@mui/icons-material/BiotechSharp";

function FrostEntities() {
  return (
    <DashboardComponent>
      <Breadcrumbs
        aria-label="breadcrumb"
        style={{
          marginBottom: "10px",
        }}
      >
        <Typography>Data Space</Typography>
        <Typography color="text.primary">Data Items</Typography>
      </Breadcrumbs>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <CardDataSpace
            redirection_path="devices"
            card_name="Devices"
            Icon={
              <TabletAndroidIcon
                style={{
                  fontSize: 30,
                  marginTop: "10px",
                }}
              />
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <CardDataSpace
            redirection_path="sensors"
            card_name="Sensor Types"
            Icon={
              <DeviceThermostatIcon
                style={{
                  fontSize: 30,
                  marginTop: "10px",
                }}
              />
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <CardDataSpace
            redirection_path="observation_properties"
            card_name="Measurement property"
            Icon={
              <PersonSearchIcon
                style={{
                  fontSize: 30,
                  marginTop: "10px",
                }}
              />
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <CardDataSpace
            redirection_path="datastreams"
            card_name="Datastreams"
            Icon={
              <FolderSpecialIcon
                style={{
                  fontSize: 30,
                  marginTop: "10px",
                }}
              />
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <CardDataSpace
            redirection_path="locations"
            card_name="Locations"
            Icon={
              <LocationOnIcon
                style={{
                  fontSize: 30,
                  marginTop: "10px",
                }}
              />
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <CardDataSpace
            redirection_path="observations"
            card_name="Observations"
            Icon={
              <BiotechSharpIcon
                style={{
                  fontSize: 30,
                  marginTop: "10px",
                }}
              />
            }
          />
        </Grid>
      </Grid>
    </DashboardComponent>
  );
}

export default FrostEntities;
