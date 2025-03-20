import * as React from "react";
import styled from "styled-components/macro";
import { Power } from "react-feather";
import { useKeycloak } from "@react-keycloak/web";
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
  const { keycloak } = useKeycloak();

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.clear();
    keycloak.logout({ redirectUri: window.location.origin }).then(() => {
      console.log("Logout successful");
    }).catch(err => console.error("Logout failed", err));
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
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </React.Fragment>
  );
}

export default NavbarUserDropdown;
