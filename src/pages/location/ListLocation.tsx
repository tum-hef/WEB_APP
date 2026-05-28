import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useFormik } from "formik";
import { Breadcrumbs, Button, Typography } from "@mui/material";
import LinkCustom from "../../components/LinkCustom";

import Dashboard from "../../components/DashboardComponent";
import { useKeycloak } from "@react-keycloak/web";
import { ToastContainer, toast } from "react-toastify";
import MapIcon from "@mui/icons-material/Map";
import ReactGA from "react-ga4";
import { GAactionsLocations } from "../../utils/GA";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Swal from "sweetalert2";
import { useIsOwner } from "../../hooks/hooks";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import DataTableCardV2 from "../../components/DataGridServerSide";
import EntityFormModal from "../../components/EntityFormModal";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";
import { editLocationValidationSchema } from "../../formik/validation_schema";

const ListLocations = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [pageLinks, setPageLinks] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(false);

  const [filterQuery, setFilterQuery] = useState("");
  const [sortQuery, setSortQuery] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<any | null>(null);

  const { isOwner } = useIsOwner();
  const primaryButtonSx = {
    backgroundColor: "rgb(35, 48, 68)",
    "&:hover": {
      backgroundColor: "rgb(26, 36, 51)",
    },
  };
  const cancelButtonSx = {
    backgroundColor: "#6e7881",
    color: "#ffffff",
    borderColor: "#6e7881",
    "&:hover": {
      backgroundColor: "#5f6870",
      borderColor: "#5f6870",
    },
  };

  const editFormik = useFormik({
    initialValues: {
      name: "",
      description: "",
      latitude: "",
      longitude: "",
    },
    enableReinitialize: false,
    validationSchema: editLocationValidationSchema,
    onSubmit: async (values) => {
      if (!editingLocationId) return;
      const lat = parseFloat(values.latitude);
      const lng = parseFloat(values.longitude);

      try {
        setSaving(true);
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/update`,
          {
            url: `Locations(${editingLocationId})`,
            FROST_PORT: frostServerPort,
            keycloak_id: userInfo?.sub,
            body: {
              name: values.name,
              description: values.description,
              encodingType: "application/vnd.geo+json",
              location: {
                type: "Point",
                coordinates: [lng, lat],
              },
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${keycloak?.token}`,
            },
          }
        );

        if (response.status === 200) {
          const updated = locations.map((loc: any) =>
            loc["@iot.id"] === editingLocationId
              ? {
                ...loc,
                name: values.name,
                description: values.description,
                location: { ...loc.location, coordinates: [lng, lat] },
              }
              : loc
          );
          setLocations(updated);
          setEditOpen(false);
          setEditingLocationId(null);
          Swal.fire("Success", "Location updated!", "success");
        } else {
          Swal.fire("Error", "Failed to update location.", "error");
        }
      } catch (error) {
        const errorMessage = axios.isAxiosError(error)
          ? (error.response?.data as any)?.error ||
          (error.response?.data as any)?.message ||
          "Server error occurred."
          : "Server error occurred.";
        Swal.fire("Error", errorMessage, "error");
      } finally {
        setSaving(false);
      }
    },
  });

  const fetchLocations = async (
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
      ? `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Locations`
      : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Locations`;

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
          $expand: "Things($select=@iot.id)",
          ...(filter && { $filter: filter }),
          ...(sort && { $orderby: sort }),
        },
      });

      setLocations(res.data.value);
      if (res.data["@iot.count"]) setTotalRows(res.data["@iot.count"]);
      if (res.data["@iot.nextLink"]) {
        setPageLinks((prev) => ({
          ...prev,
          [newPage + 1]: res.data["@iot.nextLink"],
        }));
      }
    } catch (err) {
      toast.error("Error Getting Locations");
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
      category: GAactionsLocations.category,
      action: GAactionsLocations.action,
      label: GAactionsLocations.label,
    });

    if (frostServerPort !== null) {
      fetchLocations(page, pageSize);
    } else {
      fetchFrostPort();
    }
  }, [frostServerPort]);

  const openDeleteDialog = useCallback((row: any) => {
    setLocationToDelete(row);
    setDeleteOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    if (deleting) return;
    setDeleteOpen(false);
    setLocationToDelete(null);
  }, [deleting]);

  const openEditDialog = useCallback(
    (row: any) => {
      const currentLat = row?.location?.coordinates?.[1];
      const currentLng = row?.location?.coordinates?.[0];
      setEditingLocationId(row?.["@iot.id"]);
      editFormik.setValues({
        name: row?.name || "",
        description: row?.description || "",
        latitude:
          currentLat !== undefined && currentLat !== null
            ? String(currentLat)
            : "",
        longitude:
          currentLng !== undefined && currentLng !== null
            ? String(currentLng)
            : "",
      });
      setEditOpen(true);
    },
    [editFormik.setValues]
  );

  const columnDefs = useMemo(() => [
    {
      headerName: "ID",
      field: "@iot.id",
      sortable: true,
      flex: 1,
      valueGetter: (params: any) => params.data["@iot.id"]
    },
    {
      headerName: "Name",
      field: "name",
      sortable: true,
      flex: 2
    },
    {
      headerName: "Description",
      field: "description",
      sortable: true,
      flex: 3,
      wrapText: true,
      autoHeight: true,
      cellStyle: { whiteSpace: "normal" },

    },
    {
      headerName: "Longitude",
      valueGetter: (params: any) =>
        Array.isArray(params.data?.location?.coordinates)
          ? params.data.location.coordinates[0]
          : "",
      sortable: true,
      filter: false
    },
    {
      headerName: "Latitude",
      valueGetter: (params: any) =>
        Array.isArray(params.data?.location?.coordinates)
          ? params.data.location.coordinates[1]
          : "",
      sortable: true,
      filter: false
    },

    {
      headerName: "Edit",
      cellRenderer: (params: any) => {
        const row = params.data;
        const hasLinkedThing = Boolean(row?.Things?.[0]?.["@iot.id"]);
        const canEdit = isOwner && hasLinkedThing;
        return (
          <EditOutlinedIcon
            style={{
              cursor: canEdit ? "pointer" : "not-allowed",
              color: canEdit ? "red" : "gray",
              opacity: canEdit ? 1 : 0.4,
              pointerEvents: canEdit ? "auto" : "none",
            }}
            onClick={() => {
              if (!canEdit) return;
              openEditDialog(row);
            }}
          />
        );
      },
      filter: false
    },
    {
      headerName: "Delete",
      filter: false,
      cellRenderer: (params: any) => {
        const row = params.data;
        return (
          <DeleteForeverOutlinedIcon
            style={{
              cursor: isOwner ? "pointer" : "not-allowed",
              color: isOwner ? "red" : "gray",
              opacity: isOwner ? 1 : 0.4,
              pointerEvents: isOwner ? "auto" : "none",
            }}
            onClick={() => {
              if (!isOwner) return;
              openDeleteDialog(row);
            }}
          />
        );
      },
    },
    {
      headerName: "Location on Map",
      cellRenderer: (params: any) => (
        <LinkCustom
          style={{ color: "#233044", textDecoration: "none" }}
          to={`/locations/${params.data["@iot.id"]}`}
        >
          <MapIcon />
        </LinkCustom>
      ),
      filter: false
    },
  ], [isOwner, openDeleteDialog, openEditDialog]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchLocations(newPage, pageSize, filterQuery, sortQuery);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPage(0);
    setPageSize(newPageSize);
    setPageLinks({});
    fetchLocations(0, newPageSize, filterQuery, sortQuery);
  };

  const confirmDeleteLocation = async () => {
    if (!locationToDelete) return;

    try {
      setDeleting(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/delete`,
        {
          url: `Locations(${locationToDelete["@iot.id"]})`,
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
        Swal.fire("Deleted!", "Location deleted successfully!", "success");
        setLocations(
          locations.filter((loc: any) => loc["@iot.id"] !== locationToDelete["@iot.id"])
        );
      } else {
        Swal.fire("Error", "Location not deleted!", "error");
      }
    } catch {
      axios.post("http://localhost:4500/mutation_error_logs", {
        keycloak_id: userInfo?.sub,
        method: "DELETE",
        attribute: "Locations",
        attribute_id: locationToDelete["@iot.id"],
        frost_port: frostServerPort,
      });
      Swal.fire("Error", "Something went wrong while deleting.", "error");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      setLocationToDelete(null);
    }
  };


  return (
    <Dashboard>
      <ToastContainer position="bottom-right" autoClose={5000} theme="dark" />

      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" style={{ marginBottom: "10px" }}>
        <LinkCustom to="/">Data Space</LinkCustom>
        <LinkCustom to="/frost_entities">Data Items</LinkCustom>
        <Typography color="text.primary">Locations</Typography>
      </Breadcrumbs>

      {/* Create Button */}
      {isOwner ? (
        <LinkCustom to="/locations/store">
          <Button
            variant="contained"
            color="primary"
            sx={{
              mb: "10px",
              backgroundColor: "rgb(35, 48, 68)",
              "&:hover": { backgroundColor: "rgb(26, 36, 51)" },
            }}
          >
            Create
          </Button>
        </LinkCustom>
      ) : (
        <Button
          variant="contained"
          color="primary"
          disabled
          sx={{
            mb: "10px",
            backgroundColor: "rgb(35, 48, 68)",
            "&:hover": { backgroundColor: "rgb(26, 36, 51)" },
          }}
        >
          Create
        </Button>
      )}
      <DataTableCardV2
        title="Locations"
        description="This page lists all device locations. 
Each location includes a name, description, and geographic coordinates, and can be viewed on the map."
        columnDefs={columnDefs}
        rowData={locations}
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
          fetchLocations(0, pageSize, fq, sortQuery);
        }}
        onSortChange={(sq) => {
          setSortQuery(sq);
          setPage(0);
          setPageLinks({});
          fetchLocations(0, pageSize, filterQuery, sq);
        }}
      />
      <EntityFormModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditingLocationId(null);
        }}
        title="Edit Location"
        sectionTitle="Location Details"
        formik={editFormik}
        fields={[
          { name: "name", label: "Location Name", xs: 12, sm: 12 },
          {
            name: "description",
            label: "Description",
            multiline: true,
            minRows: 3,
            xs: 12,
            sm: 12,
          },
          { name: "latitude", label: "Latitude", type: "number", xs: 12, sm: 6 },
          { name: "longitude", label: "Longitude", type: "number", xs: 12, sm: 6 },
        ]}
        submitting={saving}
        submitLabel="Save"
        primaryButtonSx={primaryButtonSx}
        cancelButtonSx={cancelButtonSx}
      />
      <ConfirmDeleteDialog
        open={deleteOpen}
        title="Delete Location"
        entityName={locationToDelete?.name || ""}
        description="This will remove the location and its map reference from this list."
        warningText="This action is permanent and cannot be undone."
        loading={deleting}
        onCancel={closeDeleteDialog}
        onConfirm={confirmDeleteLocation}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        cancelButtonSx={cancelButtonSx}
      />

    </Dashboard>
  );
};

export default ListLocations;
