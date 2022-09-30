import { useState, useEffect } from "react";
import axios from "axios";
import DataTable, { ExpanderComponentProps } from "react-data-table-component";
import ContentBar from "../components/ContentBar";
import { Button } from "@mui/material";
import LinkCustom from "../components/LinkCustom";
import CastIcon from "@mui/icons-material/Cast";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DownloadIcon from "@mui/icons-material/Download";
const Devices = () => {
  const [devices, setDevices] = useState<any[]>([]);

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
      width: "5%",
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
      width: "40%",
    },
    {
      name: "Datastreams",
      sortable: true,
      selector: (row: any) => (
        <LinkCustom to={`/datastreams/${row["@iot.id"]}`}>
          <Button variant="contained" color="primary">
            <CastIcon />
          </Button>
        </LinkCustom>
      ),
    },
    {
      name: "Location",
      sortable: true,
      selector: (row: any) => (
        <LinkCustom to={`/location/${row["@iot.id"]}`}>
          <Button variant="contained" color="primary">
            <LocationOnIcon />
          </Button>
        </LinkCustom>
      ),
    },
    {
      name: "Download as JSON",
      sortable: true,
      selector: (row: any) => (
        <Button
          variant="contained"
          color="primary"
          href={`data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify({
              id: row["@iot.id"],
              name: row.name,
              description: row.description,
            })
          )}`}
          download="device.json"
        >
          <DownloadIcon />
        </Button>
      ),
    },
  ];

  const ExpandedComponent: React.FC<ExpanderComponentProps<any>> = ({
    data,
  }) => {
    return (
      // add div ceneter
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "10px",
        }}
      >
        <div
          style={{
            margin: "20px",
          }}
        >
          <b>Name: </b>
          {data.name}
        </div>
        <div>
          <b>Description: </b>
          {data.description}
        </div>
      </div>
    );
  };

  return (
    <ContentBar>
      <LinkCustom to="/devices/store">
        <Button variant="contained" color="primary">
          Create Device{" "}
        </Button>
      </LinkCustom>

      <DataTable
        title="Devices"
        columns={columns}
        data={devices}
        expandableRows
        expandableRowsComponent={ExpandedComponent}
        pagination={true}
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 15]}
      />
    </ContentBar>
  );
};

export default Devices;
