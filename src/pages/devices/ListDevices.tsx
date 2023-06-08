import { useState, useEffect } from "react";
import axios from "axios";
import DataTable, { ExpanderComponentProps } from "react-data-table-component";
import { Breadcrumbs, Button, Typography } from "@mui/material";
import LinkCustom from "../../components/LinkCustom";

import Dashboard from "../../components/DashboardComponent";
import { useKeycloak } from "@react-keycloak/web";
import { ToastContainer, toast } from "react-toastify";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import Swal from "sweetalert2";
const Devices = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;
  console.log(token);

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
      width: "10%",
    },
    {
      name: "Name",
      selector: (row: any) => row.name,
      sortable: true,
      width: "20%",
    },
    {
      name: "Description",
      selector: (row: any) => row.description,
      sortable: true,
      width: "20%",
    },
    {
      name: "Edit",
      selector: (row: any) => (
        <EditOutlinedIcon
          style={{
            cursor: "pointer",
            color: "#233044",
          }}
          onClick={() => {
            Swal.fire({
              title: "Edit Device Description",
              input: "text",
              inputLabel: "New Device Description",
              inputPlaceholder: "Enter the new device description",
              inputValue: row.description,
              showCancelButton: true,
              confirmButtonText: "Save",
              showLoaderOnConfirm: true,
              preConfirm: (description) => {
                return description;
              },
            }).then((result) => {
              if (result.isConfirmed) {
                const newDescription = result.value;
                Swal.fire(`New device description: ${newDescription}`);
                const newDevices = devices.map((device) => {
                  if (device["@iot.id"] === row["@iot.id"]) {
                    device.description = newDescription;
                  }
                  return device;
                });
                setDevices(newDevices);
              }
            });
          }}
        />
      ),
      sortable: true,
      width: "20%",
    },
    {
      name: "Delete",
      selector: (row: any) => (
        <DeleteForeverOutlinedIcon
          style={{
            cursor: "pointer",
            color: "red",
          }}
          onClick={() => {
            Swal.fire({
              title: `Are you sure you want to delete ${row.name}?`,
              text: "You will not be able to recover this device!",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Yes, delete it!",
            }).then(async (result) => {
              if (result.isConfirmed) {
                try {
                  const response = await axios.delete(
                    `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Things(${row["@iot.id"]})`,
                    {
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );

                  if (response.status === 200) {
                    Swal.fire({
                      icon: "success",
                      title: "Success",
                      text: "Device deleted successfully!",
                    });
                    const newDevices = devices.filter(
                      (device) => device["@iot.id"] !== row["@iot.id"]
                    );
                    setDevices(newDevices);
                  } else {
                    Swal.fire({
                      icon: "error",
                      title: "Oops...",
                      text: "Something went wrong! Device not deleted!",
                    });
                  }
                } catch (error) {
                  Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Something went wrong! Device not deleted!",
                  });
                }
              }
            });
          }}
        />
      ),
      sortable: true,
      width: "20%",
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
          Stepper{" "}
        </Button>
      </LinkCustom>{" "}
      <LinkCustom to="/devices/store">
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
