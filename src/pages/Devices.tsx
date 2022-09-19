import { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import ContentBar from "../components/ContentBar";
import { Button } from "@mui/material";
import LinkCustom from "../components/LinkCustom";
import CastIcon from "@mui/icons-material/Cast";
const Devices = () => {
  const [devices, setDevices] = useState([]);

  const getThings = async () => {
    try {
      const response = await axios.get(
        "https://iot.hef.tum.de/frost/v1.0/Things"
      );
      console.log(response.data);
      setDevices(response.data.value);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getThings();
  }, []);

  const columns = [
    {
      name: "ID",
      selector: (row: any) => `${row["@iot.id"]}`,
      sortable: true,
    },
    {
      name: "Name",
      selector: (row: any) => row.name,
      sortable: true,
    },
    {
      name: "Description",
      selector: (row: any) => row.description,
      sortable: true,
    },
    {
      name: "Datastreams",
      selector: (row: any) => (
        <LinkCustom to={`/datastreams/${row["@iot.id"]}`}>
          <Button variant="contained" color="primary">
            <CastIcon />
          </Button>
        </LinkCustom>
      ),
      sortable: true,
    },
  ];

  return (
    <ContentBar>
      <DataTable
        title="Devices"
        columns={columns}
        data={devices}
        pagination={true}
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 15]}
      />
    </ContentBar>
  );
};

export default Devices;
