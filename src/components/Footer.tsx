import styled from "styled-components/macro";
import { ElementType } from "react";
import {
  Grid,
  List,
  ListItemText as MuiListItemText,
  ListItemButtonProps as MuiListItemButtonProps,
  ListItemButton as MuiListItemButton,
  Typography,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub"; // GitHub icon for Open Source
import HelpIcon from "@mui/icons-material/Help"; // Help icon for Support
import GroupIcon from "@mui/icons-material/Group"; // Group icon for Community
import DescriptionIcon from "@mui/icons-material/Description"; // Description icon for Documentation
import InfoIcon from "@mui/icons-material/Info";
import { useKeycloak } from "@react-keycloak/web";
import { useLocation } from "react-router-dom"; // Import useLocation

interface ListItemButtonProps extends MuiListItemButtonProps {
  component?: ElementType<any>;
  href?: string;
  target?: string;
}

const Wrapper = styled.div<{ backgroundColor: string; textColor: string }>`
  padding: ${(props) => props.theme.spacing(1)} ${(props) => props.theme.spacing(3)};
  background: ${(props) => props.backgroundColor};
  color: ${(props) => props.textColor};
  position: relative;
  text-align: center;

  @media (max-width: 600px) {
    padding: ${(props) => props.theme.spacing(2)};
  }
`;

const FooterItem = styled.a`
  display: inline-flex;
  align-items: center;
  font-size: 12px; /* Slightly larger font size */
  margin: 0 ${(props) => props.theme.spacing(2)};
  text-decoration: none; /* No underline */
  color: inherit;

  &::after {
    content: "|"; /* Adds the pipe separator */
    margin-left: ${(props) => props.theme.spacing(2)};
    color: inherit; /* Inherit text color */
  }

  &:last-child::after {
    content: ""; /* Removes pipe after the last item */
  }

  &:hover {
    text-decoration: none; /* Ensures no underline on hover */
  }
`;

function Footer() {
  const location = useLocation();

  const isHomePage = location.pathname === "/";
  const backgroundColor = isHomePage ? "#003359" : "#f7f9fc";
  const textColor = isHomePage ? "#fff" : "#000";

  return (
    <Wrapper backgroundColor={backgroundColor} textColor={textColor}>
      <Typography
        component="div"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap", // Wrap items on smaller screens
        }}
      >
        <FooterItem href="/impressum">
          <InfoIcon style={{ fontSize: "16px", verticalAlign: "middle", marginRight: "4px" }} />
          Impressum
        </FooterItem>

        <FooterItem href="/database/web_app">
          <DescriptionIcon style={{ fontSize: "16px", verticalAlign: "middle", marginRight: "4px" }} />
          Documentation
        </FooterItem>

        <FooterItem href="/support">
          <HelpIcon style={{ fontSize: "16px", verticalAlign: "middle", marginRight: "4px" }} />
          Support
        </FooterItem>

        <FooterItem href="https://github.com/tum-hef" target="_blank">
          <GroupIcon style={{ fontSize: "16px", verticalAlign: "middle", marginRight: "4px" }} />
          Community
        </FooterItem>

        <FooterItem href="https://github.com/tum-hef/sensorHUB" target="_blank">
          <GitHubIcon style={{ fontSize: "16px", verticalAlign: "middle", marginRight: "4px" }} />
          Open Source
        </FooterItem>

        <FooterItem>
          © {new Date().getFullYear()} - HEF sensorHUB
        </FooterItem>
      </Typography>
    </Wrapper>
  );
}

export default Footer;


