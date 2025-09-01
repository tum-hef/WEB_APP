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

import { GAactionsObservationProperties } from "../../utils/GA";
import { useAppSelector, useIsOwner } from "../../hooks/hooks";
import DataTableCard from "../../components/DataGrid";
const ListObservationProperty = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;
  console.log(token);

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [observationProperty, setObservationProperty] = useState<any[]>([]);
  const selectedGroupId = useAppSelector(state => state.roles.selectedGroupId);
  const group = useAppSelector(state =>
    state.roles.groups.find(g => g?.group_name_id === selectedGroupId)
  );
  const isOwner = useIsOwner();


  const fetchObservationProperty = () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
    console.log(backend_url);
    const isDev = process.env.REACT_APP_IS_DEVELOPMENT === 'true';
    axios
      .get(
        isDev ? `${backend_url}:${frostServerPort}/FROST-Server/v1.0/ObservedProperties` : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/ObservedProperties`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        if (res.status === 200 && res.data.value) {
          console.log(res.data.value);
          setObservationProperty(res.data.value);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error Getting Measurement Property");
      });
  };

  const fetchFrostPort = async () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL;
    const email =
      localStorage.getItem("selected_others") === "true"
        ? localStorage.getItem("user_email")
        : userInfo?.preferred_username;
    const group_id = localStorage.getItem("group_id");
    await axios.post(
      `${backend_url}/frost-server`,
      { user_email: email, group_id: group_id }, // ✅ Adding group_id to the request body
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Added Authorization header
        },
      }
    )
      .then((res) => {
        if (res.status === 200 && res.data.PORT) {
          setFrostServerPort(res.data.PORT);
        }
      });
  };

  useEffect(() => {
    ReactGA.event({
      category: GAactionsObservationProperties.category,
      action: GAactionsObservationProperties.action,
      label: GAactionsObservationProperties.label,
    });

    if (frostServerPort !== null) {
      fetchObservationProperty();
    } else {
      fetchFrostPort();
    }
  }, [frostServerPort]);

  const columns = [
    {
      headerName: "ID",
      field: "@iot.id",
      flex: 1,
      valueGetter: (params: any) => params.data["@iot.id"]
    },
    {
      headerName: "Name",
      field: "name",
      width: 200,
      sortable: true,
      filter: "agTextColumnFilter",
    },
    {
      headerName: "Description",
      field: "description",
      width: 250,
      sortable: true,
      filter: "agTextColumnFilter",
      wrapText: true,
      autoHeight: true,
      cellStyle: { whiteSpace: "normal" },
    },

    {
      headerName: "Definition",
      field: "definition",
      width: 250,
      sortable: true,
      filter: "agTextColumnFilter",
      wrapText: true,
      autoHeight: true,
      cellStyle: { whiteSpace: "normal" },
    },
    {
      headerName: "Edit",
      name: "Edit",
      flex: 1,
      filter: false,
      cellRenderer: (params: any) => (
        <EditOutlinedIcon
          style={{
            cursor: isOwner ? "pointer" : "not-allowed",
            color: isOwner ? "red" : "gray",
            opacity: isOwner ? 1 : 0.4,
            pointerEvents: isOwner ? "auto" : "none",
          }}
          onClick={() => {
            const row = params?.data;
            if (!isOwner) return;
            Swal.fire({
              title: "Edit Measurement Property",
              html:
                `<div class="swal-input-row-with-label">` +
                `<label for="name">New Name</label>` +
                `<div class="swal-input-field">` +
                `<input id="name" class="swal2-input" placeholder="Enter the new Measurement Property name" value="${row.name || ""
                }">` +
                `</div>` +
                `</div>` +
                `<div class="swal-input-row">` +
                `<label for="description">New Description</label>` +
                `<input id="description" class="swal2-input" placeholder="Enter the new Measurement Property description" value="${row.description || ""
                }">` +
                `</div>` +
                `</div>` +
                `<div class="swal-input-row">` +
                `<label for="definition">New definition</label>` +
                `<input id="definition" class="swal2-input" placeholder="Enter the new Measurement Property definition" value="${row.definition || ""
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
                const definition = (
                  document.getElementById("definition") as HTMLInputElement
                ).value;
                if (!name) {
                  Swal.showValidationMessage(
                    "Please enter a Measurement Property name"
                  );
                } else {
                  return { name, description, definition };
                }
              },
            }).then((result) => {
              if (result.isConfirmed) {
                const { name, description, definition } = result.value as {
                  name: string;
                  description: string;
                  definition: string;
                };
                axios
                  .post(
                    `${process.env.REACT_APP_BACKEND_URL}/update`,
                    {
                      url: `ObservedProperties(${row["@iot.id"]})`,
                      FROST_PORT: frostServerPort,
                      body: {
                        name,
                        description,
                        definition,
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
                      const observedProperties = observationProperty.map(
                        (observed_property) => {
                          if (observed_property["@iot.id"] === row["@iot.id"]) {
                            observed_property.name = name;
                            observed_property.description = description;
                            observed_property.definition = definition;
                          }
                          return observed_property;
                        }
                      );
                      setObservationProperty(observedProperties);
                      Swal.fire({
                        icon: "success",
                        title: "Success",
                        text: "Measurement Property edited successfully!",
                      });
                    } else {
                      Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Something went wrong! Measurement Property not edited!",
                      });
                    }
                  })
                  .catch((error) => {
                    axios.post(
                      `http://localhost:4500/mutation_error_logs`,
                      {
                        keycloak_id: userInfo?.sub,
                        method: "UPDATE",
                        attribute: "Measurement Property",
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
                      text: "Something went wrong! Measurement Property not edited!",
                    });
                  });
              }
            });
          }}
        />
      ),
    },
    {

      headerName: "Edit",
      name: "Delete",
      cellRenderer: (params: any) => (
        <DeleteForeverOutlinedIcon
          style={{
            cursor: isOwner ? "pointer" : "not-allowed",
            color: isOwner ? "red" : "gray",
            opacity: isOwner ? 1 : 0.4,
            pointerEvents: isOwner ? "auto" : "none",
          }}
          onClick={() => {
            const row = params?.data;
            if (!isOwner) return;
            Swal.fire({
              title: `Are you sure you want to delete ${row.name}?`,
              text: "You will not be able to recover this Measurement Property! Linked datastream might become disfunctional!",
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
                      url: `ObservedProperties(${row["@iot.id"]})`,
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
                      text: "Measurement Property deleted successfully!",
                    });
                    const newObservationProperty = observationProperty.filter(
                      (observation_property) =>
                        observation_property["@iot.id"] !== row["@iot.id"]
                    );
                    setObservationProperty(newObservationProperty);
                  } else {
                    Swal.fire({
                      icon: "error",
                      title: "Oops...",
                      text: "Something went wrong! Measurement Property not deleted!",
                    });
                  }
                } catch (error) {
                  await axios.post(
                    `http://localhost:4500/mutation_error_logs`,
                    {
                      keycloak_id: userInfo?.sub,
                      method: "DELETE",
                      attribute: "Measurement Property",
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
                    text: "Something went wrong! Measurement Property not deleted!",
                  });
                }
              }
            });
          }}
        />
      ),
      flex: 1,
      filter: false,
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
      <ToastContainer position="bottom-right" autoClose={5000} theme="dark" />

      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" style={{ marginBottom: "10px" }}>
        <LinkCustom to="/">Data Space</LinkCustom>
        <LinkCustom to="/frost_entities">Data Items</LinkCustom>
        <Typography color="text.primary">Measurement Property</Typography>
      </Breadcrumbs>

      {/* Create Button */}
      {isOwner ? (
        <LinkCustom to="/observation_properties/store">
          <Button variant="contained" color="primary" style={{ marginBottom: "10px" }}>
            Create
          </Button>
        </LinkCustom>
      ) : (
        <Button variant="contained" color="primary" disabled style={{ marginBottom: "10px" }}>
          Create
        </Button>
      )}
      <DataTableCard title="Measurement Property" description="This page lists all measurement properties (observed properties) used by datastreams. 
A measurement property describes what is being measured, such as temperature, humidity, or pressure, 
and may include a definition or reference for clarity and standardization." columnDefs={columns} rowData={observationProperty} />
    </Dashboard>
  );
};

export default ListObservationProperty;
