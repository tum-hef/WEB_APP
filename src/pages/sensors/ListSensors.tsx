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
import ReactGA from "react-ga4";
import { GAactionsSensors } from "../../utils/GA";

const ListSensors = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [sensors, setSensors] = useState<any[]>([]);

  const fetchSensors = () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT; 
    const isDev = process.env.REACT_APP_IS_DEVELOPMENT === 'true';  
    console.log(backend_url);
    axios
      .get(isDev ?  `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Sensors`  : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Sensors`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.status === 200 && res.data.value) {
          console.log(res.data.value);
          setSensors(res.data.value);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error Getting Things");
      });
  };

  const fetchFrostPort = async () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL;
    const group_id = localStorage.getItem("group_id");
    const email =
    localStorage.getItem("selected_others") === "true"
      ? localStorage.getItem("user_email")
      : userInfo?.preferred_username;

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
  };

  useEffect(() => {
    ReactGA.event({
      category: GAactionsSensors.category,
      action: GAactionsSensors.action,
      label: GAactionsSensors.label,
    });

    if (frostServerPort !== null) {
      fetchSensors();
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
      width: "10%",
    },
    {
      name: "Metadata",
      selector: (row: any) => row.metadata,
      sortable: true,
      width: "10%",
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
              title: "Edit Sensor",
              html:
                `<div class="swal-input-row-with-label">` +
                `<label for="name">New Name</label>` +
                `<div class="swal-input-field">` +
                `<input id="name" class="swal2-input" placeholder="Enter the new Sensor name" value="${
                  row.name || ""
                }">` +
                `</div>` +
                `</div>` +
                `<div class="swal-input-row">` +
                `<label for="description">New Description</label>` +
                `<input id="description" class="swal2-input" placeholder="Enter the new Sensor description" value="${
                  row.description || ""
                }">` +
                `</div>` +
                `</div>` +
                `<div class="swal-input-row">` +
                `<label for="metadata">New metadata</label>` +
                `<input id="metadata" class="swal2-input" placeholder="Enter the new Sensor metadata" value="${
                  row.metadata || ""
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
                const metadata = (
                  document.getElementById("metadata") as HTMLInputElement
                ).value;
                if (!name) {
                  Swal.showValidationMessage("Please enter a Sensor name");
                } else {
                  return { name, description, metadata };
                }
              },
            }).then((result) => {
              if (result.isConfirmed) {
                const { name, description, metadata } = result.value as {
                  name: string;
                  description: string;
                  metadata: string;
                };
                axios
                  .post(
                    `${process.env.REACT_APP_BACKEND_URL}/update`,
                    {
                      url: `Sensors(${row["@iot.id"]})`,
                      FROST_PORT: frostServerPort,
                      body: {
                        name,
                        description,
                        metadata,
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
                      const newSensors = sensors.map((sensor) => {
                        if (sensor["@iot.id"] === row["@iot.id"]) {
                          sensor.name = name;
                          sensor.description = description;
                          sensor.metadata = metadata;
                        }
                        return sensor;
                      });
                      setSensors(newSensors);
                      Swal.fire({
                        icon: "success",
                        title: "Success",
                        text: "Sensor edited successfully!",
                      });
                    } else {
                      Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Something went wrong! Sensor not edited!",
                      });
                    }
                  })
                  .catch((error) => {
                    axios.post(
                      `http://localhost:4500/mutation_error_logs`,
                      {
                        keycloak_id: userInfo?.sub,
                        method: "UPDATE",
                        attribute: "Sensors",
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
                      text: "Something went wrong! Sensor not edited!",
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
              text: "You will not be able to recover this sensor! Linked datastream might become disfunctional!",
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
                      url: `Sensors(${row["@iot.id"]})`,
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
                      text: "Sensor deleted successfully!",
                    });
                    const newSensor = sensors.filter(
                      (sensor) => sensor["@iot.id"] !== row["@iot.id"]
                    );
                    setSensors(newSensor);
                  } else {
                    Swal.fire({
                      icon: "error",
                      title: "Oops...",
                      text: "Something went wrong! Sensor not deleted!",
                    });
                  }
                } catch (error) {
                  await axios.post(
                    `http://localhost:4500/mutation_error_logs`,
                    {
                      keycloak_id: userInfo?.sub,
                      method: "DELETE",
                      attribute: "Sensors",
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
                    text: "Something went wrong! Sensor not deleted!",
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
        <LinkCustom to="/frost_entities">Data Items</LinkCustom>
        <Typography color="text.primary">Sensor Types</Typography>
      </Breadcrumbs>

      <LinkCustom to="/sensors/store">
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
        title="Sensor Types"
        columns={columns}
        data={sensors}
        expandableRows
        expandableRowsComponent={ExpandedComponent}
        pagination={true}
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 15]}
      />
    </Dashboard>
  );
};

export default ListSensors;
