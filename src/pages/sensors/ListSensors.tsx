import { useState, useEffect } from "react";
import axios from "axios";
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
import { useAppSelector, useIsOwner } from "../../hooks/hooks";
import DataTableCard from "../../components/DataGrid";
const ListSensors = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [sensors, setSensors] = useState<any[]>([]);
  const selectedGroupId = useAppSelector((state) => state.roles.selectedGroupId);
  const group = useAppSelector((state) =>
    state.roles.groups.find((g) => g?.group_name_id === selectedGroupId)
  );
  const isOwner = useIsOwner();

  const fetchSensors = () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
    const isDev = process.env.REACT_APP_IS_DEVELOPMENT === "true";
    axios
      .get(
        isDev
          ? `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Sensors`
          : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Sensors`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        if (res.status === 200 && res.data.value) {
          setSensors(res.data.value);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error Getting Sensors");
      });
  };

  const fetchFrostPort = async () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL;
    const group_id = localStorage.getItem("group_id");
    const email =
      localStorage.getItem("selected_others") === "true"
        ? localStorage.getItem("user_email")
        : userInfo?.preferred_username;

    await axios
      .post(
        `${backend_url}/frost-server`,
        { user_email: email, group_id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
    ReactGA.event(GAactionsSensors);

    if (frostServerPort !== null) {
      fetchSensors();
    } else {
      fetchFrostPort();
    }
  }, [frostServerPort]);

  // ✅ Columns (keeping full edit + delete logic)
  const columnDefs = [
    {
      headerName: "ID",
      field: "@iot.id",
      flex: 1,
      valueGetter: (params: any) => params.data["@iot.id"]
    },
    {
      headerName: "Name",
      field: "name",
      flex: 1,
      wrapText: true,
      autoHeight: true,
      cellStyle: { whiteSpace: "normal" }
    },
    {
      headerName: "Metadata",
      field: "metadata",
      flex: 1,
      wrapText: true,
      autoHeight: true,
      cellStyle: { whiteSpace: "normal" }
    },
    {
      headerName: "Description",
      field: "description",
      flex: 2,
      wrapText: true,
      autoHeight: true,
      cellStyle: { whiteSpace: "normal" }
    },
    {
      headerName: "Edit",
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
            if (!isOwner) return;
            Swal.fire({
              title: "Edit Sensor",
              html:
                `<div class="swal-input-row-with-label">` +
                `<label for="name">New Name</label>` +
                `<div class="swal-input-field">` +
                `<input id="name" class="swal2-input" placeholder="Enter new name" value="${params.data.name || ""}">` +
                `</div>` +
                `</div>` +
                `<div class="swal-input-row">` +
                `<label for="description">New Description</label>` +
                `<input id="description" class="swal2-input" placeholder="Enter new description" value="${params.data.description || ""}">` +
                `</div>` +
                `<div class="swal-input-row">` +
                `<label for="metadata">New Metadata</label>` +
                `<input id="metadata" class="swal2-input" placeholder="Enter new metadata" value="${params.data.metadata || ""}">` +
                `</div>`,
              showCancelButton: true,
              confirmButtonText: "Save",
              showLoaderOnConfirm: true,
              preConfirm: () => {
                const name = (document.getElementById("name") as HTMLInputElement).value;
                const description = (document.getElementById("description") as HTMLInputElement).value;
                const metadata = (document.getElementById("metadata") as HTMLInputElement).value;
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
                      url: `Sensors(${params.data["@iot.id"]})`,
                      FROST_PORT: frostServerPort,
                      body: { name, description, metadata },
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
                        if (sensor["@iot.id"] === params.data["@iot.id"]) {
                          sensor.name = name;
                          sensor.description = description;
                          sensor.metadata = metadata;
                        }
                        return sensor;
                      });
                      setSensors(newSensors);
                      Swal.fire("Success", "Sensor edited successfully!", "success");
                    } else {
                      Swal.fire("Oops...", "Something went wrong! Sensor not edited!", "error");
                    }
                  })
                  .catch(() => {
                    Swal.fire("Oops...", "Something went wrong! Sensor not edited!", "error");
                  });
              }
            });
          }}
        />
      ),
    },
    {
      headerName: "Delete",
      flex: 1,
      filter: false,
      cellRenderer: (params: any) => (
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
              title: `Are you sure you want to delete ${params.data.name}?`,
              text: "This action cannot be undone. Linked datastreams might break!",
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
                      url: `Sensors(${params.data["@iot.id"]})`,
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
                    Swal.fire("Success", "Sensor deleted successfully!", "success");
                    const newSensors = sensors.filter(
                      (sensor) => sensor["@iot.id"] !== params.data["@iot.id"]
                    );
                    setSensors(newSensors);
                  } else {
                    Swal.fire("Oops...", "Something went wrong! Sensor not deleted!", "error");
                  }
                } catch (error) {
                  Swal.fire("Oops...", "Something went wrong! Sensor not deleted!", "error");
                }
              }
            });
          }}
        />
      ),
    },
  ];

  return (
    <Dashboard>
      <ToastContainer position="bottom-right" autoClose={5000} theme="dark" />

      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" style={{ marginBottom: "10px" }}>
        <LinkCustom to="/">Data Space</LinkCustom>
        <LinkCustom to="/frost_entities">Data Items</LinkCustom>
        <Typography color="text.primary">Sensor Types</Typography>
      </Breadcrumbs>

      {/* Create Button */}
      {isOwner ? (
        <LinkCustom to="/sensors/store">
          <Button variant="contained" color="primary" style={{ marginBottom: "10px" }}>
            Create
          </Button>
        </LinkCustom>
      ) : (
        <Button variant="contained" color="primary" disabled style={{ marginBottom: "10px" }}>
          Create
        </Button>
      )}
      <DataTableCard title="Sensor Types" description="This page lists all sensor types available in the system. 
Each sensor defines how a measurement is made, including its metadata and description." columnDefs={columnDefs} rowData={sensors} />
    </Dashboard>
  );
};

export default ListSensors;
