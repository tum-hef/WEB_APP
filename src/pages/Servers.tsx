import { Button } from "@mui/material";
import DataTable from "react-data-table-component";
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import LinkCustom from "../components/LinkCustom";
import Dashboard from "./Dashboard";
import axios from "axios";
import { useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";

export default function Servers() {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;
  const [projects, setProjects] = useState([
    {
      id: null,
      url: null,
    },
  ]);

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);

  const fetchData = async () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL;
    const email = userInfo?.preferred_username;
    await axios
      .get(`${backend_url}/frost-server?email=${email}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.status === 200 && res.data.PORT) {
          setFrostServerPort(res.data.PORT);
          const obj = [
            {
              id: res.data.PORT,
              url: res.data.PORT,
            },
          ];
          setProjects(obj);
        }
      });
  };

  useEffect(() => {
    fetchData();
    if (frostServerPort == null) {
      fetchData();
    }
  }, [frostServerPort]);

  let json_file = require("../utils/servers.json");
  const columns = [
    {
      name: "ID",
      selector: (row: any) => row.id,
      sortable: true,
    },

    {
      name: "URL",
      selector: (row: any) =>
        process.env.REACT_APP_BACKEND_URL_ROOT +
        ":" +
        row.url +
        "/FROST-Server/v1.0",
      sortable: true,
    },

    {
      name: "Devices",
      selector: (row: any) => (
        <LinkCustom to={`/devices`}>
          <Button variant="contained" color="primary">
            <DevicesOtherIcon />
          </Button>
        </LinkCustom>
      ),
      sortable: true,
    },
  ];

  // let new_array = Object.keys(json_file).map(function (key) {
  //   return json_file[key];
  // });

  return (
    // <ContentBar>
    <Dashboard>
      <DataTable
        title="Data Space"
        columns={columns}
        data={projects}
        pagination={true}
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 15]}
      />
    </Dashboard>
    // </ContentBar>
  );
}
