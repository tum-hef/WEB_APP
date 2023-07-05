import { Grid, Paper, Typography } from "@mui/material";
import React from "react";

function Training({ name, object }: any) {
  return (
    <Paper>
      <Grid container alignContent={"center"} justifyContent={"center"}>
        <Grid item xs={12} sm={12} md={12} lg={12} mb={6} mt={6}>
          <Typography variant="h1" component="h3" gutterBottom align="center">
            {name}
          </Typography>
        </Grid>
        {object.map((item: any) => {
          return (
            <Grid item xs={12} sm={6} md={6} lg={6} mb={8}>
              <a href={item.path}>
                <Typography
                  variant="h4"
                  component="h4"
                  gutterBottom
                  align="center"
                  style={{
                    textDecoration: "underline",
                    color: "black",
                  }}
                >
                  {item.name}
                </Typography>
              </a>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
}

export default Training;
