import React from "react";
import { Avatar, Card, CardContent, Grid, Typography } from "@mui/material";
export const CardDataSpace = ({ card_name }: { card_name: string }) => (
  <Card
    sx={{
      backgroundColor: "#222E41",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <CardContent sx={{ color: "white", textAlign: "center" }}>
      <Typography variant="h6">{card_name}</Typography>
    </CardContent>
  </Card>
);
