import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import {
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from "@mui/material";
import LinkCustom from "../../components/LinkCustom";
import Dashboard from "../../components/DashboardComponent";
import { useKeycloak } from "@react-keycloak/web";
import { ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import MapIcon from "@mui/icons-material/Map";
import TableChartIcon from "@mui/icons-material/TableChart";
import { useAppSelector, useIsOwner } from "../../hooks/hooks";
import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import DataTableCardV2 from "../../components/DataGridServerSide";
import EntityFormModal from "../../components/EntityFormModal";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";
import { editDeviceValidationSchema } from "../../formik/validation_schema";

const MapBoundsFitter = ({ geojson }: { geojson: any }) => {
  const map = useMap();

  useEffect(() => {
    if (geojson && geojson.features && geojson.features.length > 0) {
      try {
        const geojsonLayer = L.geoJSON(geojson);
        const bounds = geojsonLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (err) {
        console.error("Error fitting bounds:", err);
      }
    }
  }, [geojson, map]);

  return null;
};

const Devices = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;

  const customMarkerIcon = new L.Icon({
    iconUrl: require("../../assets/pinpoint.png"),
    iconSize: [30, 30],
  });

  const [viewMode, setViewMode] = useState<"table" | "map">("table");
  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [mapGeoJson, setMapGeoJson] = useState<any>(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [filterQuery, setFilterQuery] = useState("");
  const [sortQuery, setSortQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLinks, setPageLinks] = useState<{ [key: number]: string }>({});
  const [editOpen, setEditOpen] = useState(false);
  const [editingDeviceId, setEditingDeviceId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<any | null>(null);
  const { isOwner, role } = useIsOwner();
  const canDelete = role === "owner";
  const primaryButtonSx = {
    backgroundColor: "rgb(35, 48, 68)",
    "&:hover": { backgroundColor: "rgb(26, 36, 51)" },
  };
  const cancelButtonSx = {
    backgroundColor: "#6e7881",
    color: "#ffffff",
    borderColor: "#6e7881",
    "&:hover": { backgroundColor: "#5f6870", borderColor: "#5f6870" },
  };

  const editFormik = useFormik({
    initialValues: { name: "", description: "" },
    validationSchema: editDeviceValidationSchema,
    onSubmit: async (values) => {
      if (!editingDeviceId) return;
      try {
        setSaving(true);
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/update`,
          {
            url: `Things(${editingDeviceId})`,
            FROST_PORT: frostServerPort,
            body: { name: values.name, description: values.description },
            keycloak_id: userInfo?.sub,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${keycloak?.token}`,
            },
          }
        );
        if (response.status === 200) {
          const newDevices = devices.map((device) =>
            device["@iot.id"] === editingDeviceId
              ? { ...device, name: values.name, description: values.description }
              : device
          );
          setDevices(newDevices);
          setEditOpen(false);
          setEditingDeviceId(null);
          Swal.fire({ icon: "success", title: "Success", text: "Device edited successfully!" });
        } else {
          Swal.fire({ icon: "error", title: "Oops...", text: "Something went wrong! Device not edited!" });
        }
      } catch {
        Swal.fire({ icon: "error", title: "Oops...", text: "Something went wrong! Device not edited!" });
      } finally {
        setSaving(false);
      }
    },
  });

  const fetchThings = async (
    newPage = 0,
    newPageSize = pageSize,
    filter = filterQuery,
    sort = sortQuery
  ) => {
    if (frostServerPort === null) return;
    setLoading(true);

    const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
    const isDev = process.env.REACT_APP_IS_DEVELOPMENT === "true";

    let url = isDev
      ? `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Things?$expand=Locations&$count=true`
      : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Things?$expand=Locations&$count=true`;

    if (pageLinks[newPage]) {
      url = pageLinks[newPage];
    }
    try {
      const res = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params: !pageLinks[newPage] && {
          $top: newPageSize,
          $skip: newPage * newPageSize,
          $count: true,
          ...(filter && { $filter: filter }),
          ...(sort && { $orderby: sort }),
        },
      });

      setDevices(res.data.value ?? []);
      if (res.data["@iot.count"]) setTotalRows(res.data["@iot.count"]);
      if (res.data["@iot.nextLink"]) {
        setPageLinks((prev) => ({
          ...prev,
          [newPage + 1]: res.data["@iot.nextLink"],
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFrostPort = async () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL;
    const email =
      localStorage.getItem("selected_others") === "true"
        ? localStorage.getItem("user_email")
        : userInfo?.preferred_username;
    const group_id = localStorage.getItem("group_id");
    const res = await axios.post(
      `${backend_url}/frost-server`,
      { user_email: email, group_id },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (res.status === 200 && res.data.PORT) {
      setFrostServerPort(res.data.PORT);
    }
  };

  useEffect(() => {
    if (frostServerPort !== null) {
      fetchThings(page, pageSize);
    } else {
      fetchFrostPort();
    }
  }, [frostServerPort]);

  const fetchGeoJson = async () => {
    if (frostServerPort === null) return;
    setMapLoading(true);
    const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
    const isDev = process.env.REACT_APP_IS_DEVELOPMENT === "true";
    let url = isDev
      ? `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Things?$expand=Locations&$format=geojson&$top=1000`
      : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Things?$expand=Locations&$format=geojson&$top=1000`;

    try {
      const res = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setMapGeoJson(res.data);
    } catch (err) {
      console.error("Error fetching geojson:", err);
    } finally {
      setMapLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === "map" && frostServerPort !== null && !mapGeoJson) {
      fetchGeoJson();
    }
  }, [viewMode, frostServerPort]);

  const openEditDialog = useCallback(
    (row: any) => {
      setEditingDeviceId(row?.["@iot.id"]);
      editFormik.setValues({
        name: row?.name || "",
        description: row?.description || "",
      });
      setEditOpen(true);
    },
    [editFormik.setValues]
  );

  const openDeleteDialog = useCallback((row: any) => {
    setDeviceToDelete(row);
    setDeleteOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    if (deleting) return;
    setDeleteOpen(false);
    setDeviceToDelete(null);
  }, [deleting]);

  const confirmDeleteDevice = useCallback(async () => {
    if (!deviceToDelete) return;

    try {
      setDeleting(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/delete`,
        {
          url: `Things(${deviceToDelete["@iot.id"]})`,
          FROST_PORT: frostServerPort,
          keycloak_id: userInfo?.sub,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        Swal.fire({ icon: "success", title: "Success", text: "Device deleted successfully!" });
        setDevices((prev) => prev.filter((device) => device["@iot.id"] !== deviceToDelete["@iot.id"]));
      } else {
        Swal.fire({ icon: "error", title: "Oops...", text: "Something went wrong! Device not deleted!" });
      }
    } catch {
      axios.post(
        `http://localhost:4500/mutation_error_logs`,
        {
          keycloak_id: userInfo?.sub,
          method: "DELETE",
          attribute: "Devices",
          attribute_id: deviceToDelete["@iot.id"],
          frost_port: frostServerPort,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Swal.fire({ icon: "error", title: "Oops...", text: "Something went wrong! Device not deleted!" });
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      setDeviceToDelete(null);
    }
  }, [deviceToDelete, frostServerPort, token, userInfo?.sub]);

  const columnDefs = useMemo(() => [
    {
      headerName: "ID",
      field: "@iot.id",
      filter: "agTextColumnFilter",
      minWidth: 100,
      autoHeight: false,
      wrapText: false,
      cellClass: "ag-center-cell",
      valueGetter: (params: any) => params.data["@iot.id"],
    },
    {
      headerName: "Name",
      field: "name",
      filter: "agTextColumnFilter",
      minWidth: 200,
      autoHeight: false,
      wrapText: false,
      cellClass: "ag-center-cell",
    },
    {
      headerName: "Description",
      field: "description",
      filter: "agTextColumnFilter",
      flex: 1,
      autoHeight: false,
      wrapText: false,
      cellClass: "ag-center-cell",
    },
    {
      headerName: "Datastreams",
      filter: false,
      minWidth: 130,
      cellClass: "ag-center-cell",
      cellRenderer: (params: any) => (
        <LinkCustom to={`/devices/${params.data["@iot.id"]}/datastreams`}>
          <FolderSpecialIcon />
        </LinkCustom>
      ),
    },
    {
      headerName: "Edit",
      filter: false,
      minWidth: 100,
      cellClass: "ag-center-cell",
      cellRenderer: (params: any) => {
        const row = params.data;
        return (
          <EditOutlinedIcon
            style={{
              cursor: isOwner ? "pointer" : "not-allowed",
              color: isOwner ? "red" : "gray",
              opacity: isOwner ? 1 : 0.4,
              pointerEvents: isOwner ? "auto" : "none",
            }}
            onClick={() => {
              if (!isOwner) return;
              openEditDialog(row);
            }}
          />
        );
      },
    },
    {
      headerName: "Delete",
      filter: false,
      minWidth: 100,
      cellClass: "ag-center-cell",
      cellRenderer: (params: any) => {
        const row = params.data;
        return (
          <DeleteForeverOutlinedIcon
            style={{
              cursor: canDelete ? "pointer" : "not-allowed",
              color: canDelete ? "red" : "gray",
              opacity: canDelete ? 1 : 0.4,
              pointerEvents: canDelete ? "auto" : "none",
            }}
            onClick={() => {
              if (!canDelete) return;
              openDeleteDialog(row);
            }}
          />
        );
      },
    },
    {
      headerName: "Location",
      filter: false,
      minWidth: 120,
      cellClass: "ag-center-cell",
      cellRenderer: (params: any) => {
        const locations = Array.isArray(params.data?.Locations)
          ? params.data.Locations
          : [];
        const latestLocation = locations[locations.length - 1];
        const locationId = latestLocation?.["@iot.id"];

        if (!locationId) {
          return <MapIcon style={{ opacity: 0.35 }} />;
        }

        return (
          <LinkCustom to={`/locations/${locationId}`}>
            <MapIcon />
          </LinkCustom>
        );
      },
    },
  ], [canDelete, isOwner, openDeleteDialog, openEditDialog]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchThings(newPage, pageSize, filterQuery, sortQuery);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPage(0);
    setPageSize(newPageSize);
    setPageLinks({});
    fetchThings(0, newPageSize, filterQuery, sortQuery);
  };
  return (
    <Dashboard>
      <ToastContainer position="bottom-right" autoClose={5000} theme="dark" />

      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" style={{ marginBottom: "10px" }}>
        <LinkCustom to="/">Data Space</LinkCustom>
        <LinkCustom to="/frost_entities">Data Items</LinkCustom>
        <Typography color="text.primary">Devices</Typography>
      </Breadcrumbs>

      {/* Create Button and View Toggle Group */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: "12px" }}>
        {isOwner ? (
          <LinkCustom to="/devices/store">
            <Button
              variant="contained"
              color="primary"
              sx={{
                backgroundColor: "rgb(35, 48, 68)",
                "&:hover": { backgroundColor: "rgb(26, 36, 51)" },
              }}
            >
              Create
            </Button>
          </LinkCustom>
        ) : (
          <Button
            disabled
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: "rgb(35, 48, 68)",
              "&:hover": { backgroundColor: "rgb(26, 36, 51)" },
            }}
          >
            Create
          </Button>
        )}

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newView) => {
            if (newView !== null) {
              setViewMode(newView);
            }
          }}
          aria-label="device view mode"
          size="small"
          sx={{
            backgroundColor: "#fff",
            "& .MuiToggleButton-root": {
              borderColor: "rgba(0, 0, 0, 0.12)",
              color: "text.secondary",
              "&.Mui-selected": {
                color: "#fff",
                backgroundColor: "rgb(35, 48, 68)",
                "&:hover": {
                  backgroundColor: "rgb(26, 36, 51)",
                },
              },
            },
          }}
        >
          <ToggleButton value="table" aria-label="table view" sx={{ px: 2, display: "flex", gap: "6px" }}>
            <TableChartIcon fontSize="small" />
            <Typography variant="button" sx={{ textTransform: "none", fontWeight: 600 }}>Table</Typography>
          </ToggleButton>
          <ToggleButton value="map" aria-label="map view" sx={{ px: 2, display: "flex", gap: "6px" }}>
            <MapIcon fontSize="small" />
            <Typography variant="button" sx={{ textTransform: "none", fontWeight: 600 }}>Map</Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {viewMode === "table" ? (
        <DataTableCardV2
          title="Devices"
          description="This page lists all registered devices in your project. 
Each device can have one or more datastreams (e.g., temperature, humidity) that provide sensor observations."
          columnDefs={columnDefs}
          rowData={devices}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          loading={loading}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onFilterChange={(fq) => {
            setFilterQuery(fq);
            setPage(0);
            setPageLinks({});
            fetchThings(0, pageSize, fq, sortQuery);
          }}
          onSortChange={(sq) => {
            setSortQuery(sq);
            setPage(0);
            setPageLinks({});
            fetchThings(0, pageSize, filterQuery, sq);
          }}
        />
      ) : (
        <Card elevation={1} sx={{ borderRadius: "8px" }}>
          <CardHeader
            title={
              <Typography variant="h3" sx={{ fontWeight: 400 }}>
                Devices Map
              </Typography>
            }
          />
          <CardContent sx={{ height: "600px", display: "flex", flexDirection: "column", p: 0, position: "relative" }}>
            <MapContainer
              center={[48.137154, 11.576124]}
              zoom={12}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%", borderRadius: "0 0 8px 8px" }}
            >
              <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mapGeoJson && <MapBoundsFitter geojson={mapGeoJson} />}
              {mapGeoJson && mapGeoJson.features && mapGeoJson.features.map((feature: any) => {
                const coordinates = feature?.geometry?.coordinates;
                const iotId = feature?.properties?.["@iot.id"];
                const name = feature?.properties?.name;
                const description = feature?.properties?.description;

                if (!coordinates || coordinates.length < 2 || !iotId) return null;

                const lat = coordinates[1];
                const lng = coordinates[0];

                return (
                  <Marker
                    key={iotId}
                    position={[lat, lng]}
                    icon={customMarkerIcon}
                  >
                    <Popup>
                      <Box sx={{ p: 0.5, minWidth: 150 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                          {name || `Device ${iotId}`}
                        </Typography>
                        {description && (
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 1, maxHeight: 80, overflowY: "auto" }}>
                            {description}
                          </Typography>
                        )}
                        <LinkCustom to={`/devices/${iotId}/datastreams`}>
                          <Button size="small" variant="contained" fullWidth sx={{ textTransform: "none", fontSize: "0.75rem", backgroundColor: "rgb(35, 48, 68)", "&:hover": { backgroundColor: "rgb(26, 36, 51)" } }}>
                            View Datastreams
                          </Button>
                        </LinkCustom>
                      </Box>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
            {mapLoading && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255,255,255,0.6)",
                  zIndex: 1000,
                }}
              >
                <CircularProgress size={48} />
              </Box>
            )}
          </CardContent>
        </Card>
      )}
      <EntityFormModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditingDeviceId(null);
        }}
        title="Edit Device"
        sectionTitle="Device Details"
        formik={editFormik}
        fields={[
          { name: "name", label: "Device Name", xs: 12, sm: 12 },
          {
            name: "description",
            label: "Description",
            multiline: true,
            minRows: 3,
            xs: 12,
            sm: 12,
          },
        ]}
        submitting={saving}
        submitLabel="Save"
        primaryButtonSx={primaryButtonSx}
        cancelButtonSx={cancelButtonSx}
      />
      <ConfirmDeleteDialog
        open={deleteOpen}
        title="Delete Device"
        entityName={deviceToDelete?.name || ""}
        description="You will not be able to recover this device. Linked datastreams might become dysfunctional."
        loading={deleting}
        onCancel={closeDeleteDialog}
        onConfirm={confirmDeleteDevice}
        cancelButtonSx={cancelButtonSx}
      />
    </Dashboard>
  );
};

export default Devices;
