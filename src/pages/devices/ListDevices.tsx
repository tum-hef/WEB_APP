import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable, { ExpanderComponentProps } from "react-data-table-component";
import { Breadcrumbs, Button, Typography } from "@mui/material";
import LinkCustom from "../../components/LinkCustom";

import Dashboard from "../../components/DashboardComponent";
import { useKeycloak } from "@react-keycloak/web";
import { ToastContainer } from "react-toastify";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import Swal from "sweetalert2";
import MapIcon from "@mui/icons-material/Map";
import { GAactionsDevices } from "../../utils/GA";
import ReactGA from "react-ga4";
import { useAppSelector, useIsOwner } from "../../hooks/hooks"; 

const Devices = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const selectedGroupId = useAppSelector(state => state.roles.selectedGroupId);
const group = useAppSelector(state =>
  state.roles.groups.find(g => g?.group_name_id === selectedGroupId)
);
  const isOwner = useIsOwner();

  const fetchThings = () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT; 
    const isDev = process.env.REACT_APP_IS_DEVELOPMENT === 'true';  
    axios
      .get( isDev  ?  `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Things` :  `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Things`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.status === 200 && res.data.value) {
          const devices = res.data.value;
          // Fetch and associate locations with each device
          setDevices(devices);
        }
      });
  };

  // const fetchLocations = async (devices: any) => {
  //   for (const device of devices) {
  //     const locationLink = device["Locations@iot.navigationLink"];
  //     try {
  //       const response = await axios.get(locationLink, {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       if (response.status === 200 && response.data) {
  //         // Fetching the location data is in the 'value' property
  //         const locations = response.data.value;

  //         // Find the location with matching @iot.id
  //         const matchingLocation = locations.find(
  //           (location: any) => location["@iot.id"] === device["@iot.id"]
  //         );

  //         if (matchingLocation) {
  //           // Store the matching location inside the device object
  //           device.location = matchingLocation;
  //           setDevices([...devices]);
  //           console.log(devices);
  //         }
  //       }
  //     } catch (error) {
  //       console.error(
  //         `Error fetching location for device ${device["@iot.id"]}: ${error}`
  //       );
  //     }
  //   }
  // };

  const fetchFrostPort = async () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL;

    // Determine email based on the "other group" selection
    const email =
      localStorage.getItem("selected_others") === "true"
        ? localStorage.getItem("user_email")
        : userInfo?.preferred_username;
    const group_id = localStorage.getItem("group_id");

    if (email) {
      await axios.post(
        `${backend_url}/frost-server`,
        { user_email: email, group_id: group_id }, // ✅ Adding group_id to the request body
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Added Authorization header
          },
        }
      ).then((res) => {
          if (res.status === 200 && res.data.PORT) {
            setFrostServerPort(res.data.PORT);
          }
        });
    }
  };
  useEffect(() => {
    ReactGA.event({
      category: GAactionsDevices.category,
      action: GAactionsDevices.action,
      label: GAactionsDevices.label,
    });

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
      width: "15%",
    },
    {
      name: "Description",
      selector: (row: any) => row.description,
      sortable: true,
      width: "20%",
    },
    {
      name: "Datastreams",
      selector: (row: any) => (
        <LinkCustom
          style={{
            color: "#233044",
            textDecoration: "none",
          }}
          to={`/devices/${row["@iot.id"]}/datastreams`}
        >
          <FolderSpecialIcon />
        </LinkCustom>
      ),
      sortable: true,
      width: "10%",
    },
    {
      name: "Edit",
      selector: (row: any) => (
        <EditOutlinedIcon
          style={{
            cursor: isOwner ? "pointer" : "not-allowed",
            color: isOwner ? "red" : "gray",
            opacity: isOwner ? 1 : 0.4,
            pointerEvents: isOwner ? "auto" : "none",
          }}
          onClick={() => { 
            if (!isOwner) return;
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
                  .post(
                    `${process.env.REACT_APP_BACKEND_URL}/update`,
                    {
                      url: `Things(${row["@iot.id"]})`,
                      FROST_PORT: frostServerPort,
                      body: {
                        name,
                        description,
                      },
                      keycloak_id: userInfo?.sub,
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
                    axios.post(
                      `http://localhost:4500/mutation_error_logs`,
                      {
                        keycloak_id: userInfo?.sub,
                        method: "UPDATE",
                        attribute: "Devices",
                        attribute_id: row["@iot.id"],
                        frost_port: frostServerPort,
                      },
                      {
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${keycloak?.token}`,
                        },
                      }
                    );
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
      width: "10%",
    },
    {
      name: "Delete",
      selector: (row: any) => (
        <DeleteForeverOutlinedIcon 
          style={{
            cursor: isOwner ? "pointer" : "not-allowed",
    color: isOwner ? "red" : "gray",
    opacity: isOwner ? 1 : 0.4,
    pointerEvents: isOwner ? "auto" : "none",
          }}
          onClick={() => { 
            if (!isOwner) return; 
            Swal.fire({
              title: `Are you sure you want to delete ${row.name}?`,
              text: "You will not be able to recover this device! Linked datastream might become disfunctional!",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Yes, delete it!",
            }).then(async (result) => {
              if (result.isConfirmed) {
                try {
                  const response = await axios.post(
                    `${process.env.REACT_APP_BACKEND_URL}/delete`,
                    {
                      url: `Things(${row["@iot.id"]})`,
                      FROST_PORT: frostServerPort,
                      keycloak_id: userInfo?.sub,
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
                  axios.post(
                    `http://localhost:4500/mutation_error_logs`,
                    {
                      keycloak_id: userInfo?.sub,
                      method: "DELETE",
                      attribute: "Devices",
                      attribute_id: row["@iot.id"],
                      frost_port: frostServerPort,
                    },
                    {
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${keycloak?.token}`,
                      },
                    }
                  );

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
      width: "10%",
    },
    {
      name: "Location on Map",
      selector: (row: any) => (
        <LinkCustom
          style={{
            color: "#233044",
            textDecoration: "none",
          }}
          to={`/locations/${row["@iot.id"]}`}
        >
          <MapIcon />
        </LinkCustom>
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
        <LinkCustom to="/frost_entities">Data Items</LinkCustom>
        <Typography color="text.primary">Devices</Typography>
      </Breadcrumbs>
      {isOwner ? (
  <LinkCustom to="/devices/store">
    <Button
      variant="contained"
      color="primary"
      style={{ marginBottom: "10px" }}
    >
      Create
    </Button>
  </LinkCustom> ): 
  <Button 
  disabled={true}
  variant="contained"
  color="primary"
  style={{ marginBottom: "10px" }}
>
  Create
</Button>
}
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
