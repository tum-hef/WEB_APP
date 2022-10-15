import React from "react";
import { matchPath } from "react-router-dom";

import { SidebarItemsType } from "../types/sidebar";
import SidebarNavListItem from "./SidebarNavListItem";
import SidebarNavList from "./SidebarNavList";

type ReduceChildRoutesProps = {
  depth: number;
  page: SidebarItemsType;
  items: JSX.Element[];
  currentRoute: string;
};

const reduceChildRoutes = (props: ReduceChildRoutesProps) => {
  const { items, page, depth, currentRoute } = props;

  let href = page.href;

  items.push(
    <SidebarNavListItem
      depth={depth}
      href={page.href}
      icon={page.icon}
      key={page.title}
      badge={page.badge}
      title={page.title}
    />
  );

  return items;
};

export default reduceChildRoutes;
