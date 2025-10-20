import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import DataTable, { ExpanderComponentProps } from "react-data-table-component";
import { Breadcrumbs, Button, Typography } from "@mui/material";
import LinkCustom from "../../components/LinkCustom";

import Dashboard from "../../components/DashboardComponent";
import { useKeycloak } from "@react-keycloak/web";
import { ToastContainer, toast } from "react-toastify";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import Swal from "sweetalert2";
import ReactGA from "react-ga4";
import { GAactionsObservations } from "../../utils/GA";
import DataTableCardV2 from "../../components/DataGridServerSide";

import moment from "moment";
import MuiDateRangeFilter from "../../components/MuiDateField";
const ListObservations = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [observations, setObservations] = useState<any[]>([]);
  const [filterQuery, setFilterQuery] = useState("");
const [sortQuery, setSortQuery] = useState("");
const [page, setPage] = useState(0);
const [pageSize, setPageSize] = useState(10);
const [totalRows, setTotalRows] = useState(0);
const [pageLinks, setPageLinks] = useState<{ [key: number]: string }>({});
const [loading, setLoading] = useState(false);


  const fetchObservations = useCallback(
  async (newPage = 0, newPageSize = pageSize, filter = filterQuery, sort = sortQuery) => {
    if (frostServerPort === null) return;
    setLoading(true);

    const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
    const isDev = process.env.REACT_APP_IS_DEVELOPMENT === "true";

    let url = isDev
      ? `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Observations`
      : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Observations`;

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

      setObservations(res.data.value);
      console.log("checking purspose data", res.data.value);
      if (res.data["@iot.count"]) setTotalRows(res.data["@iot.count"]);
      if (res.data["@iot.nextLink"]) {
        setPageLinks((prev) => ({ ...prev, [newPage + 1]: res.data["@iot.nextLink"] }));
      }
    } catch {
      toast.error("Error Getting Observations");
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

    await axios.post(
      `${backend_url}/frost-server`,
      { user_email: email, group_id: group_id },
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
    ReactGA.event({
      category: GAactionsObservations.category,
      action: GAactionsObservations.action,
      label: GAactionsObservations.label,
    });

    if (frostServerPort !== null) {
      fetchObservations(page, pageSize);
    } else {
      fetchFrostPort();
    }
  }, [frostServerPort]);

  const columnDefs = [
    {
      headerName: "ID",
      field: "@iot.id",
      sortable: true,
      flex: 1,
      valueGetter: (params: any) => params.data["@iot.id"]

    },
    {
      headerName: "Result",
      field: "result",
      sortable: true,
      flex: 2,
    },
 {
    headerName: "Phenomenon Time",
    field: "phenomenonTime",
    sortable: true,
    filter: "agDateColumnFilter",
    valueFormatter: (params: any) =>
      params.value ? moment(params.value).format("YYYY-MM-DD HH:mm:ss") : "",
    filterParams: {
      comparator: () => 0,              // let backend handle filtering
      browserDatePicker: true,
      suppressAndOrCondition: true,
    },
  },
  ];


useEffect(()=>{
  console.log("observations data" , observations);
},[observations])

  const ExpandedComponent: React.FC<ExpanderComponentProps<any>> = ({
    data,
  }) => {
    return (
      <div
        style={{
          margin: "10px",
        }}
      >
        <div>
          <b>Name: </b>
          {data?.name}
        </div>
        <div>
          <b>Result: </b>
          {data?.result}
        </div>
        <div>
          <b>Pheonomenon Time: </b>
          {data?.phenomenonTime}
        </div>
      </div>
    );
  };

  return (
    <Dashboard>
      <ToastContainer position="bottom-right" autoClose={5000} theme="dark" />

      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" style={{ marginBottom: "10px" }}>
        <LinkCustom to="/">Data Space</LinkCustom>
        <LinkCustom to="/frost_entities">Data Items</LinkCustom>
        <Typography color="text.primary">Observations</Typography>
      </Breadcrumbs>

      {/* Create Button */}

     <DataTableCardV2
  title="Observations"
  description="This page lists all recorded observations in the system. Each observation contains a measurement result and the time it was collected."
  columnDefs={columnDefs}
  rowData={observations}
  page={page}
  pageSize={pageSize}
  totalRows={totalRows}
  loading={loading}
  onPageChange={(newPage) => {
    setPage(newPage);
    fetchObservations(newPage, pageSize, filterQuery, sortQuery);
  }}
  onPageSizeChange={(newPageSize) => {
    setPage(0);
    setPageSize(newPageSize);
    setPageLinks({});
    fetchObservations(0, newPageSize, filterQuery, sortQuery);
  }}
  onFilterChange={(fq) => {
    setFilterQuery(fq);
    setPage(0);
    setPageLinks({});
    fetchObservations(0, pageSize, fq, sortQuery);
  }}
  onSortChange={(sq) => {
    setSortQuery(sq);
    setPage(0);
    setPageLinks({});
    fetchObservations(0, pageSize, filterQuery, sq);
  }}
/>

    </Dashboard>
  );
};

export default ListObservations;
