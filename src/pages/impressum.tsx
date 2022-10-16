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
        <p>
          World Agricultural Systems Center Hans Eisenmann-Forum für
          Agrarwissenschaften
        </p>{" "}
        <p>Tel.: +49 8161 71-3464</p>
        <p>Fax: +49 8161 71-2899</p>{" "}
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
          The information provided on this website has been collected and
          verified to the best of our knowledge and belief. However, there will
          be no warranty that the information provided is up to date, correct,
          complete, and available. There is no contractual relationship with
          users of this website. We accept no liability for any loss or damage
          caused by using this website. The exclusion of liability does not
          apply where the provisions of the German Civil Code (BGB) on liability
          in case of breach of official duty are applicable (§ 839 of the BGB).
          We accept no liability for any loss or damage caused by malware when
          accessing or downloading data or the installation or use of software
          from this website. Where necessary in individual cases: the exclusion
          of liability does not apply to information governed by the Directive
          2006/123/EC of the European Parliament and of the Council. This
          information is guaranteed to be accurate and up to date. Social Media:
          Despite careful control of the content, we accept no liability for the
          content of external links and third-party comments on any TUM social
          media channels. Operators of linked websites bear sole responsibility
          for their content.
        </p>{" "}
      </Paper>
    </Dashboard>
  );
}

export default Impressum;
