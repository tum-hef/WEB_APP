import { useState, useEffect } from "react";
import axios from "axios";
import { Breadcrumbs, Button, TextField, Typography } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";

import Dashboard from "../../components/DashboardComponent";
import LinkCustom from "../../components/LinkCustom";
import DataTableCardV2 from "../../components/DataGridServerSide";
import { useKeycloak } from "@react-keycloak/web";
import { FilterQueryBuilderV2, SortQueryBuilder } from "../../utils/frostQueryBuilder";
import moment from "moment";
import DateTimeFilter from "../../components/AgGridDateTime";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import ReactDOM from "react-dom";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useIsOwner } from "../../hooks/hooks";
import { format } from "date-fns";


const normalizeDateFilterForBackend = (filter: string): string => {
  if (!filter) return filter;

  // Replace ISO-like datetime `YYYY-MM-DDTHH:mm:ss(.sss)Z` → `YYYY-MM-DD HH:mm:ss`
  return filter.replace(
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/g,
    (iso) => {
      // 1) remove trailing 'Z'
      let s = iso.replace("Z", "");
      // 2) split off milliseconds if present
      const [main] = s.split(".");
      // 3) replace 'T' with space
      return main.replace("T", " ");
    }
  );
};

const ListLogBook = () => {
  const { keycloak } = useKeycloak();
  const token = keycloak?.token;

  const backend_url = process.env.REACT_APP_BACKEND_URL;

  const [logs, setLogs] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [filterQuery, setFilterQuery] = useState("");
  const [sortQuery, setSortQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const isOwner = useIsOwner();
  const CreateLogSchema = Yup.object().shape({
    description: Yup.string()
      .min(3, "Too short")
      .required("Description is required"),
    timestamp: Yup.date()
      .required("Timestamp required")
      .nullable(),
  });






  const fetchLogs = async (
    newPage: number = 0,
    newPageSize: number = pageSize,
    filterString: string = filterQuery,
    sortString: string = sortQuery
  ) => {
    const group_id = localStorage.getItem("group_id");

    if (!group_id) {
      setLogs([]);
      setTotalRows(0);
      return;
    }

    setLoading(true);

    try {
      const res = await axios.get(`${backend_url}/log_books`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          group_id,
          page: newPage,
          limit: newPageSize,
          ...(filterString && { $filter: filterString }),
          ...(sortString && { $orderby: sortString }),
        },
      });

      if (res?.status === 200) {
        setLogs(res?.data?.value || []);
        setTotalRows(res?.data?.total || 0);
      }
    } catch (err) {
      toast.error("Failed to fetch log book entries");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchLogs(0, pageSize, filterQuery, sortQuery);
  }, []);


  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchLogs(newPage, pageSize, filterQuery, sortQuery);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPage(0);
    setPageSize(newPageSize);
    fetchLogs(0, newPageSize, filterQuery, sortQuery);
  };



  // ---------- AG GRID COLUMN DEFINITIONS ----------
  const columnDefs = [
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      flex: 0.5,
    },
    {
      headerName: "Description",
      field: "description",
      filter: "agTextColumnFilter",


      sortable: true,
      flex: 2,
      wrapText: true,
      autoHeight: true,
      cellStyle: { whiteSpace: "normal" },
    },
    {
      headerName: "Event Timestamp",
      field: "timestamp",
      sortable: true,
      filter: "agDateColumnFilter",
      cellDataType: "dateTime", 
     filterParams: {
  defaultOption: "inRange",
  suppressAndOrCondition: true,
  buttons: ["apply", "reset"],
  closeOnApply: true,             // 🔥 Big one
},
      flex: 1.2,

      // Return REAL date object (for AG Grid filter)
      valueGetter: (params: any) => params.data.timestamp ? new Date(params.data.timestamp) : null,

      // Show readable format to user
      valueFormatter: (params: any) =>
        params.value ? moment(params.value).format("DD.MM.YYYY HH:mm:ss") : "",
    },
  {
  headerName: "Recorded Timestamp",
  field: "createdAt",
  sortable: true,
  filter: "agDateColumnFilter",
  cellDataType: "dateTime", 
 
  valueGetter: (params:any) => {
    const raw = params.data.createdAt;
    if (!raw) return null;
    const utc = raw.replace(" ", "T") + "Z";

    return new Date(utc); 
  },

  valueFormatter: (params:any) => {
    return params.value
      ? moment(params.value).format("DD.MM.YYYY HH:mm:ss")
      : "";
  },

  flex: 1.2,
}
,
{
  headerName: "",
  field: "edit",
  width: 50,
  minWidth: 50,
  maxWidth: 50,
  sortable: false,
  filter: false,
  suppressMovable: true,
  suppressSizeToFit: true,
  cellStyle: { borderRight: "none" }, // remove grid line

  cellRenderer: (params: any) => {
    const isOwner = params.context.isOwner;

    return (
      <EditIcon
        sx={{
          cursor: isOwner ? "pointer" : "not-allowed",
          color: isOwner ? "#233044" : "#999999",
          opacity: isOwner ? 1 : 0.4,
          width: "22px",
          height: "22px",
        }}
        onClick={() => {
          if (!isOwner) return;
          handleEditLog(params.data);
        }}
      />
    );
  },
},
{
  headerName: "",
  field: "delete",
  width: 50,
  minWidth: 50,
  maxWidth: 50,
  sortable: false,
  filter: false,
  suppressMovable: true,
  suppressSizeToFit: true,
  cellStyle: { borderRight: "none" }, // remove grid line

  cellRenderer: (params: any) => {
    const isOwner = params.context.isOwner;

    return (
      <DeleteIcon
        sx={{
          cursor: isOwner ? "pointer" : "not-allowed",
          color: isOwner ? "#d32f2f" : "#999999",
          opacity: isOwner ? 1 : 0.4,
          width: "22px",
          height: "22px",
        }}
        onClick={() => {
          if (!isOwner) return;
          handleDeleteLog(params.data);
        }}
      />
    );
  },
},




  ];


  const handleCreateLog = () => {
  Swal.fire({
    title: "Create Log Entry",
    html: `<div id="swal-create-form" style="display:flex;flex-direction:column;gap:15px;"></div>`,

    showCancelButton: true,
    confirmButtonText: "Create",

    didOpen: () => {
      const mount = document.getElementById("swal-create-form");

      ReactDOM.render(
        <Formik
          initialValues={{
            description: "",
            timestamp: new Date(),
          }}
          validationSchema={CreateLogSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              const token = keycloak?.token;

              // backend format: "2025-11-25 14:30:00"
              const formattedTimestamp = format(
                values.timestamp,
                "yyyy-MM-dd HH:mm:ss"
              );

              await axios.post(
                `${backend_url}/log_book`,
                {
                  description: values.description,
                  timestamp: formattedTimestamp,
                  group_id: localStorage.getItem("group_id"),
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              const btn = Swal.getConfirmButton();
              if (btn) btn.onclick = null; /** Remove previous Formik submit binding */

              if (mount) {
                ReactDOM.unmountComponentAtNode(mount); /** Unmount form */
              }

              Swal.close(); /** Close form dialog */

              await Swal.fire("Success", "Log entry created!", "success");

              // Refresh table + reset form
              resetForm();
              fetchLogs(page, pageSize, filterQuery, sortQuery);

            } catch (err) {
              Swal.fire("Error", "Failed to create log", "error");
            }

            setSubmitting(false);
          }}
        >
          {({ values, errors, touched, setFieldValue, submitForm }) => {
            const btn = Swal.getConfirmButton();
            if (btn) btn.onclick = submitForm;

            return (
          <Form style={{ display: "flex", flexDirection: "column", gap: "15px" }}>

  {/* DATETIME PICKER */}
  <LocalizationProvider dateAdapter={AdapterDateFns}>
    <DateTimePicker
      label="Event Timestamp"
      value={values.timestamp}
      inputFormat="dd.MM.yyyy HH:mm"
      maxDateTime={new Date()}
      onChange={(val) => setFieldValue("timestamp", val)}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          error={touched.timestamp && Boolean(errors.timestamp)}
          helperText={touched.timestamp && errors.timestamp}
        />
      )}
    />
  </LocalizationProvider>

  {/* DESCRIPTION TEXTAREA */}
  <TextField
    name="description"
    label="Description"
    value={values.description}
    onChange={(e) => setFieldValue("description", e.target.value)}
    multiline
    minRows={4}
    maxRows={8}
    fullWidth
    error={touched.description && Boolean(errors.description)}
    helperText={touched.description && errors.description}
  />

</Form>

            );
          }}
        </Formik>,
        mount
      );
    },
  });
};
 const handleEditLog = (log: any) => {
  Swal.fire({
    title: "Edit Log Entry",
    html: `<div id="swal-edit-form"></div>`,
    showCancelButton: true,
    confirmButtonText: "Save",

    didOpen: () => {
      const mount = document.getElementById("swal-edit-form");

      ReactDOM.render(
        <Formik
          initialValues={{
            description: log.description ?? "",
            timestamp: log.timestamp ? new Date(log.timestamp) : new Date(),
           
          }}
          validationSchema={Yup.object({
            description: Yup.string().required("Description is required"),
            timestamp: Yup.date().required("Timestamp required"),
          })}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              const token = keycloak?.token;

              const formattedTimestamp = format(
                values.timestamp,
                "yyyy-MM-dd HH:mm:ss"
              );

              await axios.patch(
                `${backend_url}/log_book/${log.id}`,
                {
                  description: values.description,
                  timestamp: formattedTimestamp,
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              // cleanup
              const btn = Swal.getConfirmButton();
              if (btn) btn.onclick = null;

              if (mount) ReactDOM.unmountComponentAtNode(mount);
              Swal.close();

              await Swal.fire("Success", "Log updated successfully!", "success");

              resetForm();
              fetchLogs(page, pageSize, filterQuery, sortQuery);
            } catch (err) {
              Swal.fire("Error", "Failed to update log", "error");
            }

            setSubmitting(false);
          }}
        >
          {({ values, errors, touched, setFieldValue, submitForm }) => {
            const btn = Swal.getConfirmButton();
            if (btn) btn.onclick = submitForm;

            return (
              <Form style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                
              
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Event Timestamp"
                    value={values.timestamp}
                    inputFormat="dd.MM.yyyy HH:mm" 
                     maxDateTime={new Date()} 
                    onChange={(val) => {
                      if (val instanceof Date && !isNaN(val.getTime())) {
                        setFieldValue("timestamp", val);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={touched.timestamp && Boolean(errors.timestamp)}
                        helperText={touched.timestamp && errors.timestamp}
                      />
                    )}
                  />
                </LocalizationProvider>
                  <TextField
                  fullWidth
                  label="Description"
                  value={values.description} 
                  multiline 
                  minRows={4}
                  maxRows={8}
                  

                  onChange={(e) => setFieldValue("description", e.target.value)}
                  error={touched.description && Boolean(errors.description)}
                  helperText={touched.description && errors.description}
                />


              </Form>
            );
          }}
        </Formik>,
        mount
      );
    },
  });
};




  const handleDeleteLog = async (log: any) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This log entry will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `${backend_url}/log_book/${log.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          Swal.fire("Deleted", "Log entry removed", "success");
          fetchLogs(page, pageSize, filterQuery, sortQuery);
        } catch (error: any) {
          Swal.fire(
            "Error",
            error.response?.data?.message || "Failed to delete log",
            "error"
          );
        }
      }
    });
  };


const handleExportAll = async () => {
  try {
    const token = keycloak?.token;
    const group_id = localStorage.getItem("group_id");

    if (!group_id) {
      toast.error("Project not selected");
      return;
    }

    setLoading(true);

    const response = await axios.get(
      `${backend_url}/log_books/export`,
      {
        params: {
          group_id,
          ...(filterQuery && { $filter: filterQuery }),
          ...(sortQuery && { $orderby: sortQuery }),
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
        validateStatus: (s) => s < 500,
      }
    );

    if (response.status === 204) {
      toast.error("No data available for export.");
      setLoading(false);
      return;
    }
    if (response.status !== 200) {
      toast.error("Failed to export logs.");
      setLoading(false);
      return;
    }

    const blob = new Blob([response.data], { type: "text/csv" });

    // Extract filename from response headers
    const disposition = response.headers["content-disposition"];
    let filename = "logbook_export.csv";

    if (disposition && disposition.includes("filename=")) {
      filename = disposition.split("filename=")[1].replace(/"/g, "");
    }

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Export completed!");
  } catch (error) {
    console.error(error);
    toast.error("Error during export.");
  } finally {
    setLoading(false);
  }
};

  return (
    <Dashboard>
      <ToastContainer position="bottom-right" autoClose={5000} theme="dark" />

      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" style={{ marginBottom: "10px" }}>
        <LinkCustom to="/">Data Space</LinkCustom>
        <Typography color="text.primary">Log Book</Typography>
      </Breadcrumbs>

      {isOwner ? (
        <Button
          variant="contained"
          color="primary"
          style={{ marginBottom: "10px" }}
          onClick={handleCreateLog}
        >
          Create
        </Button>
      ) : (
        <Button
          variant="contained"
          color="primary"
          disabled
          style={{ marginBottom: "10px" }}
        >
          Create
        </Button>
      )}


      <DataTableCardV2
        title="Log Book"
        description="A log of activity records including timestamps and descriptions."
        columnDefs={columnDefs}
        rowData={logs}
        page={page}
        pageSize={pageSize}
        totalRows={totalRows}
        loading={loading}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        frameworkComponents={{
          dateTimeFilter: DateTimeFilter,
        }}
        context={{ isOwner }}
        onFilterChange={(fq) => { 
          const normalized = normalizeDateFilterForBackend(fq);
          setFilterQuery(normalized);
          setPage(0);
          fetchLogs(0, pageSize, fq, sortQuery);
        }}

        onSortChange={(sq: string) => {
          setSortQuery(sq);
          setPage(0);
          fetchLogs(0, pageSize, filterQuery, sq);
        }} 
        filterType={true}
        exportEnabled={true} 
        csv_title="log_book" 
        handleExportAll={handleExportAll}
      />
    </Dashboard>
  );
};

export default ListLogBook;
