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
interface ListItemButtonProps extends MuiListItemButtonProps {
  component?: ElementType<any>;
  href?: string; 
  target?: string
}

const Wrapper = styled.div`
  padding: ${(props) => props.theme.spacing(1)} ${(props) => props.theme.spacing(4)};
  background: ${(props) => props.theme.footer.background};
  position: relative;
`;

const ListItemButton = styled(MuiListItemButton)<ListItemButtonProps>`
  display: inline-block;
  width: auto;
  padding-left: ${(props) => props.theme.spacing(2)};
  padding-right: ${(props) => props.theme.spacing(2)};

  &,
  &:hover,
  &:active {
    color: #000; /* Ensuring black color for all ListItemButtons */
    text-decoration: none;
  }
`;

const ListItemText = styled(MuiListItemText)`
  span {
    color: #000; /* Ensuring black color for all ListItemTexts */
  }
`;

function Footer() { 
  const { keycloak } = useKeycloak();
  return (
    <Wrapper>
      {/* Single Grid Container for all items */}
      <Grid container spacing={2} alignItems="center" justifyContent="center" style={{ flexWrap: "nowrap" }}>
        {/* Item 1: Impressum */}
        <Grid item>
          <List>
            <ListItemButton disabled={!keycloak?.authenticated} href="/impressum">
            <InfoIcon style={{ marginRight: "8px", fontSize: "20px" }} />
              <ListItemText
                disableTypography
                primary={
                  <Typography variant="body2" style={{ fontSize: "13px", color: "#000" }}>
                    Impressum
                  </Typography>
                }
              />
            </ListItemButton>
          </List>
        </Grid>

        {/* Item 2: HEF SensorHUB */}
      

        {/* Item 4: Documentation (with Icon) */}
        <Grid item>
          <List>
            <ListItemButton disabled={!keycloak?.authenticated}  href="/database/web_app">
              <DescriptionIcon style={{ marginRight: "8px", fontSize: "20px" }} />
              <Typography variant="body2" style={{ fontSize: "13px", color: "#000" }}>
                Documentation
              </Typography>
            </ListItemButton>
          </List>
        </Grid>

        {/* Item 5: Support (with Icon) */}
        <Grid item>
          <List>
            <ListItemButton href="/support">
              <HelpIcon style={{ marginRight: "8px", fontSize: "20px" }} />
              <Typography variant="body2" style={{ fontSize: "13px", color: "#000" }}>
                Support
              </Typography>
            </ListItemButton>
          </List>
        </Grid>

        {/* Item 6: Community (with Icon) */}
        <Grid item>
          <List>
            <ListItemButton href="https://github.com/tum-hef" target="_blank">
              <GroupIcon style={{ marginRight: "8px", fontSize: "20px" }} />
              <Typography variant="body2" style={{ fontSize: "13px", color: "#000" }}>
                Community
              </Typography>
            </ListItemButton>
          </List>
        </Grid>

        {/* Item 7: Open Source (with Icon) */}
        <Grid item>
          <List>
            <ListItemButton href="https://github.com/tum-hef/sensorHUB" target="_blank">
              <GitHubIcon style={{ marginRight: "8px", fontSize: "20px" }} />
              <Typography variant="body2" style={{ fontSize: "13px", color: "#000" }}>
                Open Source
              </Typography>
            </ListItemButton>
          </List>
        </Grid>

        {/* Item 3: © {current year} - TUM HEF */}
        <Grid item>
          <List>
            <ListItemButton>
              <ListItemText
                disableTypography
                primary={
                  <Typography variant="body2" style={{ fontSize: "13px", color: "#000" }}>
                    © {new Date().getFullYear()} - HEF sensorHUB
                  </Typography>
                }
              />
            </ListItemButton>
          </List>
        </Grid>
      </Grid>
    </Wrapper>
  );
}

export default Footer;
