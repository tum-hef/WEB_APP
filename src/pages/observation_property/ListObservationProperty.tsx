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
const ListObservationProperty = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;
  console.log(token);

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [observationProperty, setObservationProperty] = useState<any[]>([]);

  const fetchObservationProperty = () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
    console.log(backend_url);
    axios
      .get(
        `${backend_url}:${frostServerPort}/FROST-Server/v1.0/ObservedProperties`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        if (res.status === 200 && res.data.value) {
          console.log(res.data.value);
          setObservationProperty(res.data.value);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error Getting Measurement Property");
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
      fetchObservationProperty();
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
      name: "Definition",
      selector: (row: any) => row.definition,
      sortable: true,
      width: "20%",
    },
    {
      name: "Edit",
      selector: (row: any) => (
        <EditOutlinedIcon
          style={{
            cursor: "pointer",
            color: "#233044",
          }}
          onClick={() => {
            Swal.fire({
              title: "Edit Measurement property Description",
              input: "text",
              inputLabel: "New Measurement property Description",
              inputPlaceholder:
                "Enter the new Measurement Property description",
              inputValue: row.description,
              showCancelButton: true,
              confirmButtonText: "Save",
              showLoaderOnConfirm: true,
              preConfirm: (description) => {
                return description;
              },
            }).then((result) => {
              if (result.isConfirmed) {
                const newDescription = result.value;
                Swal.fire(
                  `New Measurement Property description: ${newDescription}`
                );
                const newObservationProperty = observationProperty.map(
                  (observation_property) => {
                    if (observation_property["@iot.id"] === row["@iot.id"]) {
                      observation_property.description = newDescription;
                    }
                    return observation_property;
                  }
                );
                setObservationProperty(newObservationProperty);
              }
            });
          }}
        />
      ),
      sortable: true,
      width: "20%",
    },
    {
      name: "Delete",
      selector: (row: any) => (
        <DeleteForeverOutlinedIcon
          style={{
            cursor: "pointer",
            color: "red",
          }}
          onClick={() => {
            Swal.fire({
              title: `Are you sure you want to delete ${row.name}?`,
              text: "You will not be able to recover this Measurement Property!",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Yes, delete it!",
            }).then(async (result) => {
              if (result.isConfirmed) {
                try {
                  const response = await axios.post(
                    `${process.env.REACT_APP_BACKEND_URL}delete`,
                    {
                      url: `ObservedProperties(${row["@iot.id"]})`,
                      FROST_PORT: frostServerPort,
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
                      text: "Measurement Property deleted successfully!",
                    });
                    const newObservationProperty = observationProperty.filter(
                      (observation_property) =>
                        observation_property["@iot.id"] !== row["@iot.id"]
                    );
                    setObservationProperty(newObservationProperty);
                  } else {
                    Swal.fire({
                      icon: "error",
                      title: "Oops...",
                      text: "Something went wrong! Measurement Property not deleted!",
                    });
                  }
                } catch (error) {
                  Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Something went wrong! Measurement Property not deleted!",
                  });
                }
              }
            });
          }}
        />
      ),
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
          {data.name}
        </div>
        <div>
          <b>Description: </b>
          {data.description}
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
        <LinkCustom to="/frost_entities">Frost Entities</LinkCustom>
        <Typography color="text.primary">Measurement Property</Typography>
      </Breadcrumbs>

      <LinkCustom to="/observation_properties/store">
        <Button
          variant="contained"
          color="primary"
          style={{
            marginBottom: "10px",
          }}
        >
          Create{" "}
        </Button>
      </LinkCustom>
      <DataTable
        title="Measurement Property"
        columns={columns}
        data={observationProperty}
        expandableRows
        expandableRowsComponent={ExpandedComponent}
        pagination={true}
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 15]}
      />
    </Dashboard>
  );
};

export default ListObservationProperty;
