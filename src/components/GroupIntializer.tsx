import { useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";
import axios from "axios";
import { useAppDispatch } from "../hooks/hooks";
import type { Group } from "../store/types";
import {
  setGroups,
  setClients,
  setSelectedGroupId,
} from "../store/rolesSlice";

const GroupInitializer = () => {
  const dispatch = useAppDispatch();
  const { keycloak } = useKeycloak();

useEffect(() => {
  const fetchGroups = async () => {
    if (!keycloak.authenticated || !keycloak.tokenParsed?.sub) return;

    try {
      const userEmail =
        keycloak.tokenParsed?.email || keycloak.tokenParsed?.preferred_username;
      if (!userEmail) return;

      const [groupsRes, clientsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/groups?email=${userEmail}`),
        axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/get_clients?user_id=${keycloak.tokenParsed.sub}`
        ),
      ]);

      const normalizeRole = (value: any): Group["role"] => {
        if (value === "owner" || value === "editor" || value === "reader") {
          return value;
        }
        return "reader";
      };

      const reduxGroups: Group[] = Array.isArray(groupsRes.data)
        ? groupsRes.data.map((g: any) => ({
            id: String(g?.id ?? g?.keycloak_group_id ?? ""),
            group_name_id: String(g?.keycloak_group_id ?? g?.group_name_id ?? ""),
            parent_group_id: g?.parent_group_id ?? null,
            project_name: g?.name ?? g?.project_name ?? null,
            project_description: g?.description ?? g?.project_description ?? null,
            attributes: g?.attributes ?? {},
            permissions: Array.isArray(g?.permissions) ? g.permissions : [],
            role: g?.is_owner ? "owner" : normalizeRole(g?.role),
          }))
        : [];

      dispatch(setGroups(reduxGroups));

      if (clientsRes.status === 200 && clientsRes.data?.success) {
        dispatch(setClients(clientsRes.data.clients));
      }

      const savedGroupId = localStorage.getItem("group_id");
      const validGroup = reduxGroups.find((g) => g.group_name_id === savedGroupId);
      const wasRemovedFromSelectedGroup = Boolean(savedGroupId) && !validGroup;

      // Prioritize localStorage value if it's valid
      const finalGroupId = validGroup ? validGroup.group_name_id : reduxGroups[0]?.group_name_id || "";

      if (wasRemovedFromSelectedGroup) {
        localStorage.removeItem("group_id");
        dispatch(setSelectedGroupId(""));
        window.location.assign("/dashboard");
        return;
      }

      dispatch(setSelectedGroupId(finalGroupId || ""));
      if (finalGroupId) {
        localStorage.setItem("group_id", finalGroupId);
      } else {
        localStorage.removeItem("group_id");
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  fetchGroups();

  const handleFocusRefresh = () => {
    fetchGroups();
  };

  const handleVisibilityRefresh = () => {
    if (document.visibilityState === "visible") {
      fetchGroups();
    }
  };

  window.addEventListener("focus", handleFocusRefresh);
  document.addEventListener("visibilitychange", handleVisibilityRefresh);

  return () => {
    window.removeEventListener("focus", handleFocusRefresh);
    document.removeEventListener("visibilitychange", handleVisibilityRefresh);
  };
}, [keycloak.authenticated, keycloak.tokenParsed?.sub]);


  return null;
};

export default GroupInitializer;
