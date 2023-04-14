import React from "react";
import styled from "styled-components/macro";
import { useKeycloak } from "@react-keycloak/web";

import { Badge, Grid, Avatar, Typography } from "@mui/material";
import IUserInfo from "../models/keycloak/UserInfo";

const Footer = styled.div`
  background-color: ${(props) =>
    props.theme.sidebar.footer.background} !important;
  padding: ${(props) => props.theme.spacing(2.75)}
    ${(props) => props.theme.spacing(4)};
  border-right: 1px solid rgba(0, 0, 0, 0.12);
`;

const FooterText = styled(Typography)`
  color: ${(props) => props.theme.sidebar.footer.color};
`;

const FooterSubText = styled(Typography)`
  color: ${(props) => props.theme.sidebar.footer.color};
  font-size: 0.7rem;
  display: block;
  padding: 1px;
`;

const FooterBadge = styled(Badge)`
  margin-right: ${(props) => props.theme.spacing(1)};
  span {
    background-color: ${(props) =>
      props.theme.sidebar.footer.online.background};
    border: 1.5px solid ${(props) => props.theme.palette.common.white};
    height: 12px;
    width: 12px;
    border-radius: 50%;
  }
`;

const SidebarFooter: React.FC = ({ ...rest }) => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;

  return (
    <Footer {...rest}>
      <Grid container spacing={2}>
        <Grid item>
          <FooterBadge
            overlap="circular"
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            variant="dot"
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: "primary.main",
              }}
            >
              {userInfo?.preferred_username?.charAt(0).toUpperCase()}
            </Avatar>
          </FooterBadge>
        </Grid>
        <Grid item>
          <FooterText variant="body1">
            {userInfo?.preferred_username}
          </FooterText>
          {/* <FooterSubText variant="caption">{userInfo?.email}</FooterSubText> */}
        </Grid>
      </Grid>
    </Footer>
  );
};

export default SidebarFooter;
