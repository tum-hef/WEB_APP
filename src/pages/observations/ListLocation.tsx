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
      .get(isDev ?  `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Observations`  :  `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Observations`, {
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
    const email = userInfo?.preferred_username;
    await axios
      .get(`${backend_url}/frost-server?email=${email}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
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

  const columns = [
    {
      name: "ID",
      selector: (row: any) => `${row["@iot.id"]}`,
      sortable: true,
      width: "10%",
    },
    {
      name: "Result",
      selector: (row: any) => row.result,
      sortable: true,
      width: "20%",
    },

    {
      name: "Pheonomenon Time",
      selector: (row: any) => row.phenomenonTime,
      sortable: true,
      width: "20%",
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
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Breadcrumbs
        aria-label="breadcrumb"
        style={{
          marginBottom: "10px",
        }}
      >
        <LinkCustom to="/">Data Space</LinkCustom>
        <LinkCustom to="/frost_entities">Data Items</LinkCustom>
        <Typography color="text.primary">Observations</Typography>
      </Breadcrumbs>

      <DataTable
        title="Observations"
        columns={columns}
        data={observations}
        expandableRows
        expandableRowsComponent={ExpandedComponent}
        pagination={true}
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 15]}
      />
    </Dashboard>
  );
};

export default ListObservations;
