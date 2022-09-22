import { useState, useEffect } from "react";
import axios from "axios";
import DataTable, { ExpanderComponentProps } from "react-data-table-component";
import ContentBar from "../components/ContentBar";
import { Button } from "@mui/material";
import LinkCustom from "../components/LinkCustom";
import CastIcon from "@mui/icons-material/Cast";
import LocationOnIcon from "@mui/icons-material/LocationOn";
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
        <b>Description: </b>
        {data.description}
      </div>
    );
  };

  return (
    <ContentBar>
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
