import React, { useEffect, useState } from "react";
import { Form, Formik } from "formik";
import Dashboard from "../components/DashboardComponent";
import * as yup from "yup";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import {
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Grid,
  TextField,
  Button,
  Typography,
  Breadcrumbs,
  Divider,
} from "@mui/material";
import axios from "axios";
import { useKeycloak } from "@react-keycloak/web";
import Swal from "sweetalert2";

const steps = [
  "Store Device",
  "Store Observed Property",
  "Store Datastream",
  "Data Confirmation",
];

const getValidationSchemaPerStep = (step: number) => {
  switch (step) {
    case 0: {
      return yup.object({
        device_name: yup.string().required("Device Name is required"),
        device_description: yup
          .string()
          .required("Device Description is required"),
        device_location_name: yup
          .string()
          .required("Device Location Name is required"),
        device_location_description: yup
          .string()
          .required("Device Location Description is required"),
        device_latitude: yup
          .string()
          .required("Device Latitude is required")
          .matches(
            /^-?\d+(\.\d+)?$/,
            "Location longitude must be a float format"
          ),
        device_longitude: yup
          .string()
          .required("Device Longitude is required")
          .matches(
            /^-?\d+(\.\d+)?$/,
            "Location longitude must be a float format"
          ),
      });
    }
    case 1:
      return yup.object({
        observeProperty_name: yup.string().required("Name is required"),
        observeProperty_definition: yup
          .string()
          .required("Definition is required"),
        observeProperty_description: yup
          .string()
          .required("Description is required"),
      });

    case 2:
      return yup.object({
        datastream_name: yup.string().required("Name is required"),
        datastram_description: yup.string().required("Description is required"),
        datastream_observation_type: yup
          .string()
          .required("Observation Type is required"),
        datastream_unit_of_measurement_name: yup
          .string()
          .required("Name is required"),
        datastream_unit_of_measurement_symbol: yup
          .string()
          .required("Symbol is required"),
        datastream_unit_of_measurement_definition: yup
          .string()
          .required("Definition is required"),
      });
  }
};

function StepperStore() {
  const [activeStep, setActiveStep] = useState(0);
  const isLastStep = activeStep === steps.length - 1;
  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;

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
    fetchFrostPort();
  }, []);

  return (
    <>
      <Dashboard>
        <Formik
          initialValues={{
            // First Step
            device_name: "",
            device_description: "",
            device_location_name: "",
            device_location_description: "",
            device_latitude: "",
            device_longitude: "",

            // Second Step
            observeProperty_name: "",
            observeProperty_definition: "",
            observeProperty_description: "",

            // Third Step
            datastream_name: "",
            datastram_description: "",
            datastream_observation_type: "",
            datastream_unit_of_measurement_name: "",
            datastream_unit_of_measurement_symbol: "",
            datastream_unit_of_measurement_definition: "",
          }}
          validationSchema={getValidationSchemaPerStep(activeStep)}
          onSubmit={async (values: any, helpers: any) => {
            if (isLastStep) {
              helpers.resetForm();
              setActiveStep(0);
              try {
                // 1: Store the Device
                const response_post_device = await axios.post(
                  `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Things`,
                  {
                    name: values.device_name,
                    description: values.device_description,
                    Locations: [
                      {
                        name: values.device_location_name,
                        description: values.device_location_description,
                        encodingType: "application/vnd.geo+json",
                        location: {
                          type: "Point",
                          coordinates: [
                            values.device_longitude,
                            values.device_latitude,
                          ],
                        },
                      },
                    ],
                  },
                  {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${keycloak?.token}`,
                    },
                  }
                );

                // 2: Store the Observed Property
                const response_post_observed_property = await axios.post(
                  `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/ObservedProperties`,
                  {
                    name: values.observeProperty_name,
                    definition: values.observeProperty_definition,
                    description: values.observeProperty_description,
                  },

                  {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${keycloak?.token}`,
                    },
                  }
                );

                // 3: Get the ID of the Device

                const response_get_device = await axios.get(
                  `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Things?$filter=name eq '${values.device_name}'`,
                  {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${keycloak?.token}`,
                    },
                  }
                );

                const device_id = response_get_device.data.value[0]["@iot.id"];

                // 4: Get the ID of the Observed Property

                const response_get_observed_property = await axios.get(
                  `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/ObservedProperties?$filter=name eq '${values.observeProperty_name}'`,
                  {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${keycloak?.token}`,
                    },
                  }
                );

                const observed_property_id =
                  response_get_observed_property.data.value[0]["@iot.id"];

                // 5: Store the Sensor

                const name_of_the_sensor = `sensor_${values.device_name}_${values.observeProperty_name}`;

                const response_post_sensor = await axios.post(
                  `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Sensors`,
                  {
                    name: name_of_the_sensor,
                    description: `Sensor for ${values.device_name} and ${values.observeProperty_name}`,
                    metadata: `Sensor MetaData for ${values.device_name} and ${values.observeProperty_name}`,
                    encodingType: "application/pdf",
                  },
                  {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${keycloak?.token}`,
                    },
                  }
                );

                // 6: Get the ID of the Sensor

                const response_get_sensor = await axios.get(
                  `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Sensors?$filter=name eq '${name_of_the_sensor}'`,
                  {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${keycloak?.token}`,
                    },
                  }
                );

                const sensor_id = response_get_sensor.data.value[0]["@iot.id"];

                // 7: Store the Datastream
                const response_post_datastream = await axios.post(
                  `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Datastreams`,
                  {
                    name: values.datastream_name,
                    unitOfMeasurement: {
                      name: values.datastream_unit_of_measurement_name,
                      symbol: values.datastream_unit_of_measurement_symbol,
                      definition:
                        values.datastream_unit_of_measurement_definition,
                    },
                    Thing: {
                      "@iot.id": device_id,
                    },
                    description: values.datastram_description,
                    Sensor: {
                      "@iot.id": sensor_id,
                    },
                    ObservedProperty: {
                      "@iot.id": observed_property_id,
                    },
                    observationType: values.datastream_observation_type,
                  },
                  {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${keycloak?.token}`,
                    },
                  }
                );

                if (
                  sensor_id &&
                  device_id &&
                  observed_property_id &&
                  response_post_device.status === 201 &&
                  response_post_observed_property.status === 201 &&
                  response_post_sensor.status === 201 &&
                  response_post_datastream.status === 201
                ) {
                  Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: "Device, Observed Property, Sensor and Datastream created!",
                  });
                } else {
                  Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Something went wrong! Device, Observed Property, Sensor and Datastream not created!",
                  });
                }
              } catch (error) {
                Swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text: "Something went wrong! Device, Observed Property, Sensor and Datastream not created!",
                });
              }
            } else {
              setActiveStep((s) => s + 1);
            }
            helpers.setSubmitting(false);
          }}
        >
          {({ isSubmitting, errors, touched, handleChange, values }) => (
            <>
              <Breadcrumbs
                aria-label="breadcrumb"
                style={{
                  marginBottom: "10px",
                }}
              >
                <Typography color="text.primary">Data Streams</Typography>
                <Typography color="text.primary">Stepper</Typography>
              </Breadcrumbs>

              <Form
                style={{
                  padding: "2rem",
                }}
              >
                <Stepper
                  activeStep={activeStep}
                  style={{
                    backgroundColor: "transparent",
                    marginBottom: "2rem",
                  }}
                >
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
                {/* Device Step */}
                {activeStep === 0 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Device Name"
                        name="device_name"
                        onChange={handleChange}
                        value={values.device_name}
                        variant="outlined"
                        error={
                          touched.device_name && Boolean(errors.device_name)
                        }
                        helperText={touched.device_name && errors.device_name}
                      />
                    </Grid>{" "}
                    {values.device_name.length > 0 && (
                      <Grid item xs={12} md={6}>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            axios
                              .get(
                                `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Things?$filter=name eq '${values.device_name}'`,
                                {
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                  },
                                }
                              )
                              .then((response) => {
                                console.log(response.data);
                                if (response.data.value.length > 0) {
                                  Swal.fire({
                                    icon: "error",
                                    title: "Oops...",
                                    text: "Device name is already taken, please choose another one",
                                  });
                                } else {
                                  Swal.fire({
                                    icon: "success",
                                    title: "Success",
                                    text: "Device name is available",
                                  });
                                }
                              })
                              .catch((error) => {
                                console.log(error);
                              });
                          }}
                        >
                          Check Device Availability
                        </Button>
                      </Grid>
                    )}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Device Description"
                        name="device_description"
                        onChange={handleChange}
                        value={values.device_description}
                        variant="outlined"
                        error={
                          touched.device_description &&
                          Boolean(errors.device_description)
                        }
                        helperText={
                          touched.device_description &&
                          errors.device_description
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Device Location"
                        name="device_location_name"
                        onChange={handleChange}
                        value={values.device_location_name}
                        variant="outlined"
                        error={
                          touched.device_location_name &&
                          Boolean(errors.device_location_name)
                        }
                        helperText={
                          touched.device_location_name &&
                          errors.device_location_name
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Location Description"
                        name="device_location_description"
                        onChange={handleChange}
                        value={values.device_location_description}
                        variant="outlined"
                        error={
                          touched.device_location_description &&
                          Boolean(errors.device_location_description)
                        }
                        helperText={
                          touched.device_location_description &&
                          errors.device_location_description
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Latitude"
                        name="device_latitude"
                        onChange={handleChange}
                        value={values.device_latitude}
                        variant="outlined"
                        error={
                          touched.device_latitude &&
                          Boolean(errors.device_latitude)
                        }
                        helperText={
                          touched.device_latitude && errors.device_latitude
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Longitude"
                        name="device_longitude"
                        onChange={handleChange}
                        value={values.device_longitude}
                        variant="outlined"
                        error={
                          touched.device_longitude &&
                          Boolean(errors.device_longitude)
                        }
                        helperText={
                          touched.device_longitude && errors.device_longitude
                        }
                      />
                    </Grid>
                  </Grid>
                )}
                {/* Observation Property Step */}
                {activeStep === 1 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Name"
                        name="observeProperty_name"
                        onChange={handleChange}
                        value={values.observeProperty_name}
                        variant="outlined"
                        error={
                          touched.observeProperty_name &&
                          Boolean(errors.observeProperty_name)
                        }
                        helperText={
                          touched.observeProperty_name &&
                          errors.observeProperty_name
                        }
                      />
                    </Grid>
                    {values.observeProperty_name.length > 0 && (
                      <Grid item xs={12} md={6}>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            axios
                              .get(
                                `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/ObservedProperties?$filter=name eq '${values.observeProperty_name}'`,
                                {
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                  },
                                }
                              )
                              .then((response) => {
                                console.log(response.data);
                                if (response.data.value.length > 0) {
                                  Swal.fire({
                                    icon: "error",
                                    title: "Oops...",
                                    text: "Observed Property name is already taken, please choose another one",
                                  });
                                } else {
                                  Swal.fire({
                                    icon: "success",
                                    title: "Success",
                                    text: "Observed Property name is available",
                                  });
                                }
                              })
                              .catch((error) => {
                                console.log(error);
                              });
                          }}
                        >
                          Check Observed Property Availability
                        </Button>
                      </Grid>
                    )}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Definition"
                        name="observeProperty_definition"
                        onChange={handleChange}
                        value={values.observeProperty_definition}
                        variant="outlined"
                        error={
                          touched.observeProperty_definition &&
                          Boolean(errors.observeProperty_definition)
                        }
                        helperText={
                          touched.observeProperty_definition &&
                          errors.observeProperty_definition
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Description"
                        name="observeProperty_description"
                        onChange={handleChange}
                        value={values.observeProperty_description}
                        variant="outlined"
                        error={
                          touched.observeProperty_description &&
                          Boolean(errors.observeProperty_description)
                        }
                        helperText={
                          touched.observeProperty_description &&
                          errors.observeProperty_description
                        }
                      />
                    </Grid>
                  </Grid>
                )}
                {/* DataStream Step */}
                {activeStep === 2 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Datastream Name"
                        name="datastream_name"
                        onChange={handleChange}
                        value={values.datastream_name}
                        variant="outlined"
                        error={
                          touched.observeProperty_name &&
                          Boolean(errors.observeProperty_name)
                        }
                        helperText={
                          touched.observeProperty_name &&
                          errors.observeProperty_name
                        }
                      />
                    </Grid>
                    {values.datastream_name.length > 0 && (
                      <Grid item xs={12} md={6}>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            axios
                              .get(
                                `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Datastreams?$filter=name eq '${values.datastream_name}'`,
                                {
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                  },
                                }
                              )
                              .then((response) => {
                                console.log(response.data);
                                if (response.data.value.length > 0) {
                                  Swal.fire({
                                    icon: "error",
                                    title: "Oops...",
                                    text: "Datastream name is already taken, please choose another one",
                                  });
                                } else {
                                  Swal.fire({
                                    icon: "success",
                                    title: "Success",
                                    text: "Datastream name is available",
                                  });
                                }
                              })
                              .catch((error) => {
                                console.log(error);
                              });
                          }}
                        >
                          Check Datastream name Availability
                        </Button>
                      </Grid>
                    )}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="datastram_description"
                        label="Datastream Description"
                        onChange={handleChange}
                        value={values.datastram_description}
                        variant="outlined"
                        error={
                          touched.observeProperty_name &&
                          Boolean(errors.observeProperty_name)
                        }
                        helperText={
                          touched.observeProperty_name &&
                          errors.observeProperty_name
                        }
                      />
                    </Grid>{" "}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="datastream_observation_type"
                        label="Datastream Observation Type"
                        onChange={handleChange}
                        value={values.datastream_observation_type}
                        variant="outlined"
                        error={
                          touched.datastream_observation_type &&
                          Boolean(errors.datastream_observation_type)
                        }
                        helperText={
                          touched.datastream_observation_type &&
                          errors.datastream_observation_type
                        }
                      />
                    </Grid>{" "}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="datastream_unit_of_measurement_name"
                        label="Datastream Unit of Measurement Name"
                        onChange={handleChange}
                        value={values.datastream_unit_of_measurement_name}
                        variant="outlined"
                        error={
                          touched.datastream_unit_of_measurement_name &&
                          Boolean(errors.datastream_unit_of_measurement_name)
                        }
                        helperText={
                          touched.datastream_unit_of_measurement_name &&
                          errors.datastream_unit_of_measurement_name
                        }
                      />
                    </Grid>{" "}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="datastream_unit_of_measurement_symbol"
                        label="Datastream Unit of Measurement Symbol"
                        onChange={handleChange}
                        value={values.datastream_unit_of_measurement_symbol}
                        variant="outlined"
                        error={
                          touched.datastream_unit_of_measurement_symbol &&
                          Boolean(errors.datastream_unit_of_measurement_symbol)
                        }
                        helperText={
                          touched.datastream_unit_of_measurement_symbol &&
                          errors.datastream_unit_of_measurement_symbol
                        }
                      />
                    </Grid>{" "}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="datastream_unit_of_measurement_definition"
                        label="Datastream Unit of Measurement Definition"
                        onChange={handleChange}
                        value={values.datastream_unit_of_measurement_definition}
                        variant="outlined"
                        error={
                          touched.datastream_unit_of_measurement_definition &&
                          Boolean(
                            errors.datastream_unit_of_measurement_definition
                          )
                        }
                        helperText={
                          touched.datastream_unit_of_measurement_definition &&
                          errors.datastream_unit_of_measurement_definition
                        }
                      />
                    </Grid>
                  </Grid>
                )}
                {/* Data Confirmation Step */}
                {activeStep === 3 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={12}>
                      <Typography variant="h2" gutterBottom>
                        Device Information{" "}
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => {
                            setActiveStep(0);
                          }}
                        >
                          <CreateOutlinedIcon />
                        </Button>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography gutterBottom>
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#233044",
                          }}
                        >
                          {" "}
                          Device Name:
                        </span>{" "}
                        {values.device_name}
                      </Typography>
                    </Grid>{" "}
                    <Grid item xs={12} md={4}>
                      <Typography gutterBottom>
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#233044",
                          }}
                        >
                          {" "}
                          Device Description:
                        </span>{" "}
                        {values.device_description}
                      </Typography>
                    </Grid>{" "}
                    <Grid item xs={12} md={4}>
                      <Typography gutterBottom>
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#233044",
                          }}
                        >
                          {" "}
                          Device Location Name:
                        </span>{" "}
                        {values.device_location_name}
                      </Typography>
                    </Grid>{" "}
                    <Grid item xs={12} md={4}>
                      <Typography gutterBottom>
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#233044",
                          }}
                        >
                          {" "}
                          Device Location Description:
                        </span>{" "}
                        {values.device_location_description}
                      </Typography>
                    </Grid>{" "}
                    <Grid item xs={12} md={4}>
                      <Typography gutterBottom>
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#233044",
                          }}
                        >
                          {" "}
                          Device Location Description:
                        </span>{" "}
                        {values.device_location_description}
                      </Typography>
                    </Grid>{" "}
                    <Grid item xs={12} md={4}>
                      <Typography gutterBottom>
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#233044",
                          }}
                        >
                          {" "}
                          Device Latitude:
                        </span>{" "}
                        {values.device_latitude}
                      </Typography>
                    </Grid>{" "}
                    <Grid item xs={12} md={4}>
                      <Typography gutterBottom>
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#233044",
                          }}
                        >
                          {" "}
                          Device Longitude:
                        </span>{" "}
                        {values.device_longitude}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={12}>
                      <Divider
                        style={{
                          marginTop: "20px",
                          marginBottom: "20px",
                          width: "100%",
                        }}
                      />
                    </Grid>{" "}
                    <Grid item xs={12} md={12}>
                      <Typography variant="h2" gutterBottom>
                        Observed Property Information{" "}
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => {
                            setActiveStep(1);
                          }}
                        >
                          <CreateOutlinedIcon />
                        </Button>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography gutterBottom>
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#233044",
                          }}
                        >
                          {" "}
                          Device Name:
                        </span>{" "}
                        {values.observeProperty_name}
                      </Typography>
                    </Grid>{" "}
                    <Grid item xs={12} md={4}>
                      <Typography gutterBottom>
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#233044",
                          }}
                        >
                          {" "}
                          Observed Property Name:{" "}
                        </span>{" "}
                        {values.observeProperty_definition}
                      </Typography>
                    </Grid>{" "}
                    <Grid item xs={12} md={4}>
                      <Typography gutterBottom>
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#233044",
                          }}
                        >
                          {" "}
                          Observed Property Name:{" "}
                        </span>{" "}
                        {values.observeProperty_description}
                      </Typography>
                    </Grid>{" "}
                    <Grid item xs={12} md={12}>
                      <Divider
                        style={{
                          marginTop: "20px",
                          marginBottom: "20px",
                          width: "100%",
                        }}
                      />
                    </Grid>
                    {/* Datastream */}
                    <Grid item xs={12} md={12}>
                      <Typography variant="h2" gutterBottom>
                        Datastream Information{" "}
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => {
                            setActiveStep(2);
                          }}
                        >
                          <CreateOutlinedIcon />
                        </Button>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography gutterBottom>
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#233044",
                          }}
                        >
                          {" "}
                          Datastream Name:
                        </span>{" "}
                        {values.datastream_name}
                      </Typography>
                    </Grid>{" "}
                    <Grid item xs={12} md={4}>
                      <Typography gutterBottom>
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#233044",
                          }}
                        >
                          {" "}
                          Datastream Description:
                        </span>{" "}
                        {values.datastram_description}
                      </Typography>
                    </Grid>{" "}
                    <Grid item xs={12} md={4}>
                      <Typography gutterBottom>
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#233044",
                          }}
                        >
                          {" "}
                          Datastream Observation Type:
                        </span>{" "}
                        {values.datastream_observation_type}
                      </Typography>
                    </Grid>{" "}
                    <Grid item xs={12} md={4}>
                      <Typography gutterBottom>
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#233044",
                          }}
                        >
                          {" "}
                          Datastream Unit of Measurement Name:
                        </span>{" "}
                        {values.datastream_unit_of_measurement_name}
                      </Typography>
                    </Grid>{" "}
                    <Grid item xs={12} md={4}>
                      <Typography gutterBottom>
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#233044",
                          }}
                        >
                          {" "}
                          Datastream Unit of Measurement Symbol:
                        </span>{" "}
                        {values.datastream_unit_of_measurement_symbol}
                      </Typography>
                    </Grid>{" "}
                    <Grid item xs={12} md={4}>
                      <Typography gutterBottom>
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#233044",
                          }}
                        >
                          {" "}
                          Datastream Unit of Measurement Definition:
                        </span>{" "}
                        {values.datastream_unit_of_measurement_definition}
                      </Typography>
                    </Grid>{" "}
                  </Grid>
                )}
                {/* Stepper Controls */}
                <Grid container spacing={2} justifyContent="center" mt={10}>
                  {activeStep > 0 && (
                    <Grid item>
                      <Button
                        style={{
                          backgroundColor: "#233044",
                        }}
                        variant="contained"
                        onClick={() => setActiveStep((s) => s - 1)}
                      >
                        Previous Step
                      </Button>
                    </Grid>
                  )}
                  <Grid item>
                    <Button
                      startIcon={
                        isSubmitting ? <CircularProgress size="1rem" /> : null
                      }
                      variant="contained"
                      // color="primary"
                      style={{
                        backgroundColor: "#233044",
                        color: "#fff",
                      }}
                      type="submit"
                      disabled={
                        isSubmitting ||
                        (isLastStep && Object.keys(errors).length > 0)
                      }
                    >
                      {isSubmitting
                        ? "Submitting"
                        : isLastStep
                        ? "Finish"
                        : "Next step"}
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            </>
          )}
        </Formik>
      </Dashboard>
    </>
  );
}

export default StepperStore;
