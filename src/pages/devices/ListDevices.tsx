import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css"; // Material base
import axios from "axios";
import { Breadcrumbs, Button, Card, CardContent, CardHeader, Typography } from "@mui/material";
import LinkCustom from "../../components/LinkCustom";
import Dashboard from "../../components/DashboardComponent";
import { useKeycloak } from "@react-keycloak/web";
import { ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import MapIcon from "@mui/icons-material/Map";
import { useAppSelector, useIsOwner } from "../../hooks/hooks";

const Devices = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const isOwner = useIsOwner();

  const fetchThings = async () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
    const isDev = process.env.REACT_APP_IS_DEVELOPMENT === "true";
    const res = await axios.get(
      isDev
        ? `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Things`
        : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Things`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (res.status === 200 && res.data.value) {
      setDevices(res.data.value);
    }
  };

  const fetchFrostPort = async () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL;
    const email =
      localStorage.getItem("selected_others") === "true"
        ? localStorage.getItem("user_email")
        : userInfo?.preferred_username;
    const group_id = localStorage.getItem("group_id");
    const res = await axios.post(
      `${backend_url}/frost-server`,
      { user_email: email, group_id },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (res.status === 200 && res.data.PORT) {
      setFrostServerPort(res.data.PORT);
    }
  };

  useEffect(() => {
    if (frostServerPort !== null) {
      fetchThings();
    } else {
      fetchFrostPort();
    }
  }, [frostServerPort]);

  const columnDefs = [
    {
      headerName: "ID",
      field: "@iot.id",
      filter: "agNumberColumnFilter",
      minWidth: 100,
      autoHeight: false,
      wrapText: false,
      cellClass: "ag-center-cell",
      valueGetter: (params: any) => params.data["@iot.id"],
    },
    {
      headerName: "Name",
      field: "name",
      filter: "agTextColumnFilter",
      minWidth: 200,
      autoHeight: false,
      wrapText: false,
      cellClass: "ag-center-cell"
    },
    {
      headerName: "Description",
      field: "description",
      filter: "agTextColumnFilter",
      flex: 1,
      autoHeight: false,
      wrapText: false,
      cellClass: "ag-center-cell"
    },
    {
      headerName: "Datastreams",
      filter: false,
      minWidth: 130,
      cellClass: "ag-center-cell",
      cellRenderer: (params: any) => (
        <LinkCustom to={`/devices/${params.data["@iot.id"]}/datastreams`}>
          <FolderSpecialIcon />
        </LinkCustom>
      ),
    },
    {
      headerName: "Edit",
      filter: false,
      minWidth: 100,
      cellClass: "ag-center-cell",
      cellRenderer: (params: any) => (
        <EditOutlinedIcon
          style={{
            cursor: isOwner ? "pointer" : "not-allowed",
            color: isOwner ? "red" : "gray",
            opacity: isOwner ? 1 : 0.4,
          }}
          onClick={() => Swal.fire("Edit Device", `Editing ${params.data.name}`)}
        />
      ),
    },
    {
      headerName: "Delete",
      filter: false,
      minWidth: 100,
      cellClass: "ag-center-cell",
      cellRenderer: (params: any) => (
        <DeleteForeverOutlinedIcon
          style={{
            cursor: isOwner ? "pointer" : "not-allowed",
            color: isOwner ? "red" : "gray",
            opacity: isOwner ? 1 : 0.4,
          }}
          onClick={() => Swal.fire("Delete Device", `Deleting ${params.data.name}`)}
        />
      ),
    },
    {
      headerName: "Location",
      filter: false,
      minWidth: 120,
      cellClass: "ag-center-cell",
      cellRenderer: (params: any) => (
        <LinkCustom to={`/locations/${params.data["@iot.id"]}`}>
          <MapIcon />
        </LinkCustom>
      ),
    },
  ];

  return (
  <Dashboard>
  <ToastContainer position="bottom-right" autoClose={5000} theme="dark" />

  {/* Breadcrumbs */}
  <Breadcrumbs aria-label="breadcrumb" style={{ marginBottom: "10px" }}>
    <LinkCustom to="/">Data Space</LinkCustom>
    <LinkCustom to="/frost_entities">Data Items</LinkCustom>
    <Typography color="text.primary">Devices</Typography>
  </Breadcrumbs>

  {/* Create Button Above Card */}
  {isOwner ? (
    <LinkCustom to="/devices/store">
      <Button
        variant="contained"
        color="primary"
        style={{ marginBottom: "12px" }}
      >
        Create
      </Button>
    </LinkCustom>
  ) : (
    <Button
      disabled
      variant="contained"
      color="primary"
      style={{ marginBottom: "12px" }}
    >
      Create
    </Button>
  )}

  {/* Card Wrapper */}
  <Card elevation={1} style={{ borderRadius: "8px" }}>
   <CardHeader
  title={
    <Typography variant="h3" style={{ fontWeight: 400 }}>
      Devices
    </Typography>
  }
/>

    <CardContent style={{ padding: 0 }}>
      <div
        className="ag-theme-material custom-ag-grid"
        style={{ height: 500, width: "100%" }}
      >
        <AgGridReact
          rowData={devices}
          columnDefs={columnDefs}
          pagination
          paginationPageSize={5}
          rowHeight={65}
          headerHeight={42}
          suppressRowTransform={true}
          defaultColDef={{
            filter: true,
            floatingFilter: true,
            sortable: true,
            resizable: true,
            autoHeight: false,
            wrapText: false,
            cellStyle: { textAlign: "left" },
          }}
        />
      </div>
    </CardContent>
  </Card>
</Dashboard>

  );
};

export default Devices;
