import React from "react";
import styled from "styled-components/macro";
import { NavLink } from "react-router-dom";

import { spacing } from "@mui/system";

import {
  Box as MuiBox,
  Drawer as MuiDrawer,
  ListItemButton,
} from "@mui/material";

import { SidebarItemsType } from "../types/sidebar";
import Footer from "./SidebarFooter";
import SidebarNav from "./SidebarNav";

const Box = styled(MuiBox)(spacing);

const Drawer = styled(MuiDrawer)`
  border-right: 0;

  > div {
    border-right: 0;
  }
`;

const Brand = styled(ListItemButton)<{
  component?: React.ReactNode;
  to?: string;
}>`
  font-size: ${(props) => props.theme.typography.h5.fontSize};
  font-weight: ${(props) => props.theme.typography.fontWeightMedium};
  color: ${(props) => props.theme.sidebar.header.color};
  background-color: ${(props) => props.theme.sidebar.header.background};
  font-family: ${(props) => props.theme.typography.fontFamily};
  min-height: 56px;
  padding-left: ${(props) => props.theme.spacing(6)};
  padding-right: ${(props) => props.theme.spacing(6)};
  justify-content: center;
  cursor: pointer;
  flex-grow: 0;

  ${(props) => props.theme.breakpoints.up("sm")} {
    min-height: 64px;
  }

  &:hover {
    background-color: ${(props) => props.theme.sidebar.header.background};
  }
`;

export type SidebarProps = {
  PaperProps: {
    style: {
      width: number;
    };
  };
  variant?: "permanent" | "persistent" | "temporary";
  open?: boolean;
  onClose?: () => void;
  items: {
    title: string;
    pages: SidebarItemsType[];
  }[];
  showFooter?: boolean;
};

const Sidebar: React.FC<SidebarProps> = ({
  items,
  showFooter = true,
  ...rest
}) => {
  return (
    <Drawer variant="permanent" {...rest}>
      <Brand
        component={NavLink}
        to="/"
        style={{
          backgroundColor: "#233044",
          alignItems: "center",
          display: "flex",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            color: "#fff",
            fontSize: "1.4rem",
          }}
        >
          <img
            src="/images/tum_logo.png"
            alt="logo"
            style={{ width: "55px", marginRight: "10px" }}
          />
        </Box>
      </Brand>
      <SidebarNav items={items} />
      {!!showFooter && <Footer />}
    </Drawer>
  );
};

export default Sidebar;
