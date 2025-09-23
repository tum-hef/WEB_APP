import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Breadcrumbs, Button, Typography } from "@mui/material";
import LinkCustom from "../../components/LinkCustom";

import Dashboard from "../../components/DashboardComponent";
import { useKeycloak } from "@react-keycloak/web";
import { ToastContainer, toast } from "react-toastify";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import Swal from "sweetalert2";
import ReactGA from "react-ga4";
import { GAactionsDataStreams } from "../../utils/GA";
import { useAppSelector, useIsOwner } from "../../hooks/hooks";
import DataTableCardV2 from "../../components/DataGridServerSide"


const ListDatastream = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [datastreams, setDatastreams] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [pageLinks, setPageLinks] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(false);

  const PAGE_SIZE = 10;
  const [pageSize, setPageSize] = useState(PAGE_SIZE); 
  const [filterQuery, setFilterQuery] = useState("");
const [sortQuery, setSortQuery] = useState("");
  const selectedGroupId = useAppSelector(
    (state) => state.roles.selectedGroupId
  );
  const isOwner = useIsOwner();

const fetchDatastreams = useCallback(
  async (newPage = 0, newPageSize = pageSize, filter = filterQuery, sort = sortQuery) => {
    if (frostServerPort === null) return;
    setLoading(true);

    const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
    const isDev = process.env.REACT_APP_IS_DEVELOPMENT === "true";

    let url = isDev
      ? `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Datastreams`
      : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Datastreams`;

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

      setDatastreams(res.data.value);
      if (res.data["@iot.count"]) setTotalRows(res.data["@iot.count"]);
      if (res.data["@iot.nextLink"]) {
        setPageLinks((prev) => ({ ...prev, [newPage + 1]: res.data["@iot.nextLink"] }));
      }
    } catch (err) {
      toast.error("Error Getting Datastreams");
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

    if (!email || !group_id) {
      toast.error("User email and group ID are required.");
      return;
    }

    try {
      const res = await axios.post(
        `${backend_url}/frost-server`,
        { user_email: email, group_id: group_id }, // ✅ Adding group_id to the request body
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Added Authorization header
          },
        }
      );

      if (res.status === 200 && res.data.PORT) {
        setFrostServerPort(res.data.PORT);
      }
    } catch (error) {
      console.error("Error fetching Frost Server Port:", error);
      toast.error("An error occurred while fetching the Frost Server port.");
    }
  };

  const handleDeleteDatastream = async (id: number) => {
    const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
    const isDev = process.env.REACT_APP_IS_DEVELOPMENT === "true";
    const baseUrl = isDev
      ? `${backend_url}:${frostServerPort}`
      : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}`;

    try {
      const confirmed = await Swal.fire({
        title: "Are you sure?",
        text: "This will permanently delete the datastream.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (confirmed.isConfirmed) {
        const deleteUrl = `${baseUrl}/FROST-Server/v1.0/Datastreams(${id})`;

        await axios.delete(deleteUrl, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        toast.success("Datastream deleted successfully!");
        fetchDatastreams(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting datastream:", error);
      toast.error("Failed to delete datastream");
    }
  };

 const handlePageChange = (newPage: number) => {
  setPage(newPage);
  fetchDatastreams(newPage, pageSize, filterQuery, sortQuery);
};

const handlePageSizeChange = (newPageSize: number) => {
  setPage(0);
  setPageSize(newPageSize);
  setPageLinks({});
  fetchDatastreams(0, newPageSize, filterQuery, sortQuery);
};

  useEffect(() => {
    ReactGA.event({
      category: GAactionsDataStreams.category,
      action: GAactionsDataStreams.action,
      label: GAactionsDataStreams.label,
    });

    if (frostServerPort !== null) {
      fetchDatastreams(page, pageSize);
    } else {
      fetchFrostPort();
    }
  }, [frostServerPort]);

  const columns = [
    {
      headerName: "ID",
      field: "@iot.id",
      sortable: true,
      flex: 1,
      filter: "agTextColumnFilter",
      valueGetter: (params: any) => params.data["@iot.id"],
    },
    {
      headerName: "Name",
      field: "name",
      sortable: true,
      flex: 2,
      filter: "agTextColumnFilter",
    },
    {
      headerName: "Description",
      field: "description",
      sortable: true,
      flex: 3,
      wrapText: true,
      autoHeight: true,
      filter: "agTextColumnFilter",
      cellStyle: { whiteSpace: "normal" },
    },
    {
      name: "Edit",
      headerName: "Edit",
      width: 100,
      flex: 1,
      filter: false,
      cellRenderer: (params: any) => (
        <EditOutlinedIcon
          style={{
            cursor: isOwner ? "pointer" : "not-allowed",
            color: isOwner ? "red" : "gray",
            opacity: isOwner ? 1 : 0.4,
            pointerEvents: isOwner ? "auto" : "none",
          }}
          onClick={() => {
            const row = params?.data;
            if (!isOwner) return;
            Swal.fire({
              title: "Edit Datastream",
              html:
                `<div class="swal-input-row-with-label">` +
                `<label for="description">Description</label>` +
                `<div class="swal-input-field">` +
                `<input id="description" class="swal2-input" placeholder="Enter description" value="${
                  row.description || ""
                }">` +
                `</div>` +
                `</div>` +
                `<div class="swal-input-row-with-label">` +
                `<label for="unitName">Unit Name</label>` +
                `<div class="swal-input-field">` +
                `<input id="unitName" class="swal2-input" placeholder="Enter unit name" value="${
                  row.unitOfMeasurement?.name || ""
                }">` +
                `</div>` +
                `</div>` +
                `<div class="swal-input-row-with-label">` +
                `<label for="unitSymbol">Unit Symbol</label>` +
                `<div class="swal-input-field">` +
                `<input id="unitSymbol" class="swal2-input" placeholder="Enter unit symbol" value="${
                  row.unitOfMeasurement?.symbol || ""
                }">` +
                `</div>` +
                `</div>` +
                `<div class="swal-input-row-with-label">` +
                `<label for="unitDefinition">Unit Definition</label>` +
                `<div class="swal-input-field">` +
                `<input id="unitDefinition" class="swal2-input" placeholder="Enter unit definition" value="${
                  row.unitOfMeasurement?.definition || ""
                }">` +
                `</div>` +
                `</div>`,
              showCancelButton: true,
              confirmButtonText: "Save",
              showLoaderOnConfirm: true,
              preConfirm: () => {
                const description = (
                  document.getElementById("description") as HTMLInputElement
                ).value;
                const unitName = (
                  document.getElementById("unitName") as HTMLInputElement
                ).value;
                const unitSymbol = (
                  document.getElementById("unitSymbol") as HTMLInputElement
                ).value;
                const unitDefinition = (
                  document.getElementById("unitDefinition") as HTMLInputElement
                ).value;

                if (!description) {
                  Swal.showValidationMessage("Please enter a description");
                } else {
                  return {
                    description,
                    unitOfMeasurement: {
                      name: unitName,
                      symbol: unitSymbol,
                      definition: unitDefinition,
                    },
                  };
                }
              },
            }).then((result) => {
              if (result.isConfirmed) {
                const { description, unitOfMeasurement } = result.value as {
                  description: string;
                  unitOfMeasurement: {
                    name: string;
                    symbol: string;
                    definition: string;
                  };
                };

                axios
                  .post(
                    `${process.env.REACT_APP_BACKEND_URL}/update`,
                    {
                      url: `Datastreams(${row["@iot.id"]})`,
                      FROST_PORT: frostServerPort,
                      body: { description, unitOfMeasurement },
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
                      const updatedList = datastreams.map((stream) => {
                        if (stream["@iot.id"] === row["@iot.id"]) {
                          stream.description = description;
                          stream.unitOfMeasurement = unitOfMeasurement;
                        }
                        return stream;
                      });
                      setDatastreams(updatedList);
                      Swal.fire({
                        icon: "success",
                        title: "Success",
                        text: "Datastream edited successfully!",
                      });
                    } else {
                      Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Datastream not edited!",
                      });
                    }
                  })
                  .catch(() => {
                    axios.post(
                      `http://localhost:4500/mutation_error_logs`,
                      {
                        keycloak_id: userInfo?.sub,
                        method: "UPDATE",
                        attribute: "Datastreams",
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
                      text: "Something went wrong! Datastream not edited!",
                    });
                  });
              }
            });
          }}
        />
      ),
    },
    {
      name: "Delete",
      headerName: "Delete",
      width: 100,
      flex: 1,
      filter: false,
      cellRenderer: (params: any) => (
        <DeleteForeverOutlinedIcon
          style={{
            cursor: isOwner ? "pointer" : "not-allowed",
            color: isOwner ? "red" : "gray",
            opacity: isOwner ? 1 : 0.4,
            pointerEvents: isOwner ? "auto" : "none",
          }}
          onClick={() => {
            if (!isOwner) return;
            const row = params?.data;
            Swal.fire({
              title: `Delete "${row.name}"?`,
              text: "This will permanently delete the datastream and its related data!",
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
                      url: `Datastreams(${row["@iot.id"]})`,
                      FROST_PORT: frostServerPort,
                      keycloak_id: userInfo?.sub,
                    },
                    {
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `${token}`, // 👈 No "Bearer" prefix since your current API works that way
                      },
                    }
                  );

                  if (response.status === 200) {
                    Swal.fire({
                      icon: "success",
                      title: "Deleted!",
                      text: `Datastream "${row.name}" deleted successfully!`,
                    });

                    // Remove the deleted datastream from state
                    const updatedList = datastreams.filter(
                      (ds) => ds["@iot.id"] !== row["@iot.id"]
                    );
                    setDatastreams(updatedList);
                  } else {
                    Swal.fire({
                      icon: "error",
                      title: "Oops...",
                      text: "Datastream not deleted! Try again.",
                    });
                  }
                } catch (error) {
                  // Log error via your error tracking API
                  axios.post(
                    `http://localhost:4500/mutation_error_logs`,
                    {
                      keycloak_id: userInfo?.sub,
                      method: "DELETE",
                      attribute: "Datastreams",
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
                    title: "Error",
                    text: "Something went wrong while deleting the datastream.",
                  });
                }
              }
            });
          }}
        />
      ),
    },
    {
      name: "Export Data",
      headerName: "Export Data",
      flex: 1,
      filter: false,
      cellRenderer: (params: any) => (
        <FileDownloadIcon
          style={{
            cursor: "pointer",
            color: "black",
          }}
          onClick={() => {
            const row = params?.data;
            const blob = new Blob([JSON.stringify(row, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${row.name || "data"}.json`;
            link.click();
            URL.revokeObjectURL(url);
          }}
        />
      ),
    },
  ];


  return (
    <Dashboard>
      <ToastContainer position="bottom-right" autoClose={5000} theme="dark" />

      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <LinkCustom to="/">Data Space</LinkCustom>
        <LinkCustom to="/frost_entities">Data Items</LinkCustom>
        <Typography color="text.primary">Datastreams</Typography>
      </Breadcrumbs>

      {/* Create Button */}
      {isOwner ? (
        <LinkCustom to="/datastreams/store">
          <Button variant="contained" color="primary" sx={{ mb: 2 }}>
            Create
          </Button>
        </LinkCustom>
      ) : (
        <Button variant="contained" color="primary" disabled sx={{ mb: 2 }}>
          Create
        </Button>
      )}
    <DataTableCardV2
  title="Datastreams"
  description="List of datastreams in this project"
  columnDefs={columns}
  rowData={datastreams}
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
    fetchDatastreams(0, pageSize, fq, sortQuery);
  }}
  onSortChange={(sq) => {               
    setSortQuery(sq);           
    setPage(0);
    setPageLinks({});
    fetchDatastreams(0, pageSize, filterQuery, sq);
  }}
/>
    </Dashboard>
  );
};

export default ListDatastream;
