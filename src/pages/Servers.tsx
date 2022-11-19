import { Button } from "@mui/material";
import DataTable from "react-data-table-component";
import ContentBar from "../components/ContentBar";
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import LinkCustom from "../components/LinkCustom";
import Dashboard from "./Dashboard";

export default function Servers() {
  let json_file = require("../utils/servers.json");
  const columns = [
    {
      name: "ID",
      selector: (row: any) => row.id,
      sortable: true,
    },
    {
      name: "Client",
      selector: (row: any) => row.client,
      sortable: true,
    },
    {
      name: "URL",
      selector: (row: any) => row.url,
      sortable: true,
    },
    {
      name: "Description",
      selector: (row: any) => row.description,
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

  let new_array = Object.keys(json_file).map(function (key) {
    return json_file[key];
  });

  return (
    // <ContentBar>
    <Dashboard>
      <DataTable
        title="Projects"
        columns={columns}
        data={new_array}
        pagination={true}
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 15]}
      />
    </Dashboard>
    // </ContentBar>
  );
}
