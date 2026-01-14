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
import MuiDateTimeRangeFilter from "../../components/MuiDateRangePickerFilter";
import { buildFilterQuery, buildSortQuery } from "../../utils/frostQueryBuilder";
import { AgGridReact } from "ag-grid-react";
import InfiniteDataTableCard from "../../components/InfiniteDataTableCard";
import { createObservationsDatasource } from "../services/createObservationsDatasource";
const ListObservations = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);


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
      // fetchObservations(page, pageSize);
    } else {
      fetchFrostPort();
    }
  }, [frostServerPort]);

  const columnDefs = [
    {
  headerName: "ID",
  field: "@iot.id",
  sortable: true,
  filter: "agNumberColumnFilter",
  valueGetter: (params:any) => params.data?.["@iot.id"],
  flex: 1,
},
    {
      headerName: "Result",
      field: "result",
      filter: "agNumberColumnFilter",
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
    comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
      if (!cellValue) return -1;

      const cellDate = new Date(cellValue);

      // Compare only by date (AG Grid requirement)
      const cellMidnight = new Date(
        cellDate.getFullYear(),
        cellDate.getMonth(),
        cellDate.getDate()
      );

      if (cellMidnight < filterLocalDateAtMidnight) return -1;
      if (cellMidnight > filterLocalDateAtMidnight) return 1;
      return 0;
    },

    browserDatePicker: true,
    suppressAndOrCondition: true,
  },
}

  ];

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

<InfiniteDataTableCard
title="Observations"
  description="This page lists all recorded observations in the system. Each observation contains a measurement result and the time it was collected."
  columnDefs={columnDefs}
 createDatasource={(args) => {
  const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
  const isDev = process.env.REACT_APP_IS_DEVELOPMENT === "true";

  const baseUrl = isDev
    ? `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Observations`
    : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Observations`;

  return createObservationsDatasource({
    token,
    baseUrl,
    ...args, // pageSize, currentPage, callbacks, etc.
  });
}}
/>
    </Dashboard>
  );
};

export default ListObservations;
