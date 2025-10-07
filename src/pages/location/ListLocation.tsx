import { useState, useEffect } from "react";
import axios from "axios";
import DataTable, { ExpanderComponentProps } from "react-data-table-component";
import { Breadcrumbs, Button, Typography } from "@mui/material";
import LinkCustom from "../../components/LinkCustom";

import Dashboard from "../../components/DashboardComponent";
import { useKeycloak } from "@react-keycloak/web";
import { ToastContainer, toast } from "react-toastify";
import MapIcon from "@mui/icons-material/Map";
import ReactGA from "react-ga4";
import { GAactionsLocations } from "../../utils/GA";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Swal from "sweetalert2";
import { useAppSelector, useIsOwner } from "../../hooks/hooks";  
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import DataTableCardV2 from "../../components/DataGridServerSide";

const ListLocations = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [page, setPage] = useState(0);
const [pageSize, setPageSize] = useState(10);
const [totalRows, setTotalRows] = useState(0);
const [pageLinks, setPageLinks] = useState<{ [key: number]: string }>({});
const [loading, setLoading] = useState(false);

const [filterQuery, setFilterQuery] = useState("");
const [sortQuery, setSortQuery] = useState("");

    const isOwner = useIsOwner();

  const fetchLocations = async (
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
    ? `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Locations`
    : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Locations`;

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

    setLocations(res.data.value);
    if (res.data["@iot.count"]) setTotalRows(res.data["@iot.count"]);
    if (res.data["@iot.nextLink"]) {
      setPageLinks((prev) => ({
        ...prev,
        [newPage + 1]: res.data["@iot.nextLink"],
      }));
    }
  } catch (err) {
    toast.error("Error Getting Locations");
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
    await axios.post(
      `${backend_url}/frost-server`,
      { user_email: email, group_id: group_id }, // ✅ Adding group_id to the request body
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Added Authorization header
        },
      }
    ).then((res) => {
        if (res.status === 200 && res.data.PORT) {
          setFrostServerPort(res.data.PORT);
        }
      });
  };

 useEffect(() => {
  ReactGA.event({
    category: GAactionsLocations.category,
    action: GAactionsLocations.action,
    label: GAactionsLocations.label,
  });

  if (frostServerPort !== null) {
    fetchLocations(page, pageSize);
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
    headerName: "Name",
    field: "name",
    sortable: true,
    flex:2
  },
  {
    headerName: "Description",
    field: "description",
    sortable: true,
     flex: 3,
    wrapText: true,
    autoHeight: true,
    cellStyle: { whiteSpace: "normal" },
   
  },
 {
  headerName: "Longitude",
  valueGetter: (params: any) =>
    Array.isArray(params.data?.location?.coordinates)
      ? params.data.location.coordinates[0]
      : "",
  sortable: true,
   filter: false
},
{
  headerName: "Latitude",
  valueGetter: (params: any) =>
    Array.isArray(params.data?.location?.coordinates)
      ? params.data.location.coordinates[1]
      : "",
  sortable: true,
  filter: false
},

  {
    headerName: "Edit",
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

            const currentLat = row?.location?.coordinates[1];
            const currentLng = row?.location?.coordinates[0];

            Swal.fire({
              title: "Edit Location",
              html: `
                <div>
                  <label for="name">Name</label>
                  <input id="name" class="swal2-input" value="${row.name || ""}">
                </div>
                <div>
                  <label for="description">Description</label>
                  <input id="description" class="swal2-input" value="${row.description || ""}">
                </div>
                <div>
                  <label for="latitude">Latitude</label>
                  <input id="latitude" type="number" class="swal2-input" value="${currentLat || ""}">
                </div>
                <div>
                  <label for="longitude">Longitude</label>
                  <input id="longitude" type="number" class="swal2-input" value="${currentLng || ""}">
                </div>`,
              showCancelButton: true,
              confirmButtonText: "Save",
              preConfirm: () => {
                const name = (document.getElementById("name") as HTMLInputElement)?.value;
                const description = (document.getElementById("description") as HTMLInputElement)?.value;
                const lat = parseFloat((document.getElementById("latitude") as HTMLInputElement)?.value);
                const lng = parseFloat((document.getElementById("longitude") as HTMLInputElement)?.value);

                if (!name || isNaN(lat) || isNaN(lng)) {
                  Swal.showValidationMessage("Please enter valid name, latitude, and longitude.");
                  return false;
                }
                return { name, description, lat, lng };
              },
            }).then((result) => {
              if (result.isConfirmed) {
                const { name, description, lat, lng } = result.value;
                axios
                  .post(
                    `${process.env.REACT_APP_BACKEND_URL}/update`,
                    {
                      url: `Locations(${row["@iot.id"]})`,
                      FROST_PORT: frostServerPort,
                      keycloak_id: userInfo?.sub,
                      body: {
                        name,
                        description,
                        encodingType: "application/vnd.geo+json",
                        location: {
                          type: "Point",
                          coordinates: [lng, lat],
                        },
                      },
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
                      const updated = locations.map((loc: any) =>
                        loc["@iot.id"] === row["@iot.id"]
                          ? { ...loc, name, description, location: { ...loc.location, coordinates: [lng, lat] } }
                          : loc
                      );
                      setLocations(updated);
                      Swal.fire("Success", "Location updated!", "success");
                    } else {
                      Swal.fire("Error", "Failed to update location.", "error");
                    }
                  })
                  .catch(() => {
                    Swal.fire("Error", "Server error occurred.", "error");
                  });
              }
            });
          }}
        />
      );
    },
    filter: false
  },
  {
    headerName: "Delete",
    filter: false,
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
              title: `Are you sure you want to delete "${row.name}"?`,
              text: "This will permanently delete the location!",
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "Yes, delete it!",
            }).then(async (result) => {
              if (result.isConfirmed) {
                try {
                  const response = await axios.post(
                    `${process.env.REACT_APP_BACKEND_URL}/delete`,
                    {
                      url: `Locations(${row["@iot.id"]})`,
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
                    Swal.fire("Deleted!", "Location deleted successfully!", "success");
                    setLocations(locations.filter((loc: any) => loc["@iot.id"] !== row["@iot.id"]));
                  } else {
                    Swal.fire("Error", "Location not deleted!", "error");
                  }
                } catch {
                  axios.post("http://localhost:4500/mutation_error_logs", {
                    keycloak_id: userInfo?.sub,
                    method: "DELETE",
                    attribute: "Locations",
                    attribute_id: row["@iot.id"],
                    frost_port: frostServerPort,
                  });
                  Swal.fire("Error", "Something went wrong while deleting.", "error");
                }
              }
            });
          }}
        />
      );
    },
  },
  {
    headerName: "Location on Map",
    cellRenderer: (params: any) => (
      <LinkCustom
        style={{ color: "#233044", textDecoration: "none" }}
        to={`/locations/${params.data["@iot.id"]}`}
      >
        <MapIcon />
      </LinkCustom>
    ),
    filter: false
  },
];

const handlePageChange = (newPage: number) => {
  setPage(newPage);
  fetchLocations(newPage, pageSize, filterQuery, sortQuery);
};

const handlePageSizeChange = (newPageSize: number) => {
  setPage(0);
  setPageSize(newPageSize);
  setPageLinks({});
  fetchLocations(0, newPageSize, filterQuery, sortQuery);
};


  return (
  <Dashboard>
           <ToastContainer position="bottom-right" autoClose={5000} theme="dark" />
     
           {/* Breadcrumbs */}
           <Breadcrumbs aria-label="breadcrumb" style={{ marginBottom: "10px" }}>
             <LinkCustom to="/">Data Space</LinkCustom>
             <LinkCustom to="/frost_entities">Data Items</LinkCustom>
             <Typography color="text.primary">Locations</Typography>
           </Breadcrumbs>
     
           {/* Create Button */}
           {isOwner ? (
             <LinkCustom to="/locations/store">
               <Button variant="contained" color="primary" style={{ marginBottom: "10px" }}>
                 Create
               </Button>
             </LinkCustom>
           ) : (
             <Button variant="contained" color="primary" disabled style={{ marginBottom: "10px" }}>
               Create
             </Button>
           )}
         <DataTableCardV2
  title="Locations"
  description="This page lists all device locations. 
Each location includes a name, description, and geographic coordinates, and can be viewed on the map."
  columnDefs={columnDefs}
  rowData={locations}
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
    fetchLocations(0, pageSize, fq, sortQuery);
  }}
  onSortChange={(sq) => {
    setSortQuery(sq);
    setPage(0);
    setPageLinks({});
    fetchLocations(0, pageSize, filterQuery, sq);
  }}
/>

         </Dashboard>
  );
};

export default ListLocations;
