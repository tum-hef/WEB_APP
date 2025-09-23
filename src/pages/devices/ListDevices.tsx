import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
} from "@mui/material";
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
import DataTableCardV2 from "../../components/DataGridServerSide";

const Devices = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [filterQuery, setFilterQuery] = useState("");
  const [sortQuery, setSortQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLinks, setPageLinks] = useState<{ [key: number]: string }>({});
  const isOwner = useIsOwner();

  const fetchThings = async (
    newPage = 0,
    newPageSize = pageSize,
    filter = filterQuery,
    sort = sortQuery
  ) => {
    if (frostServerPort === null) return;
    setLoading(true);

    const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
    const isDev = process.env.REACT_APP_IS_DEVELOPMENT === "true";

    let url = isDev
      ? `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Things`
      : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Things`;

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

      setDevices(res.data.value);
      if (res.data["@iot.count"]) setTotalRows(res.data["@iot.count"]);
      if (res.data["@iot.nextLink"]) {
        setPageLinks((prev) => ({
          ...prev,
          [newPage + 1]: res.data["@iot.nextLink"],
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
      fetchThings(page, pageSize);
    } else {
      fetchFrostPort();
    }
  }, [frostServerPort]);

  const columnDefs = [
    {
      headerName: "ID",
      field: "@iot.id",
      filter: "agTextColumnFilter",
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
      cellClass: "ag-center-cell",
    },
    {
      headerName: "Description",
      field: "description",
      filter: "agTextColumnFilter",
      flex: 1,
      autoHeight: false,
      wrapText: false,
      cellClass: "ag-center-cell",
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
      cellRenderer: (params: any) => {
        const row = params.data;
        return (
          <EditOutlinedIcon
            style={{
              cursor: isOwner ? "pointer" : "not-allowed",
              color: isOwner ? "red" : "gray",
              opacity: isOwner ? 1 : 0.4,
              pointerEvents: isOwner ? "auto" : "none",
            }}
            onClick={() => {
              if (!isOwner) return;

              Swal.fire({
                title: "Edit Device",
                html:
                  `<div class="swal-input-row-with-label">` +
                  `<label for="name">New Name</label>` +
                  `<div class="swal-input-field">` +
                  `<input id="name" class="swal2-input" placeholder="Enter the new device name" value="${
                    row.name || ""
                  }">` +
                  `</div>` +
                  `</div>` +
                  `<div class="swal-input-row">` +
                  `<label for="description">New Description</label>` +
                  `<input id="description" class="swal2-input" placeholder="Enter the new device description" value="${
                    row.description || ""
                  }">` +
                  `</div>`,
                showCancelButton: true,
                confirmButtonText: "Save",
                showLoaderOnConfirm: true,
                preConfirm: () => {
                  const name = (
                    document.getElementById("name") as HTMLInputElement
                  ).value;
                  const description = (
                    document.getElementById("description") as HTMLInputElement
                  ).value;
                  if (!name) {
                    Swal.showValidationMessage("Please enter a device name");
                  } else {
                    return { name, description };
                  }
                },
              }).then((result) => {
                if (result.isConfirmed) {
                  const { name, description } = result.value as {
                    name: string;
                    description: string;
                  };

                  axios
                    .post(
                      `${process.env.REACT_APP_BACKEND_URL}/update`,
                      {
                        url: `Things(${row["@iot.id"]})`,
                        FROST_PORT: frostServerPort,
                        body: { name, description },
                        keycloak_id: userInfo?.sub,
                      },
                      {
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${keycloak?.token}`,
                        },
                      }
                    )
                    .then((response) => {
                      if (response.status === 200) {
                        const newDevices = devices.map((device) => {
                          if (device["@iot.id"] === row["@iot.id"]) {
                            device.name = name;
                            device.description = description;
                          }
                          return device;
                        });
                        setDevices(newDevices);

                        Swal.fire({
                          icon: "success",
                          title: "Success",
                          text: "Device edited successfully!",
                        });
                      } else {
                        Swal.fire({
                          icon: "error",
                          title: "Oops...",
                          text: "Something went wrong! Device not edited!",
                        });
                      }
                    })
                    .catch((error) => {
                      axios.post(
                        `http://localhost:4500/mutation_error_logs`,
                        {
                          keycloak_id: userInfo?.sub,
                          method: "UPDATE",
                          attribute: "Devices",
                          attribute_id: row["@iot.id"],
                          frost_port: frostServerPort,
                        },
                        {
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${keycloak?.token}`,
                          },
                        }
                      );
                      Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Something went wrong! Device not edited!",
                      });
                    });
                }
              });
            }}
          />
        );
      },
    },
    {
      headerName: "Delete",
      filter: false,
      minWidth: 100,
      cellClass: "ag-center-cell",
      cellRenderer: (params: any) => {
        const row = params.data;
        return (
          <DeleteForeverOutlinedIcon
            style={{
              cursor: isOwner ? "pointer" : "not-allowed",
              color: isOwner ? "red" : "gray",
              opacity: isOwner ? 1 : 0.4,
              pointerEvents: isOwner ? "auto" : "none",
            }}
            onClick={() => {
              if (!isOwner) return;

              Swal.fire({
                title: `Are you sure you want to delete ${row.name}?`,
                text: "You will not be able to recover this device! Linked datastream might become dysfunctional!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!",
              }).then(async (result) => {
                if (result.isConfirmed) {
                  try {
                    const response = await axios.post(
                      `${process.env.REACT_APP_BACKEND_URL}/delete`,
                      {
                        url: `Things(${row["@iot.id"]})`,
                        FROST_PORT: frostServerPort,
                        keycloak_id: userInfo?.sub,
                      },
                      {
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `${token}`,
                        },
                      }
                    );

                    if (response.status === 200) {
                      Swal.fire({
                        icon: "success",
                        title: "Success",
                        text: "Device deleted successfully!",
                      });

                      const newDevices = devices.filter(
                        (device) => device["@iot.id"] !== row["@iot.id"]
                      );
                      setDevices(newDevices);
                    } else {
                      Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Something went wrong! Device not deleted!",
                      });
                    }
                  } catch (error) {
                    axios.post(
                      `http://localhost:4500/mutation_error_logs`,
                      {
                        keycloak_id: userInfo?.sub,
                        method: "DELETE",
                        attribute: "Devices",
                        attribute_id: row["@iot.id"],
                        frost_port: frostServerPort,
                      },
                      {
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );

                    Swal.fire({
                      icon: "error",
                      title: "Oops...",
                      text: "Something went wrong! Device not deleted!",
                    });
                  }
                }
              });
            }}
          />
        );
      },
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchThings(newPage, pageSize, filterQuery, sortQuery);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPage(0);
    setPageSize(newPageSize);
    setPageLinks({});
    fetchThings(0, newPageSize, filterQuery, sortQuery);
  };
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

      <DataTableCardV2
        title="Devices"
        description="This page lists all registered devices in your project. 
Each device can have one or more datastreams (e.g., temperature, humidity) that provide sensor observations."
        columnDefs={columnDefs}
        rowData={devices}
        page={page}
        pageSize={pageSize}
        totalRows={totalRows}
        loading={loading}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onFilterChange={(fq) => {
          setFilterQuery(fq);
          setPage(0);
          setPageLinks({});
          fetchThings(0, pageSize, fq, sortQuery);
        }}
        onSortChange={(sq) => {
          setSortQuery(sq);
          setPage(0);
          setPageLinks({});
          fetchThings(0, pageSize, filterQuery, sq);
        }}
      />
    </Dashboard>
  );
};

export default Devices;
