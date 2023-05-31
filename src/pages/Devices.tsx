import { useState, useEffect } from "react";
import axios from "axios";
import DataTable, { ExpanderComponentProps } from "react-data-table-component";
import { Breadcrumbs, Button, Typography } from "@mui/material";
import LinkCustom from "../components/LinkCustom";
import CastIcon from "@mui/icons-material/Cast";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DownloadIcon from "@mui/icons-material/Download";
import Dashboard from "../components/DashboardComponent";
import { useKeycloak } from "@react-keycloak/web";
import { ToastContainer, toast } from "react-toastify";

const Devices = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [devices, setDevices] = useState<any[]>([]);

  const fetchThings = () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
    console.log(backend_url);
    axios
      .get(`${backend_url}:${frostServerPort}/FROST-Server/v1.0/Things`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.status === 200 && res.data.value) {
          console.log(res.data.value);
          setDevices(res.data.value);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error Getting Things");
      });
  };

  const fetchFrostPort = async () => {
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
        }
      });
  };

  useEffect(() => {
    if (frostServerPort !== null) {
      fetchThings();
    } else {
      fetchFrostPort();
    }
  }, [frostServerPort]);

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
      <div
        style={{
          margin: "10px",
        }}
      >
        <div>
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
    <Dashboard>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Breadcrumbs
        aria-label="breadcrumb"
        style={{
          marginBottom: "10px",
        }}
      >
        <LinkCustom to="/data-spaces">Data Streams</LinkCustom>
        <Typography color="text.primary">Devices</Typography>
      </Breadcrumbs>

      <LinkCustom to="/stepper">
        <Button
          variant="contained"
          color="primary"
          style={{
            marginBottom: "10px",
          }}
        >
          Create{" "}
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
    </Dashboard>
  );
};

export default Devices;
