import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable, { ExpanderComponentProps } from "react-data-table-component";
import { Breadcrumbs, Button, Typography } from "@mui/material";
import LinkCustom from "../../components/LinkCustom";
import BiotechSharpIcon from "@mui/icons-material/BiotechSharp";
import Dashboard from "../../components/DashboardComponent";
import { useKeycloak } from "@react-keycloak/web";
import { ToastContainer, toast } from "react-toastify";
import { useParams } from "react-router-dom";

const ListDatastreamPerDevice = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [datastream, setDataStream] = useState<any[]>([]);

  const { id } = useParams<{ id: string }>();

  const fetchThings = () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL; 
    const isDev = process.env.REACT_APP_IS_DEVELOPMENT === 'true';  
    axios
      .get(
        isDev ? `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Things(${id})/Datastreams`   : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Things(${id})/Datastreams`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        if (res.status === 200 && res.data.value) {
          setDataStream(res.data.value);
        }
      });
  };

  const fetchFrostPort = async () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL;

    // Determine email based on the "selected_others" logic
    const email = localStorage.getItem("selected_others") === "true"
    ? localStorage.getItem("user_email")
  
    : userInfo?.preferred_username;
    const group_id = localStorage.getItem("group_id");
    if (email) {
      try {
        const response = await axios.post(
          `${backend_url}/frost-server`,
          { user_email: email, group_id: group_id }, // ✅ Adding group_id to the request body
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // ✅ Added Authorization header
            },
          }
        );
        if (response.status === 200 && response.data.PORT) {
          setFrostServerPort(response.data.PORT);
        }
      } catch (error) {
        console.error("Error fetching Frost server port:", error);
        toast.error("Failed to fetch Frost server port. Please try again.");
      }
    }
  };

  useEffect(() => {
    if (frostServerPort !== null) {
      fetchThings();
    } else {
      fetchFrostPort();
    }
  }, [frostServerPort]);

  const columns = [
    {
      name: "ID",
      selector: (row: any) => `${row["@iot.id"]}`,
      sortable: true,
      width: "5%",
    },
    {
      name: "Name",
      selector: (row: any) => row.name,
      sortable: true,
      width: "25%",
    },
    {
      name: "Description",
      selector: (row: any) => row.description,
      sortable: true,
      width: "40%",
    },
    {
      name: "Observations",
      selector: (row: any) => (
        <LinkCustom
          style={{
            color: "#233044",
            textDecoration: "none",
          }}
          to={`/devices/${id}/datastreams/${row["@iot.id"]}/observations`}
        >
          <BiotechSharpIcon />
        </LinkCustom>
      ),
      sortable: true,
      width: "20%",
    },
  ];

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
        <LinkCustom to="/devices">Devices</LinkCustom>
        <Typography color="text.primary">
          Datastream of Device #{id}{" "}
          {datastream[0]?.name && `(${datastream[0]?.name})`}
        </Typography>
      </Breadcrumbs>

      <DataTable
        title={`Datastreams for Device #${id} ${datastream[0]?.name}`}
        columns={columns}
        data={datastream}
        pagination={true}
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 15]}
      />
    </Dashboard>
  );
};

export default ListDatastreamPerDevice;
