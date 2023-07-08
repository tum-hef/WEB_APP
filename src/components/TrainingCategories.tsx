import { Grid, Paper, Typography } from "@mui/material";
import React from "react";

function TrainingCategories({ name, object, description }: any) {
  return (
    <Paper>
      <Grid container alignContent={"center"} justifyContent={"center"}>
        <Grid item xs={12} sm={12} md={12} lg={12} mb={6} mt={6}>
          <Typography variant="h1" component="h3" gutterBottom align="center">
            {name}
          </Typography>
        </Grid>{" "}
        <Grid item xs={12} sm={12} md={12} lg={12} mb={6} mt={6}>
          <Typography
            variant="h4"
            component="h5"
            gutterBottom
            align="center"
            style={{
              fontStyle: "italic",
            }}
          >
            {description}
          </Typography>
        </Grid>
        {object.map((item: any) => {
          return (
            <Grid
              item
              xs={12}
              sm={6}
              md={6}
              lg={6}
              mb={8}
              style={{
                backgroundColor: "#f5f5f5",
                borderRadius: "10px",
                boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.2)",
              }}
            >
              <Grid container alignContent={"center"} justifyContent={"center"} style={{
                padding: "20px"
              }}>
                {item.image ? (
                  <img
                    src={`/images/${item.image}`}
                    alt={item.name}
                    style={{
                      width: "200px",
                      borderRadius: "10px",
                      margin: "auto",
                    }}
                  />
                ) : (
                  <Typography
                    variant="h3"
                    component="h5"
                    gutterBottom
                    align="center"
                    mt={2}
                    mb={6}
                  >
                    {item.name}
                  </Typography>
                )}
              </Grid>

              {item.urls.map((item: any) => {
                return (
                  <a href={item.path} target="_blank" rel="noopener noreferrer">
                    <Typography
                      variant="h4"
                      component="h4"
                      gutterBottom
                      align="center"
                      style={{
                        textDecoration: "underline",
                        color: "black",
                        marginBottom: "20px",
                      }}
                    >
                      {item.name}
                    </Typography>
                  </a>
                );
              })}
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
}

export default TrainingCategories;
