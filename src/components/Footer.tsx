import styled from "styled-components/macro";

import {
  Grid,
  List,
  ListItemText as MuiListItemText,
  ListItemButtonProps as MuiListItemButtonProps,
  ListItemButton as MuiListItemButton,
} from "@mui/material";
import LinkCustom from "./LinkCustom";

interface ListItemButtonProps extends MuiListItemButtonProps {
  component?: string;
  href?: string;
}

const Wrapper = styled.div`
  padding: ${(props) => props.theme.spacing(0.25)}
    ${(props) => props.theme.spacing(4)};
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
    color: #ff0000;
  }
`;

const ListItemText = styled(MuiListItemText)`
  span {
    color: ${(props) => props.theme.footer.color};
  }
`;

function Footer() {
  return (
    <Wrapper>
      <Grid container spacing={0}>
        <Grid
          container
          item
          xs={12}
          md={6}
          alignItems="center"
          justifyContent="center"
          direction="row"
        >
          <List>
            <LinkCustom to={"training"}>
              <ListItemButton>
                <ListItemText primary="Training" />
              </ListItemButton>
            </LinkCustom>
          </List>{" "}
          <List>
            <LinkCustom to={"impressum"}>
              <ListItemButton>
                <ListItemText primary="Impressum" />
              </ListItemButton>
            </LinkCustom>
          </List>
        </Grid>
        <Grid container item xs={12} md={6} justifyContent="center">
          <List>
            <ListItemButton>
              <ListItemText
                primary={`© ${new Date().getFullYear()} - TUM HEF`}
              />
            </ListItemButton>
          </List>
        </Grid>
      </Grid>
    </Wrapper>
  );
}

export default Footer;
