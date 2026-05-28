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
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import Swal from "sweetalert2";
import ReactGA from "react-ga4";
import { GAactionsDataStreams } from "../../utils/GA";
import { useIsOwner } from "../../hooks/hooks";
import DataTableCardV2 from "../../components/DataGridServerSide"
import BiotechSharpIcon from "@mui/icons-material/BiotechSharp";
import EntityFormModal from "../../components/EntityFormModal";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";
import { editDatastreamValidationSchema } from "../../formik/validation_schema";

const DESCRIPTION_WORD_LIMIT = 7;

const getDescriptionPreview = (value: string) => {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length <= DESCRIPTION_WORD_LIMIT) return value;
  return `${words.slice(0, DESCRIPTION_WORD_LIMIT).join(" ")}...`;
};

const DescriptionCellRenderer = ({ value }: { value?: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const fullText = String(value ?? "");
  const wordCount = fullText.trim().split(/\s+/).filter(Boolean).length;
  const isExpandable = wordCount > DESCRIPTION_WORD_LIMIT;
  const displayText = isExpanded || !isExpandable ? fullText : getDescriptionPreview(fullText);

  return (
    <span title={fullText}>
      {displayText}
      {isExpandable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded((prev) => !prev);
          }}
          style={{
            marginLeft: 6,
            border: "none",
            background: "transparent",
            color: "#1976d2",
            cursor: "pointer",
            padding: 0,
            fontSize: "0.85rem",
            fontWeight: 500,
          }}
        >
          {isExpanded ? "Less" : "More"}
        </button>
      )}
    </span>
  );
};



const ListDatastream = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [datastreams, setDatastreams] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [pageLinks, setPageLinks] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(false);

  const PAGE_SIZE = 10;
  const [pageSize, setPageSize] = useState(PAGE_SIZE); 
  const [filterQuery, setFilterQuery] = useState("");
  const [sortQuery, setSortQuery] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editingDatastreamId, setEditingDatastreamId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [datastreamToDelete, setDatastreamToDelete] = useState<any | null>(null);
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
    initialValues: {
      description: "",
      unit_name: "",
      unit_symbol: "",
      unit_definition: "",
    },
    validationSchema: editDatastreamValidationSchema,
    onSubmit: async (values) => {
      if (!editingDatastreamId) return;
      const unitOfMeasurement = {
        name: values.unit_name,
        symbol: values.unit_symbol,
        definition: values.unit_definition,
      };
      try {
        setSaving(true);
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/update`,
          {
            url: `Datastreams(${editingDatastreamId})`,
            FROST_PORT: frostServerPort,
            body: { description: values.description, unitOfMeasurement },
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
          const updatedList = datastreams.map((stream) =>
            stream["@iot.id"] === editingDatastreamId
              ? {
                ...stream,
                description: values.description,
                unitOfMeasurement,
              }
              : stream
          );
          setDatastreams(updatedList);
          setEditOpen(false);
          setEditingDatastreamId(null);
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Datastream edited successfully!",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Datastream not edited!",
          });
        }
      } catch {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong! Datastream not edited!",
        });
      } finally {
        setSaving(false);
      }
    },
  });

const fetchDatastreams = useCallback(
  async (newPage = 0, newPageSize = pageSize, filter = filterQuery, sort = sortQuery) => {
    if (frostServerPort === null) return;
    setLoading(true);

    const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
    const isDev = process.env.REACT_APP_IS_DEVELOPMENT === "true";

    let url = isDev
      ? `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Datastreams`
      : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Datastreams`;

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

      setDatastreams(res.data.value);
      if (res.data["@iot.count"]) setTotalRows(res.data["@iot.count"]);
      if (res.data["@iot.nextLink"]) {
        setPageLinks((prev) => ({ ...prev, [newPage + 1]: res.data["@iot.nextLink"] }));
      }
    } catch (err) {
      toast.error("Error Getting Datastreams");
    } finally {
      setLoading(false);
    }
  },
  [frostServerPort, pageSize, filterQuery, sortQuery, token, pageLinks]
);
  const fetchFrostPort = async () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL;
    const email =
      localStorage.getItem("selected_others") === "true"
        ? localStorage.getItem("user_email")
        : userInfo?.preferred_username;
    const group_id = localStorage.getItem("group_id");

    if (!email || !group_id) {
      toast.error("User email and group ID are required.");
      return;
    }

    try {
      const res = await axios.post(
        `${backend_url}/frost-server`,
        { user_email: email, group_id: group_id }, // ✅ Adding group_id to the request body
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Added Authorization header
          },
        }
      );

      if (res.status === 200 && res.data.PORT) {
        setFrostServerPort(res.data.PORT);
      }
    } catch (error) {
      console.error("Error fetching Frost Server Port:", error);
      toast.error("An error occurred while fetching the Frost Server port.");
    }
  };

  const openEditDialog = useCallback(
    (row: any) => {
      setEditingDatastreamId(row?.["@iot.id"]);
      editFormik.setValues({
        description: row?.description || "",
        unit_name: row?.unitOfMeasurement?.name || "",
        unit_symbol: row?.unitOfMeasurement?.symbol || "",
        unit_definition: row?.unitOfMeasurement?.definition || "",
      });
      setEditOpen(true);
    },
    [editFormik.setValues]
  );

  const openDeleteDialog = useCallback((row: any) => {
    setDatastreamToDelete(row);
    setDeleteOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    if (deleting) return;
    setDeleteOpen(false);
    setDatastreamToDelete(null);
  }, [deleting]);

  const confirmDeleteDatastream = useCallback(async () => {
    if (!datastreamToDelete) return;
    try {
      setDeleting(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/delete`,
        {
          url: `Datastreams(${datastreamToDelete["@iot.id"]})`,
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
          title: "Deleted!",
          text: `Datastream "${datastreamToDelete.name}" deleted successfully!`,
        });
        setDatastreams((prev) => prev.filter((ds) => ds["@iot.id"] !== datastreamToDelete["@iot.id"]));
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Datastream not deleted! Try again.",
        });
      }
    } catch {
      axios.post(
        `http://localhost:4500/mutation_error_logs`,
        {
          keycloak_id: userInfo?.sub,
          method: "DELETE",
          attribute: "Datastreams",
          attribute_id: datastreamToDelete["@iot.id"],
          frost_port: frostServerPort,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while deleting the datastream.",
      });
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      setDatastreamToDelete(null);
    }
  }, [datastreamToDelete, frostServerPort, token, userInfo?.sub]);

 const handlePageChange = (newPage: number) => {
  setPage(newPage);
  fetchDatastreams(newPage, pageSize, filterQuery, sortQuery);
};

const handlePageSizeChange = (newPageSize: number) => {
  setPage(0);
  setPageSize(newPageSize);
  setPageLinks({});
  fetchDatastreams(0, newPageSize, filterQuery, sortQuery);
};

  useEffect(() => {
    ReactGA.event({
      category: GAactionsDataStreams.category,
      action: GAactionsDataStreams.action,
      label: GAactionsDataStreams.label,
    });

    if (frostServerPort !== null) {
      fetchDatastreams(page, pageSize);
    } else {
      fetchFrostPort();
    }
  }, [frostServerPort]);

  const columns = useMemo(() => [
    {
      headerName: "ID",
      field: "@iot.id",
      sortable: true,
      flex: 1,
      filter: "agTextColumnFilter",
      valueGetter: (params: any) => params.data["@iot.id"],
    },
    {
      headerName: "Name",
      field: "name",
      sortable: true,
      flex: 2,
      filter: "agTextColumnFilter",
    },
  
     {
      headerName: "Description",
      field: "description",
      sortable: true,
      flex: 3,
      wrapText: true,
      autoHeight: true,
      filter: "agTextColumnFilter",
      cellStyle: { whiteSpace: "normal" },
        cellRenderer: (params: any) => <DescriptionCellRenderer value={params.value} />,
    },
    {
  headerName: "Time Range",
  field: "phenomenonTime",
  filter: false,
  sortable: true,

  valueFormatter: (params: any) => {
    if (!params.value) return "";

    const [start, end] = (params.value as string).split("/");

    const formatUTC = (dateStr: string) => {
      const d = new Date(dateStr);
      const pad = (n: number) => String(n).padStart(2, "0");

      return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
             `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
    };

    if (!end) return `${formatUTC(start)} → ongoing`;
    if (start === end) return formatUTC(start);

    return `${formatUTC(start)} → ${formatUTC(end)}`;
  },

  comparator: (valueA: string, valueB: string) => {
    const getStart = (val: string) => {
      if (!val) return 0;
      return new Date(val.split("/")[0]).getTime();
    };

    return getStart(valueA) - getStart(valueB);
  }
},
    {
      headerName: "Edit",
      width: 100,
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
      width: 100,
      flex: 1,
      filter: false,
      cellRenderer: (params: any) => (
        <DeleteForeverOutlinedIcon
          style={{
            cursor: canDelete ? "pointer" : "not-allowed",
            color: canDelete ? "red" : "gray",
            opacity: canDelete ? 1 : 0.4,
            pointerEvents: canDelete ? "auto" : "none",
          }}
          onClick={() => {
            if (!canDelete) return;
            const row = params?.data;
            openDeleteDialog(row);
          }}
        />
      ),
    },
    {
      headerName: "Export Data",
      flex: 1,
      filter: false,
      cellRenderer: (params: any) => (
        <FileDownloadIcon
          style={{
            cursor: "pointer",
            color: "black",
          }}
          onClick={() => {
            const row = params?.data;
            const blob = new Blob([JSON.stringify(row, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${row.name || "data"}.json`;
            link.click();
            URL.revokeObjectURL(url);
          }}
        />
      ),
    },
     {
      headerName: "Observations",
      field: "observations",
      cellRenderer: (params: any) => (
        <LinkCustom
          style={{ color: "#233044", textDecoration: "none" }}
          to={`/datastreams/${params.data["@iot.id"]}/observations`}
        >
          <BiotechSharpIcon />
        </LinkCustom>
      ),
      sortable: false,
      filter: false,
    },
  ], [canDelete, isOwner, openDeleteDialog, openEditDialog]);


  return (
    <Dashboard>
      <ToastContainer position="bottom-right" autoClose={5000} theme="dark" />

      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <LinkCustom to="/">Data Space</LinkCustom>
        <LinkCustom to="/frost_entities">Data Items</LinkCustom>
        <Typography color="text.primary">Datastreams</Typography>
      </Breadcrumbs>

      {/* Create Button */}
      {isOwner ? (
        <LinkCustom to="/datastreams/store">
          <Button
            variant="contained"
            color="primary"
            sx={{
              mb: 2,
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
            mb: 2,
            backgroundColor: "rgb(35, 48, 68)",
            "&:hover": { backgroundColor: "rgb(26, 36, 51)" },
          }}
        >
          Create
        </Button>
      )}
    <DataTableCardV2
  title="Datastreams"
  description="List of datastreams in this project"
  columnDefs={columns}
  rowData={datastreams}
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
    fetchDatastreams(0, pageSize, fq, sortQuery);
  }}
  onSortChange={(sq) => {               
    setSortQuery(sq);           
    setPage(0);
    setPageLinks({});
    fetchDatastreams(0, pageSize, filterQuery, sq);
  }}
/>
      <EntityFormModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditingDatastreamId(null);
        }}
        title="Edit Datastream"
        sectionTitle="Datastream Details"
        formik={editFormik}
        fields={[
          {
            name: "description",
            label: "Description",
            multiline: true,
            minRows: 3,
            xs: 12,
            sm: 12,
          },
          { name: "unit_name", label: "Unit Name", xs: 12, sm: 4 },
          { name: "unit_symbol", label: "Unit Symbol", xs: 12, sm: 4 },
          { name: "unit_definition", label: "Unit Definition", xs: 12, sm: 4 },
        ]}
        submitting={saving}
        submitLabel="Save"
        primaryButtonSx={primaryButtonSx}
        cancelButtonSx={cancelButtonSx}
      />
      <ConfirmDeleteDialog
        open={deleteOpen}
        title="Delete Datastream"
        entityName={datastreamToDelete?.name || ""}
        description="This will permanently delete the datastream and its related data."
        loading={deleting}
        onCancel={closeDeleteDialog}
        onConfirm={confirmDeleteDatastream}
        cancelButtonSx={cancelButtonSx}
      />
    </Dashboard>
  );
};

export default ListDatastream;
