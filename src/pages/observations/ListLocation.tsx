import { useState, useEffect } from "react";
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
import DataTableCard from "../../components/DataGrid";
import moment from "moment";
const ListObservations = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [observations, setObservations] = useState<any[]>([]);

  const fetchObservations = () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
    const isDev = process.env.REACT_APP_IS_DEVELOPMENT === 'true';
    axios
      .get(isDev ? `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Observations` : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Observations`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.status === 200 && res.data.value) {
          console.log(res.data.value);
          setObservations(res.data.value);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error Getting Locations");
      });
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
      fetchObservations();
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
      width: 280,
      valueFormatter: (params: any) => {
        if (!params.value) return "";
        return moment(params.value).format("YYYY-MM-DD HH:mm:ss"); // ✅ show full datetime
      },
      filterParams: {
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          if (!cellValue) return -1;

          // convert both filter date and cell value to full datetime
          const cellDate = moment(cellValue).toDate();
          const filterDate = moment(filterLocalDateAtMidnight).toDate();

          if (cellDate.getTime() === filterDate.getTime()) {
            return 0;
          }
          return cellDate < filterDate ? -1 : 1;
        },
        browserDatePicker: true,
        suppressAndOrCondition: false, // ✅ enables "in range"
      },
      wrapText: true,
      autoHeight: true,
      cellStyle: { whiteSpace: "normal" },
    },
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

      {/* Create Button */}

      <DataTableCard title="Observations" description="This page lists all recorded observations in the system. 
Each observation contains a measurement result and the time it was collected." columnDefs={columnDefs} rowData={observations} />
    </Dashboard>
  );
};

export default ListObservations;
