import * as React from "react";
import styled from "styled-components/macro";
import { Power } from "react-feather";

import { Menu, MenuItem, IconButton as MuiIconButton } from "@mui/material";

const IconButton = styled(MuiIconButton)`
  svg {
    width: 22px;
    height: 22px;
  }
`;

function NavbarUserDropdown() {
  const [anchorMenu, setAnchorMenu] = React.useState<any>(null);

  const toggleMenu = (event: React.SyntheticEvent) => {
    setAnchorMenu(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorMenu(null);
  };

  return (
    <React.Fragment>
      <IconButton
        aria-owns={Boolean(anchorMenu) ? "menu-appbar" : undefined}
        aria-haspopup="true"
        onClick={toggleMenu}
        color="inherit"
        size="large"
      >
        <Power
          style={{
            color: "#9E9E9E",
          }}
        />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorMenu}
        open={Boolean(anchorMenu)}
        onClose={closeMenu}
      >
        {/* <MenuItem onClick={closeMenu}>Profile</MenuItem> */}
        <MenuItem>
          <a
            href="http://localhost:8080/realms/keycloak-react-auth/protocol/openid-connect/logout"
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            Logout
          </a>
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}

export default NavbarUserDropdown;
