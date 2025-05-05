import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import LinkCustom from "./LinkCustom";

interface CardDataSpaceProps {
  card_name: string;
  Icon: React.ReactNode;
  redirection_path: string;
  isOwner?: boolean; // ✅ Change type to boolean
}

const CardDataSpace = ({
  card_name,
  Icon,
  redirection_path,
  isOwner=true// ✅ Default to true (visible for all if not specified)
}: CardDataSpaceProps) => {
  if (!isOwner) {
    return (
      <Card
        sx={{
          backgroundColor: "#ccc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "not-allowed",
          opacity: 0.6,
        }}
      >
        <CardContent sx={{ textAlign: "center" }}>
          <Typography variant="h6">{card_name}</Typography>
          {Icon}
          <Typography variant="caption" color="text.secondary">
            (Restricted)
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
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
};

export default CardDataSpace;
