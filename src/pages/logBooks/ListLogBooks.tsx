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
}


  ];

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
