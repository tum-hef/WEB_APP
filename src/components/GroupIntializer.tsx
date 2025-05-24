import { useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";
import axios from "axios";
import { useAppDispatch } from "../hooks/hooks";
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
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/get_clients?user_id=${keycloak.tokenParsed.sub}`
      );

      if (res.status === 200 && res.data.success) {
        const { groups, clients } = res.data;

        dispatch(setGroups(groups));
        dispatch(setClients(clients));

        const savedGroupId = localStorage.getItem("group_id");
        const validGroup = groups.find((g: any) => g.group_name_id === savedGroupId);

        // Prioritize localStorage value if it's valid
        const finalGroupId = validGroup ? validGroup.group_name_id : groups[0]?.group_name_id;

        dispatch(setSelectedGroupId(finalGroupId));
        localStorage.setItem("group_id", finalGroupId);
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  fetchGroups();
}, [keycloak.authenticated, keycloak.tokenParsed?.sub]);


  return null;
};

export default GroupInitializer;
