import { useState, useEffect } from "react";
import axios from "axios";
import { Breadcrumbs, Typography } from "@mui/material";
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
  valueGetter: (params:any) => params.data.timestamp ? new Date(params.data.timestamp) : null,

  // Show readable format to user
  valueFormatter: (params:any) =>
    params.value ? moment(params.value).format("DD.MM.YYYY HH:mm:ss") : "",
},

{
  headerName: "Created At",
  field: "createdAt",
  sortable: true,
  filter: "agDateColumnFilter",
  cellDataType: "dateTime",
  flex: 1.2,

  valueGetter: (params:any) => params.data.createdAt ? new Date(params.data.createdAt) : null,

  valueFormatter: (params:any) =>
    params.value ? moment(params.value).format("DD.MM.YYYY HH:mm:ss") : "",
},
{
  headerName: "",
  field: "edit",
  width: 60,
  sortable: false,
  filter: false,
  cellRenderer: (params:any) => {
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
  cellRenderer: (params:any) => {
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
  Swal.fire({
    title: "Edit Log Entry",
    html: `
      <div class="swal-input-row-with-label">
        <label for="description">Description</label>
        <input id="description" class="swal2-input" value="${log.description || ""}">
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Save",
    preConfirm: () => {
      const description = (document.getElementById("description") as HTMLInputElement).value.trim();
      if (!description) {
        Swal.showValidationMessage("Description cannot be empty");
        return false;
      }
      return { description };
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.patch(
          `${backend_url}/log_book/${log.id}`,
          {
            description: result.value.description,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        Swal.fire("Success", "Log updated successfully!", "success");
        fetchLogs(page, pageSize, filterQuery, sortQuery); // refresh
      } catch (e) {
        Swal.fire("Error", "Failed to update log", "error");
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
      } catch (error:any) {
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
