import React, { useState, useEffect } from "react";
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
              title: "Edit Device",
              html:
                `<div class="swal-input-row-with-label">` +
                `<label for="name">New Name</label>` +
                `<div class="swal-input-field">` +
                `<input id="name" class="swal2-input" placeholder="Enter the new device name" value="${
                  row.name || ""
                }">` +
                `</div>` +
                `</div>` +
                `<div class="swal-input-row">` +
                `<label for="description">New Description</label>` +
                `<input id="description" class="swal2-input" placeholder="Enter the new device description" value="${
                  row.description || ""
                }">` +
                `</div>`,
              showCancelButton: true,
              confirmButtonText: "Save",
              showLoaderOnConfirm: true,
              preConfirm: () => {
                const name = (
                  document.getElementById("name") as HTMLInputElement
                ).value;
                const description = (
                  document.getElementById("description") as HTMLInputElement
                ).value;
                if (!name) {
                  Swal.showValidationMessage("Please enter a device name");
                } else {
                  return { name, description };
                }
              },
            }).then((result) => {
              if (result.isConfirmed) {
                const { name, description } = result.value as {
                  name: string;
                  description: string;
                };
                axios
                  .patch(
                    `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Things(${row["@iot.id"]})`,
                    {
                      name: name,
                      description: description,
                    },
                    {
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${keycloak?.token}`,
                      },
                    }
                  )
                  .then((response) => {
                    if (response.status === 200) {
                      const newDevices = devices.map((device) => {
                        if (device["@iot.id"] === row["@iot.id"]) {
                          device.name = name;
                          device.description = description;
                        }
                        return device;
                      });
                      setDevices(newDevices);
                      Swal.fire({
                        icon: "success",
                        title: "Success",
                        text: "Device edited successfully!",
                      });
                    } else {
                      Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Something went wrong! Device not edited!",
                      });
                    }
                  })
                  .catch((error) => {
                    Swal.fire({
                      icon: "error",
                      title: "Oops...",
                      text: "Something went wrong! Device not edited!",
                    });
                  });
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
                  const response = await axios.post(
                    `${process.env.REACT_APP_BACKEND_URL}delete`,
                    {
                      url: `Things(${row["@iot.id"]})`,
                      FROST_PORT: frostServerPort,
                    },
                    {
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `${token}`,
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
        <LinkCustom to="/">Data Space</LinkCustom>
        <LinkCustom to="/frost_entities">Frost Entities</LinkCustom>
        <Typography color="text.primary">Devices</Typography>
      </Breadcrumbs>
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
