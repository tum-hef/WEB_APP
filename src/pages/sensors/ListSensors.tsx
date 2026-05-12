import { useState, useEffect } from "react";
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
import { GAactionsSensors } from "../../utils/GA";
import { useAppSelector, useIsOwner } from "../../hooks/hooks";
import DataTableCardV2 from "../../components/DataGridServerSide";
import EntityFormModal from "../../components/EntityFormModal";
import { editSensorValidationSchema } from "../../formik/validation_schema";
const ListSensors = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [sensors, setSensors] = useState<any[]>([]);
  const [page, setPage] = useState(0);
const [pageSize, setPageSize] = useState(10);
const [totalRows, setTotalRows] = useState(0);
const [pageLinks, setPageLinks] = useState<{ [key: number]: string }>({});
const [loading, setLoading] = useState(false);

const [filterQuery, setFilterQuery] = useState("");
const [sortQuery, setSortQuery] = useState("");
const [editOpen, setEditOpen] = useState(false);
const [editingSensorId, setEditingSensorId] = useState<number | null>(null);
const [saving, setSaving] = useState(false);
  const selectedGroupId = useAppSelector((state) => state.roles.selectedGroupId);
  const group = useAppSelector((state) =>
    state.roles.groups.find((g) => g?.group_name_id === selectedGroupId)
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
    initialValues: { name: "", description: "", metadata: "" },
    validationSchema: editSensorValidationSchema,
    onSubmit: async (values) => {
      if (!editingSensorId) return;
      try {
        setSaving(true);
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/update`,
          {
            url: `Sensors(${editingSensorId})`,
            FROST_PORT: frostServerPort,
            body: {
              name: values.name,
              description: values.description,
              metadata: values.metadata,
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
          const newSensors = sensors.map((sensor) =>
            sensor["@iot.id"] === editingSensorId
              ? {
                ...sensor,
                name: values.name,
                description: values.description,
                metadata: values.metadata,
              }
              : sensor
          );
          setSensors(newSensors);
          setEditOpen(false);
          setEditingSensorId(null);
          Swal.fire("Success", "Sensor edited successfully!", "success");
        } else {
          Swal.fire("Oops...", "Something went wrong! Sensor not edited!", "error");
        }
      } catch {
        Swal.fire("Oops...", "Something went wrong! Sensor not edited!", "error");
      } finally {
        setSaving(false);
      }
    },
  });

 const fetchSensors = async (
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
    ? `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Sensors`
    : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Sensors`;

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

    setSensors(res.data.value);
    if (res.data["@iot.count"]) setTotalRows(res.data["@iot.count"]);
    if (res.data["@iot.nextLink"]) {
      setPageLinks((prev) => ({
        ...prev,
        [newPage + 1]: res.data["@iot.nextLink"],
      }));
    }
  } catch (err) {
    toast.error("Error Getting Sensors");
  } finally {
    setLoading(false);
  }
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
    fetchSensors(page, pageSize);
  } else {
    fetchFrostPort();
  }
}, [frostServerPort]);

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
            setEditingSensorId(params.data?.["@iot.id"]);
            editFormik.setValues({
              name: params.data?.name || "",
              description: params.data?.description || "",
              metadata: params.data?.metadata || "",
            });
            setEditOpen(true);
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


  // onChange 
  const handlePageChange = (newPage: number) => {
  setPage(newPage);
  fetchSensors(newPage, pageSize, filterQuery, sortQuery);
};

const handlePageSizeChange = (newPageSize: number) => {
  setPage(0);
  setPageSize(newPageSize);
  setPageLinks({});
  fetchSensors(0, newPageSize, filterQuery, sortQuery);
};
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
  title="Sensor Types"
  description="This page lists all sensor types available in the system. 
Each sensor defines how a measurement is made, including its metadata and description."
  columnDefs={columnDefs}
  rowData={sensors}
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
    fetchSensors(0, pageSize, fq, sortQuery);
  }}
  onSortChange={(sq) => {
    setSortQuery(sq);
    setPage(0);
    setPageLinks({});
    fetchSensors(0, pageSize, filterQuery, sq);
  }}
/>
      <EntityFormModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditingSensorId(null);
        }}
        title="Edit Sensor Type"
        sectionTitle="Sensor Details"
        formik={editFormik}
        fields={[
          { name: "name", label: "Sensor Name", xs: 12, sm: 12 },
          {
            name: "description",
            label: "Description",
            multiline: true,
            minRows: 3,
            xs: 12,
            sm: 12,
          },
          { name: "metadata", label: "Metadata", xs: 12, sm: 12 },
        ]}
        submitting={saving}
        submitLabel="Save"
        primaryButtonSx={primaryButtonSx}
        cancelButtonSx={cancelButtonSx}
      />
    </Dashboard>
  );
};

export default ListSensors;
