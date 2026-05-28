import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useFormik } from "formik";
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
import DataTableCardV2 from "../../components/DataGridServerSide";
import EntityFormModal from "../../components/EntityFormModal";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";
import { editObservationPropertyValidationSchema } from "../../formik/validation_schema";

const ListObservationProperty = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;
  console.log(token);

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [observationProperty, setObservationProperty] = useState<any[]>([]);
  const [page, setPage] = useState(0);
const [pageSize, setPageSize] = useState(10);
const [totalRows, setTotalRows] = useState(0);
const [pageLinks, setPageLinks] = useState<{ [key: number]: string }>({});
const [loading, setLoading] = useState(false);

const [filterQuery, setFilterQuery] = useState("");
const [sortQuery, setSortQuery] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editingObservedPropertyId, setEditingObservedPropertyId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [observationPropertyToDelete, setObservationPropertyToDelete] = useState<any | null>(null);
  const selectedGroupId = useAppSelector(state => state.roles.selectedGroupId);
  const group = useAppSelector(state =>
    state.roles.groups.find(g => g?.group_name_id === selectedGroupId)
  );
  const isOwner = useIsOwner();
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
    initialValues: { name: "", description: "", definition: "" },
    validationSchema: editObservationPropertyValidationSchema,
    onSubmit: async (values) => {
      if (!editingObservedPropertyId) return;
      try {
        setSaving(true);
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/update`,
          {
            url: `ObservedProperties(${editingObservedPropertyId})`,
            FROST_PORT: frostServerPort,
            body: {
              name: values.name,
              description: values.description,
              definition: values.definition,
            },
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
          const observedProperties = observationProperty.map((observed_property) =>
            observed_property["@iot.id"] === editingObservedPropertyId
              ? {
                ...observed_property,
                name: values.name,
                description: values.description,
                definition: values.definition,
              }
              : observed_property
          );
          setObservationProperty(observedProperties);
          setEditOpen(false);
          setEditingObservedPropertyId(null);
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
      } catch {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong! Measurement Property not edited!",
        });
      } finally {
        setSaving(false);
      }
    },
  });


  const fetchObservationProperty = async (
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
    ? `${backend_url}:${frostServerPort}/FROST-Server/v1.0/ObservedProperties`
    : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/ObservedProperties`;

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

    setObservationProperty(res.data.value);
    if (res.data["@iot.count"]) setTotalRows(res.data["@iot.count"]);
    if (res.data["@iot.nextLink"]) {
      setPageLinks((prev) => ({
        ...prev,
        [newPage + 1]: res.data["@iot.nextLink"],
      }));
    }
  } catch (err) {
    toast.error("Error Getting Measurement Property");
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
    fetchObservationProperty(page, pageSize);
  } else {
    fetchFrostPort();
  }
}, [frostServerPort]);


  const openEditDialog = useCallback(
    (row: any) => {
      setEditingObservedPropertyId(row?.["@iot.id"]);
      editFormik.setValues({
        name: row?.name || "",
        description: row?.description || "",
        definition: row?.definition || "",
      });
      setEditOpen(true);
    },
    [editFormik.setValues]
  );

  const openDeleteDialog = useCallback((row: any) => {
    setObservationPropertyToDelete(row);
    setDeleteOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    if (deleting) return;
    setDeleteOpen(false);
    setObservationPropertyToDelete(null);
  }, [deleting]);

  const confirmDeleteObservationProperty = useCallback(async () => {
    if (!observationPropertyToDelete) return;
    try {
      setDeleting(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/delete`,
        {
          url: `ObservedProperties(${observationPropertyToDelete["@iot.id"]})`,
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
        Swal.fire({ icon: "success", title: "Success", text: "Measurement Property deleted successfully!" });
        setObservationProperty((prev) =>
          prev.filter((observation_property) => observation_property["@iot.id"] !== observationPropertyToDelete["@iot.id"])
        );
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong! Measurement Property not deleted!",
        });
      }
    } catch {
      await axios.post(
        `http://localhost:4500/mutation_error_logs`,
        {
          keycloak_id: userInfo?.sub,
          method: "DELETE",
          attribute: "Measurement Property",
          attribute_id: observationPropertyToDelete["@iot.id"],
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
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      setObservationPropertyToDelete(null);
    }
  }, [frostServerPort, keycloak?.token, observationPropertyToDelete, token, userInfo?.sub]);

  const columns = useMemo(() => [
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
            openEditDialog(row);
          }}
        />
      ),
    },
    {

      headerName: "Delete",
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
            openDeleteDialog(row);
          }}
        />
      ),
      flex: 1,
      filter: false,
    },
  ], [isOwner, keycloak?.token, openDeleteDialog, openEditDialog]);

  const handlePageChange = (newPage: number) => {
  setPage(newPage);
  fetchObservationProperty(newPage, pageSize, filterQuery, sortQuery);
};

const handlePageSizeChange = (newPageSize: number) => {
  setPage(0);
  setPageSize(newPageSize);
  setPageLinks({});
  fetchObservationProperty(0, newPageSize, filterQuery, sortQuery);
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
  title="Measurement Property"
  description="This page lists all measurement properties (observed properties) used by datastreams. 
A measurement property describes what is being measured, such as temperature, humidity, or pressure, 
and may include a definition or reference for clarity and standardization."
  columnDefs={columns}
  rowData={observationProperty}
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
    fetchObservationProperty(0, pageSize, fq, sortQuery);
  }}
  onSortChange={(sq) => {
    setSortQuery(sq);
    setPage(0);
    setPageLinks({});
    fetchObservationProperty(0, pageSize, filterQuery, sq);
  }}
/>
      <EntityFormModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditingObservedPropertyId(null);
        }}
        title="Edit Measurement Property"
        sectionTitle="Measurement Property Details"
        formik={editFormik}
        fields={[
          { name: "name", label: "Name", xs: 12, sm: 12 },
          {
            name: "description",
            label: "Description",
            multiline: true,
            minRows: 3,
            xs: 12,
            sm: 12,
          },
          { name: "definition", label: "Definition", xs: 12, sm: 12 },
        ]}
        submitting={saving}
        submitLabel="Save"
        primaryButtonSx={primaryButtonSx}
        cancelButtonSx={cancelButtonSx}
      />
      <ConfirmDeleteDialog
        open={deleteOpen}
        title="Delete Measurement Property"
        entityName={observationPropertyToDelete?.name || ""}
        description="You will not be able to recover this measurement property. Linked datastreams might become dysfunctional."
        loading={deleting}
        onCancel={closeDeleteDialog}
        onConfirm={confirmDeleteObservationProperty}
        cancelButtonSx={cancelButtonSx}
      />

    </Dashboard>
  );
};

export default ListObservationProperty;
