import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import LinkCustom from "./LinkCustom";

interface CardDataSpaceProps {
  card_name: string;
  Icon: any;
  redirection_path: string;
}

const CardDataSpace = ({
  card_name,
  Icon,
  redirection_path,
}: CardDataSpaceProps) => (
  <LinkCustom to={`/${redirection_path}`} target="_blank">
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
        {Icon}
      </CardContent>
    </Card>
  </LinkCustom>
);

export default CardDataSpace;
