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

const ListLocations = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
    const isOwner = useIsOwner();

  const fetchLocations = () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
    console.log(backend_url); 
    const isDev = process.env.REACT_APP_IS_DEVELOPMENT === 'true';  
    axios
      .get( isDev ? `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Locations` :  `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Locations`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.status === 200 && res.data.value) {
          console.log(res.data.value);
          setLocations(res.data.value);
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
      fetchLocations();
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
      name: "Name",
      selector: (row: any) => row.name,
      sortable: true,
      width: "20%",
    },

    {
      name: "Description",
      selector: (row: any) => row.description,
      sortable: true,
      width: "20%",
    },
    {
      name: "Longitude",
      selector: (row: any) => row.location.coordinates[0],
      sortable: true,
      width: "10%",
    },
    {
      name: "Latitude",
      selector: (row: any) => row.location.coordinates[1],
      sortable: true,
      width: "10%",
    },
{
  name: "Edit",
  selector: (row: any) => (
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
          html:
            `<div class="swal-input-row-with-label">` +
            `<label for="name">Name</label>` +
            `<div class="swal-input-field">` +
            `<input id="name" class="swal2-input" placeholder="Enter name" value="${row.name || ""}">` +
            `</div>` +
            `</div>` +

            `<div class="swal-input-row-with-label">` +
            `<label for="description">Description</label>` +
            `<div class="swal-input-field">` +
            `<input id="description" class="swal2-input" placeholder="Enter description" value="${row.description || ""}">` +
            `</div>` +
            `</div>` +

            `<div class="swal-input-row-with-label">` +
            `<label for="latitude">Latitude</label>` +
            `<div class="swal-input-field">` +
            `<input id="latitude" type="number" class="swal2-input" placeholder="Enter latitude" value="${currentLat || ""}">` +
            `</div>` +
            `</div>` +

            `<div class="swal-input-row-with-label">` +
            `<label for="longitude">Longitude</label>` +
            `<div class="swal-input-field">` +
            `<input id="longitude" type="number" class="swal2-input" placeholder="Enter longitude" value="${currentLng || ""}">` +
            `</div>` +
            `</div>`,
          showCancelButton: true,
          confirmButtonText: "Save",
          showLoaderOnConfirm: true,
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
                  const updatedLocations = locations.map((loc) => {
                    if (loc["@iot.id"] === row["@iot.id"]) {
                      loc.name = name;
                      loc.description = description;
                      loc.location.coordinates = [lng, lat];
                    }
                    return loc;
                  });
                  setLocations(updatedLocations);
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
  ),
  sortable: false,
  width: "10%",
},
{
  name: "Delete",
  selector: (row: any) => (
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
          text: "You will not be able to recover this location! Linked entities might become dysfunctional!",
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
                Swal.fire({
                  icon: "success",
                  title: "Success",
                  text: "Location deleted successfully!",
                });
                const newLocations = locations.filter(
                  (loc) => loc["@iot.id"] !== row["@iot.id"]
                );
                setLocations(newLocations);
              } else {
                Swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text: "Something went wrong! Location not deleted!",
                });
              }
            } catch (error) {
              // optional: log mutation failure to backend
              axios.post(
                `http://localhost:4500/mutation_error_logs`,
                {
                  keycloak_id: userInfo?.sub,
                  method: "DELETE",
                  attribute: "Locations",
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
                text: "Something went wrong! Location not deleted!",
              });
            }
          }
        });
      }}
    />
  ),
  sortable: false,
  width: "10%",
}
,
    {
      name: "Location on Map",
      selector: (row: any) => (
        <LinkCustom
          style={{
            color: "#233044",
            textDecoration: "none",
          }}
          to={`/locations/${row["@iot.id"]}`}
        >
          <MapIcon />
        </LinkCustom>
      ),
      sortable: true,
      width: "20%",
    },
    // {
    //   name: "Edit",
    //   selector: (row: any) => (
    //     <EditOutlinedIcon
    //       style={{
    //         cursor: "pointer",
    //         color: "#233044",
    //       }}
    //       onClick={() => {
    //         Swal.fire({
    //           title: "Edit Sensor Description",
    //           input: "text",
    //           inputLabel: "New Sensor Description",
    //           inputPlaceholder: "Enter the new sensor description",
    //           inputValue: row.description,
    //           showCancelButton: true,
    //           confirmButtonText: "Save",
    //           showLoaderOnConfirm: true,
    //           preConfirm: (description) => {
    //             return description;
    //           },
    //         }).then((result) => {
    //           if (result.isConfirmed) {
    //             const newDescription = result.value;
    //             Swal.fire(`New sensor description: ${newDescription}`);
    //             const newSensor = sensors.map((sensor) => {
    //               if (sensor["@iot.id"] === row["@iot.id"]) {
    //                 sensor.description = newDescription;
    //               }
    //               return sensor;
    //             });
    //             setSensors(newSensor);
    //           }
    //         });
    //       }}
    //     />
    //   ),
    //   sortable: true,
    //   width: "20%",
    // },
    // {
    //   name: "Delete",
    //   selector: (row: any) => (
    //     <DeleteForeverOutlinedIcon
    //       style={{
    //         cursor: "pointer",
    //         color: "red",
    //       }}
    //       onClick={() => {
    //         Swal.fire({
    //           title: `Are you sure you want to delete ${row.name}?`,
    //           text: "You will not be able to recover this sensor!",
    //           icon: "warning",
    //           showCancelButton: true,
    //           confirmButtonColor: "#3085d6",
    //           cancelButtonColor: "#d33",
    //           confirmButtonText: "Yes, delete it!",
    //         }).then(async (result) => {
    //           if (result.isConfirmed) {
    //             try {
    //               const response = await axios.delete(
    //                 `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Locations(${row["@iot.id"]})`,
    //                 {
    //                   headers: {
    //                     "Content-Type": "application/json",
    //                     Authorization: `Bearer ${token}`,
    //                   },
    //                 }
    //               );

    //               if (response.status === 200) {
    //                 Swal.fire({
    //                   icon: "success",
    //                   title: "Success",
    //                   text: "Sensor deleted successfully!",
    //                 });
    //                 const newSensor = sensors.filter(
    //                   (sensor) => sensor["@iot.id"] !== row["@iot.id"]
    //                 );
    //                 setSensors(newSensor);
    //               } else {
    //                 Swal.fire({
    //                   icon: "error",
    //                   title: "Oops...",
    //                   text: "Something went wrong! Sensor not deleted!",
    //                 });
    //               }
    //             } catch (error) {
    //               Swal.fire({
    //                 icon: "error",
    //                 title: "Oops...",
    //                 text: "Something went wrong! Sensor not deleted!",
    //               });
    //             }
    //           }
    //         });
    //       }}
    //     />
    //   ),
    //   sortable: true,
    //   width: "20%",
    // },
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
          <b>Description: </b>
          {data?.description}
        </div>
        <div>
          <b>Longitude: </b>
          {data?.location?.coordinates[0]}
        </div>
        <div>
          <b>Latitude: </b>
          {data?.location?.coordinates[1]}
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
        <Typography color="text.primary">Locations</Typography>
      </Breadcrumbs>

       {isOwner  ?   <LinkCustom to="/locations/store">
        <Button
          variant="contained"
          color="primary"
          style={{
            marginBottom: "10px",
          }}
        >
          Create{" "}
        </Button>
      </LinkCustom> : <Button
        variant="contained"
        color="primary"
        disabled
        style={{
          marginBottom: "10px",
        }}
      >
        Create{" "}
      </Button> }
      <DataTable
        title="Locations"
        columns={columns}
        data={locations}
        expandableRows
        expandableRowsComponent={ExpandedComponent}
        pagination={true}
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 15]}
      />
    </Dashboard>
  );
};

export default ListLocations;
