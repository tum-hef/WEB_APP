import React from "react";
import DashboardComponent from "../components/DashboardComponent";
import CardDataSpace from "../components/CardDataSpace";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { Breadcrumbs, Grid, Typography } from "@mui/material";
import BiotechSharpIcon from "@mui/icons-material/BiotechSharp";

function QuickDataEntry() {
  return (
    <DashboardComponent>
      <Breadcrumbs
        aria-label="breadcrumb"
        style={{
          marginBottom: "10px",
        }}
      >
        <Typography>Data Space</Typography>
        <Typography color="text.primary">Quick Data Entry</Typography>
      </Breadcrumbs>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={6} lg={6}>
          <CardDataSpace
            redirection_path="stepper"
            card_name="Stepper"
            Icon={
              <DriveFileRenameOutlineIcon
                style={{
                  fontSize: 30,
                  marginTop: "10px",
                }}
              />
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6} lg={6}>
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

export default QuickDataEntry;
