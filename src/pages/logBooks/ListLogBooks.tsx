import { useState, useEffect } from "react";
import axios from "axios";
import { Breadcrumbs, Button, TextField, Typography } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";

import Dashboard from "../../components/DashboardComponent";
import LinkCustom from "../../components/LinkCustom";
import DataTableCardV2 from "../../components/DataGridServerSide";
import { useKeycloak } from "@react-keycloak/web";
import { FilterQueryBuilder, SortQueryBuilder } from "../../utils/frostQueryBuilder";
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

const handleCreateLog = () => {
  Swal.fire({
    title: "Create Log Entry",
    html: `<div id="swal-create-form"></div>`,
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
                
                {/* DESCRIPTION */}
                <TextField
                  name="description"
                  label="Description"
                  value={values.description}
                  onChange={(e) => setFieldValue("description", e.target.value)}
                  error={touched.description && Boolean(errors.description)}
                  helperText={touched.description && errors.description}
                  fullWidth
                />

                {/* DATETIME PICKER */}
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Timestamp"
                    value={values.timestamp}
                    inputFormat="dd.MM.yyyy HH:mm"
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

              </Form>
            );
          }}
        </Formik>,
        mount
      );
    },
  });
};




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
      headerName: "Timestamp",
      field: "timestamp",
      sortable: true,
      filter: "agDateColumnFilter",
      cellDataType: "dateTime",
      flex: 1.2,

      // Return REAL date object (for AG Grid filter)
      valueGetter: (params: any) => params.data.timestamp ? new Date(params.data.timestamp) : null,

      // Show readable format to user
      valueFormatter: (params: any) =>
        params.value ? moment(params.value).format("DD.MM.YYYY HH:mm:ss") : "",
    },

    {
      headerName: "Created At",
      field: "createdAt",
      sortable: true,
      filter: "agDateColumnFilter",
      cellDataType: "dateTime",
      flex: 1.2,

      valueGetter: (params: any) => params.data.createdAt ? new Date(params.data.createdAt) : null,

      valueFormatter: (params: any) =>
        params.value ? moment(params.value).format("DD.MM.YYYY HH:mm:ss") : "",
    },
    {
      headerName: "",
      field: "edit",
      width: 60,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        return (
          <EditIcon
            sx={{ cursor: "pointer", color: "#1976d2" }}
            onClick={() => handleEditLog(params.data)}
          />
        );
      },
    },
    {
      headerName: "",
      field: "delete",
      width: 60,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        return (
          <DeleteIcon
            sx={{ cursor: "pointer", color: "#d32f2f" }}
            onClick={() => handleDeleteLog(params.data)}
          />
        );
      },
    },




  ];

  const handleEditLog = (log: any) => {
    let editedDescription = log.description;
    let editedTimestamp: any = log.timestamp ? new Date(log.timestamp) : new Date();

    Swal.fire({
      title: "Edit Log Entry",
      html: `
      <div id="swal-desc"></div>
      <div id="swal-dt" style="margin-top: 15px;"></div>
    `,
      showCancelButton: true,
      confirmButtonText: "Save",

      didOpen: () => {
        const descDiv = document.getElementById("swal-desc");
        const dtDiv = document.getElementById("swal-dt");

        // === Description field ===
        ReactDOM.render(
          <TextField
            fullWidth
            label="Description"
            defaultValue={editedDescription}
            onChange={(e) => (editedDescription = e.target.value)}
          />,
          descDiv
        );

        // === MUI DateTimePicker WITH MOMENT ===
        ReactDOM.render(
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Timestamp"
              value={editedTimestamp}
              inputFormat="dd.MM.yyyy HH:mm"  // ✔ correct Moment format
              onChange={(value) => {
                editedTimestamp = value;
              }}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>,
          dtDiv
        );
      },

      preConfirm: () => {
        if (!editedDescription.trim()) {
          Swal.showValidationMessage("Description cannot be empty");
          return false;
        }

        if (!editedTimestamp || !editedTimestamp.isValid()) {
          Swal.showValidationMessage("Invalid timestamp");
          return false;
        }

        return {
          description: editedDescription.trim(),
          timestamp: editedTimestamp.toISOString(), // ✔ convert moment → ISO
        };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.patch(
            `${backend_url}/log_book/${log.id}`,
            {
              description: result.value.description,
              timestamp: result.value.timestamp,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          Swal.fire("Success", "Log Book updated successfully!", "success");
          fetchLogs(page, pageSize, filterQuery, sortQuery);

        } catch (e) {
          Swal.fire("Error", "Failed to update Log Book", "error");
        }
      }
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
        onFilterChange={(fq) => {
          setFilterQuery(fq);
          setPage(0);
          fetchLogs(0, pageSize, fq, sortQuery);
        }}

        onSortChange={(sq: string) => {
          setSortQuery(sq);
          setPage(0);
          fetchLogs(0, pageSize, filterQuery, sq);
        }}
      />
    </Dashboard>
  );
};

export default ListLogBook;
