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
const ListLocations = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;
  console.log(token);

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [locations, setLocations] = useState<any[]>([]);

  const fetchLocations = () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
    console.log(backend_url);
    axios
      .get(`${backend_url}:${frostServerPort}/FROST-Server/v1.0/Locations`, {
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
      width: "20%",
    },
    {
      name: "Latitude",
      selector: (row: any) => row.location.coordinates[1],
      sortable: true,
      width: "10%",
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

      {/* <LinkCustom to="/sensors/store">
        <Button
          variant="contained"
          color="primary"
          style={{
            marginBottom: "10px",
          }}
        >
          Create{" "}
        </Button>
      </LinkCustom> */}
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
