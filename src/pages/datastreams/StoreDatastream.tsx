import {
  Breadcrumbs,
  Button,
  Divider,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { useFormik } from "formik";
import DashboardComponent from "../../components/DashboardComponent";
import { datastreams_initial_values } from "../../formik/initial_values";
import { datastreams_validationSchema } from "../../formik/validation_schema";
import React, { useEffect, useState } from "react";
import { NOTFOUND } from "../404";
import axios from "axios";
import LinkCustom from "../../components/LinkCustom";
import Swal from "sweetalert2";
function StoreDatastream() {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [observedProperties, setObservedProperties] = useState<any[]>([]);
  const [sensors, setSensors] = useState<any[]>([]);
  const formik = useFormik({
    initialValues: datastreams_initial_values,
    validationSchema: datastreams_validationSchema,
    onSubmit: async (values: any) => {
      formik.resetForm();
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Datastreams`,
          {
            name: values.name,
            unitOfMeasurement: {
              name: values.unit_of_measurement_name,
              symbol: values.unit_of_measurement_symbol,
              definition: values.unit_of_measurement_definition,
            },
            Thing: {
              "@iot.id": values.thing_id,
            },
            description: values.description,
            Sensor: {
              "@iot.id": values.sensor_id,
            },
            ObservedProperty: {
              "@iot.id": values.observation_property_id,
            },
            observationType: values.observationType,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${keycloak?.token}`,
            },
          }
        );

        if (response.status === 201) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Datastream created successfully!",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong! Datastream not created!",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong! Datastream not created!",
        });
      }
    },
  });

  const fetchData = async () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL;
    const email = userInfo?.preferred_username;

    try {
      const response = await axios.get(
        `${backend_url}/frost-server?email=${email}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 && response.data.PORT) {
        setFrostServerPort(response.data.PORT);

        const responseDevices = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL_ROOT}:${response.data.PORT}/FROST-Server/v1.0/Things`,

          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${keycloak?.token}`,
            },
          }
        );

        if (responseDevices.status === 200) {
          setDevices(responseDevices.data.value);
        }

        const responseObservedProperties = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL_ROOT}:${response.data.PORT}/FROST-Server/v1.0/ObservedProperties`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${keycloak?.token}`,
            },
          }
        );

        if (responseObservedProperties.status === 200) {
          setObservedProperties(responseObservedProperties.data.value);
        }

        const responseSensors = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL_ROOT}:${response.data.PORT}/FROST-Server/v1.0/Sensors`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${keycloak?.token}`,
            },
          }
        );

        if (responseSensors.status === 200) {
          setSensors(responseSensors.data.value);
        }

        setLoading(false);
      } else {
        setError(true);
      }
    } catch (error) {
      setError(true);
    }
  };
  useEffect(() => {
    fetchData();
  }, [frostServerPort]);
  return (
    <DashboardComponent>
      {loading ? (
        <p>Loading</p>
      ) : error ? (
        <NOTFOUND />
      ) : (
        <>
          <Breadcrumbs
            aria-label="breadcrumb"
            style={{
              marginBottom: "10px",
            }}
          >
            <Typography color="text.primary">Data Space</Typography>
            <LinkCustom to="/datastreams">
              <Typography color="text.primary">Datastreams</Typography>
            </LinkCustom>
            <Typography color="text.primary">Store</Typography>
          </Breadcrumbs>
          <Typography
            variant="h4"
            style={{
              textAlign: "center",
            }}
          >
            Store Datastream
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <Typography variant="h6" gutterBottom>
              Datastream Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  name="name"
                  id="name"
                  label="Name"
                  fullWidth
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  id="description"
                  name="description"
                  label="Description"
                  fullWidth
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.description &&
                    Boolean(formik.errors.description)
                  }
                  helperText={
                    formik.touched.description && formik.errors.description
                  }
                />
              </Grid>{" "}
              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  id="observationType"
                  name="observationType"
                  label="Observation Type"
                  fullWidth
                  value={formik.values.observationType}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.observationType &&
                    Boolean(formik.errors.observationType)
                  }
                  helperText={
                    formik.touched.observationType &&
                    formik.errors.observationType
                  }
                />
              </Grid>
            </Grid>
            <Divider
              style={{
                marginTop: "20px",
                marginBottom: "20px",
              }}
            />
            <Typography variant="h6" gutterBottom>
              Unit of Measurement
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  id="unit_of_measurement_name"
                  name="unit_of_measurement_name"
                  label="Name"
                  fullWidth
                  value={formik.values.unit_of_measurement_name}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.unit_of_measurement_name &&
                    Boolean(formik.errors.unit_of_measurement_name)
                  }
                  helperText={
                    formik.touched.unit_of_measurement_name &&
                    formik.errors.unit_of_measurement_name
                  }
                />
              </Grid>{" "}
              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  id="unit_of_measurement_symbol"
                  name="unit_of_measurement_symbol"
                  label="Symbol"
                  fullWidth
                  value={formik.values.unit_of_measurement_symbol}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.unit_of_measurement_symbol &&
                    Boolean(formik.errors.unit_of_measurement_symbol)
                  }
                  helperText={
                    formik.touched.unit_of_measurement_symbol &&
                    formik.errors.unit_of_measurement_symbol
                  }
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  id="unit_of_measurement_definition"
                  name="unit_of_measurement_definition"
                  label="Definition"
                  fullWidth
                  value={formik.values.unit_of_measurement_definition}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.unit_of_measurement_definition &&
                    Boolean(formik.errors.unit_of_measurement_definition)
                  }
                  helperText={
                    formik.touched.unit_of_measurement_definition &&
                    formik.errors.unit_of_measurement_definition
                  }
                />
              </Grid>{" "}
            </Grid>{" "}
            <Divider
              style={{
                marginTop: "20px",
                marginBottom: "20px",
              }}
            />
            <Typography variant="h6" gutterBottom>
              Datastream details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  required
                  fullWidth
                  name="sensor_id"
                  value={formik.values.sensor_id}
                  onChange={(event) => {
                    formik.setFieldValue("sensor_id", event.target.value);
                  }}
                  variant="outlined"
                  label="Sensor Types"
                  error={!!formik.errors.sensor_id}
                  InputLabelProps={{ shrink: true }}
                  helperText={formik.errors.sensor_id}
                >
                  {sensors.map((item: any) => (
                    <MenuItem key={item["@iot.id"]} value={item["@iot.id"]}>
                      {item.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>{" "}
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  required
                  fullWidth
                  name="thing_id"
                  value={formik.values.thing_id}
                  onChange={formik.handleChange}
                  variant="outlined"
                  label="Devices"
                  error={!!formik.errors.thing_id}
                  InputLabelProps={{ shrink: true }}
                  helperText={formik.errors.thing_id}
                >
                  {devices.map((item: any) => (
                    <MenuItem key={item["@iot.id"]} value={item["@iot.id"]}>
                      {item.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>{" "}
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  required
                  fullWidth
                  name="observation_property_id"
                  value={formik.values.observation_property_id}
                  onChange={formik.handleChange}
                  variant="outlined"
                  label="Measurement property ID"
                  error={!!formik.errors.observation_property_id}
                  InputLabelProps={{ shrink: true }}
                  helperText={formik.errors.observation_property_id}
                >
                  {observedProperties.map((item: any) => (
                    <MenuItem key={item["@iot.id"]} value={item["@iot.id"]}>
                      {item.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>{" "}
            </Grid>{" "}
            <Button
              type="submit"
              style={{
                marginTop: "10px",
                backgroundColor: "#233044",
              }}
              fullWidth
              variant="contained"
              color="primary"
            >
              Store
            </Button>
          </form>
        </>
      )}
    </DashboardComponent>
  );
}
export default StoreDatastream;
