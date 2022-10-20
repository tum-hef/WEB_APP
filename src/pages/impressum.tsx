import { Paper } from "@material-ui/core";
import { Typography } from "@mui/material";
import React from "react";
import Dashboard from "./Dashboard";

function Impressum() {
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
          Impressum
        </Typography>
        <Typography variant="h3" style={{ color: "#233044" }} mt={8}>
          Publisher
        </Typography>
        <p>Technische Universität München</p>{" "}
        <p>
          World Agricultural Systems Center Hans Eisenmann-Forum für
          Agrarwissenschaften
        </p>{" "}
        <p>Liesel-Beckmann-Str. 2 D-85354 Freising</p>{" "}
        <Typography variant="h3" style={{ color: "#233044" }} mt={8}>
          Legal status and representation
        </Typography>
        <p>
          The Technical University of Munich is a corporation under public law
          and a state institution (Art. 11(1) of the Bavarian Higher Education
          Act - BayHSchG). Its legal representative is Prof. Dr. Thomas F.
          Hofmann.
        </p>{" "}
        <Typography variant="h3" style={{ color: "#233044" }} mt={8}>
          Liability diclaimer
        </Typography>
        <p>
          Permission is hereby granted, free of charge, to any person obtaining
          a copy of this software and associated documentation files (the
          “Software”), to deal in the Software without restriction, including
          without limitation the rights to use, copy, modify, merge, publish,
          distribute, sublicense, and/or sell copies of the Software, and to
          permit persons to whom the Software is furnished to do so, subject to
          the following conditions: The above copyright notice and this
          permission notice shall be included in all copies or substantial
          portions of the Software.
        </p>{" "}
        <p>
          The software is provided “as is”, without warranty of any kind,
          express or implied, including but not limited to the warranties of
          merchantability, fitness for a particular purpose and noninfringement.
          in no event shall the authors or copyright holders be liable for any
          claim, damages or other liability, whether in an action of contract,
          tort or otherwise, arising from, out of or in connection with the
          software or the use or other dealings in the software.
        </p>
      </Paper>
    </Dashboard>
  );
}

export default Impressum;
