import React from "react";
import styled, { css } from "styled-components/macro";
import { rgba } from "polished";

import {
  Box,
  Card as MuiCard,
  CardContent as MuiCardContent,
  Typography as MuiTypography,
} from "@mui/material";
import { spacing } from "@mui/system";

const Typography = styled(MuiTypography)(spacing);

const Card = styled(MuiCard)<{ illustration?: string }>`
  position: relative;

  ${(props) =>
    props.illustration &&
    props.theme.palette.mode !== "dark" &&
    css`
      background: ${(props) => rgba(props.theme.palette.primary.main, 0.125)};
      color: ${(props) => props.theme.palette.primary.main};
    `}
`;

const CardContent = styled(MuiCardContent)`
  position: relative;

  &:last-child {
    padding-bottom: ${(props) => props.theme.spacing(4)};
  }
`;

const Percentage = styled(MuiTypography)<{
  percentagecolor: string;
  illustration?: string;
}>`
  span {
    color: ${(props) => props.percentagecolor};
    font-weight: ${(props) => props.theme.typography.fontWeightBold};
    background: ${(props) => rgba(props.percentagecolor, 0.1)};
    padding: 2px;
    border-radius: 3px;
    margin-right: ${(props) => props.theme.spacing(2)};
  }

  ${(props) =>
    props.illustration &&
    props.theme.palette.mode !== "dark" &&
    css`
      color: ${(props) => rgba(props.theme.palette.primary.main, 0.85)};
    `}
`;

const IllustrationImage = styled.img`
  height: 120px;
  position: absolute;
  right: ${(props) => props.theme.spacing(1)};
  bottom: ${(props) => props.theme.spacing(1)};
  display: none;

  ${(props) => props.theme.breakpoints.between("xs", "lg")} {
    display: block;
  }

  @media (min-width: 1700px) {
    display: block;
  }
`;

type StatsProps = {
  title: string;
  amount: string | number | null;
  percentagecolor: string;
  illustration?: string;
};

const Stats: React.FC<StatsProps> = ({
  title,
  amount,
  percentagecolor,
  illustration,
}) => {
  return (
    <Card illustration={illustration}>
      <CardContent>
        <Typography
          variant="h6"
          mb={6}
          style={{
            color: "#233044",
            // increase font size
            fontSize: "1.3rem",
          }}
        >
          {title}
        </Typography>
        <Typography variant="h3" mb={6}>
          <Box fontWeight="fontWeightRegular">{amount}</Box>
        </Typography>
        <Percentage
          variant="subtitle2"
          color="textSecondary"
          percentagecolor={percentagecolor}
          illustration={illustration}
        >
          {/* <span>{percentagetext}</span> Since last week */}
        </Percentage>
      </CardContent>

      {!!illustration && (
        <IllustrationImage src={illustration} alt="Illustration" />
      )}
    </Card>
  );
};

export default Stats;
