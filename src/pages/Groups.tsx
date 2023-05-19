import { useState, useEffect } from "react";
import axios from "axios";
import IUserInfo from "../models/keycloak/UserInfo";
import { useKeycloak } from "@react-keycloak/web";
import DataTable from "react-data-table-component";
import ContentBar from "../components/ContentBar";
import Dashboard from "../components/DashboardComponent";

const Groups = () => {
  // PART 1

  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;

  // get keycloak ID user
  const userId = userInfo?.sub;

  // token get from keycloak
  const token = keycloak.token;

  const [groups, setGroups] = useState([]);
  console.log(userInfo?.preferred_username + " USERNAME" + userId);

  const getGroups = async () => {
    const response = await axios.get(
      `http://localhost:8080/admin/realms/keycloak-react-auth/users/${userId}/groups`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
    setGroups(response.data);
  };

  useEffect(() => {
    getGroups();
  }, []);

  console.log(groups);

  const columns = [
    {
      name: "ID",
      selector: (row: any) => row.id,
      sortable: true,
    },
    {
      name: "Name",
      selector: (row: any) => row.name,
      sortable: true,
    },
    {
      name: "Path",
      selector: (row: any) => row.path,
      sortable: true,
    },
  ];

  return (
    <Dashboard>
      <DataTable
        title="Groups"
        columns={columns}
        data={groups}
        pagination={true}
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 15]}
      />
    </Dashboard>
  );
};

export default Groups;
