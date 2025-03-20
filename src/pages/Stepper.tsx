import React, { useEffect, useState } from "react";
import { FieldArray, Form, Formik } from "formik";
import Dashboard from "../components/DashboardComponent";
import * as yup from "yup";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import BounceLoader from "react-loading";
import { format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
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
  Box,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import { useKeycloak } from "@react-keycloak/web";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { GAactionStepper } from "../utils/GA";
import ReactGA from "react-ga4";

const steps = [
  "Store Device",
  "Store Measurement Property",
  "Store Datastream",
  "Summary",
];

interface ApiResponse {
  success: boolean;
  PORT?: number;
  message?: string;
  error_code?: number;
}
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
        observed_property_using_existing: yup
          .string()
          .oneOf(["yes", "no"])
          .required(),
        observedProperty_existing_id: yup
          .string()
          .when("observed_property_using_existing", {
            is: "yes",
            then: yup
              .string()
              .required("The existing Measurement Property is required"),
            otherwise: yup.string(),
          }),
        observeProperty_name: yup
          .string()
          .when("observed_property_using_existing", {
            is: "no",
            then: yup.string().required("Name is required"),
            otherwise: yup.string(),
          }),
        observeProperty_description: yup
          .string()
          .when("observed_property_using_existing", {
            is: "no",
            then: yup.string().required("Description is required"),
            otherwise: yup.string(),
          }),
        observeProperty_definition: yup
          .string()
          .when("observed_property_using_existing", {
            is: "no",
            then: yup.string().required("The Definition is required"),
            otherwise: yup.string(),
          }),
      });

      case 2:
  return yup.object({
    datastreams: yup.array().of(
      yup.object({
        name: yup.string().required("Name is required"),
        description: yup.string(), // Optional
        observationType: yup.string(), // Optional
        unitOfMeasurement: yup.object({
          name: yup.string(), // Optional
          symbol: yup.string(), // Optional
          definition: yup.string(), // Optional
        }),
      })
    ),
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
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<any>([]);
  const [ObservedProperties, setObservedProperties] = useState<any>([]);
  const [useExistingDevice, setUseExistingDevice] = useState<boolean | null>(
    null
  );
  const [optionalDatastreamData, setOptionalDatastreamData] =
    useState<boolean>(false);

  const fetchFrostPort = async () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL;
    const backend_url_root = process.env.REACT_APP_BACKEND_URL_ROOT;
    const isDev = process.env.REACT_APP_IS_DEVELOPMENT === "true";
    const selectedOthers = localStorage.getItem("selected_others") === "true";
    const email = selectedOthers
      ? localStorage.getItem("user_email")
      : userInfo?.preferred_username;
    const group_id = localStorage.getItem("group_id");

    if (!email || !group_id) {
      toast.error("User email and group ID are required.");
      return;
    }

    try {
      const frostResponse = await await axios.post<ApiResponse>(
        `${backend_url}/frost-server`,
        {
          user_email: email,
          group_id: group_id
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Include Keycloak token
          },
          validateStatus: (status) => true,
        }
      );;

      if (frostResponse.status !== 200 || !frostResponse.data.PORT) {
        throw new Error(frostResponse.data.message || "Failed to fetch Frost Server port.");
      }

      setFrostServerPort(frostResponse.data.PORT);
      const port = frostResponse.data.PORT;

      const baseUrl = isDev
        ? `${backend_url_root}:${port}/FROST-Server/v1.0`
        : `https://${port}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0`;

      const devicesResponse = await axios.get(`${baseUrl}/Datastreams`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (devicesResponse.status === 200 && devicesResponse.data.value) {
        console.log(devicesResponse.data.value);

        for (let i = 0; i < devicesResponse.data.value.length; i++) {
          const locationUrl = isDev
            ? `${backend_url_root}:${port}/FROST-Server/v1.0/Things(${devicesResponse.data.value[i]["@iot.id"]})/Locations`
            : `https://${port}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Things(${devicesResponse.data.value[i]["@iot.id"]})/Locations`;

          try {
            const locationResponse = await axios.get(locationUrl, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });

            if (locationResponse.status === 200 && locationResponse.data.value) {
              devicesResponse.data.value[i].Location = locationResponse.data.value[0];
              setDevices(devicesResponse.data.value);
            }
          } catch (locationError) {
            console.error("Error fetching location:", locationError);
          }
        }

        console.log(devices);
      }

      try {
        const observedPropsResponse = await axios.get(`${baseUrl}/ObservedProperties`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (observedPropsResponse.status === 200 && observedPropsResponse.data.value) {
          console.log(observedPropsResponse.data.value);
          setObservedProperties(observedPropsResponse.data.value);
        }
      } catch (observedPropsError) {
        console.error("Error fetching observed properties:", observedPropsError);
        toast.error("Error Getting Measurement Properties");
      }
    } catch (error: any) {
      console.error("Error fetching Frost Server Port:", error);
      toast.error(error.message || "Error Getting Frost Server Port");
    }
  };


  const handleOnChangeExistingDevice = (
    event: any,
    setFieldValue: (field: string, value: any) => void
  ) => {
    setFieldValue("device_existing_id", event.target.value);

    if (event.target.value === "") {
      setFieldValue("device_name", "");
      setFieldValue("device_description", "");
      setFieldValue("device_location_name", "");
      setFieldValue("device_location_description", "");
      setFieldValue("device_latitude", "");
      setFieldValue("device_longitude", "");
    } else {
      const device = devices.find(
        (device: any) => device["@iot.id"] === event.target.value
      );

      if (device) {
        setFieldValue("device_name", device.name);
        setFieldValue("device_description", device.description);
        setFieldValue("device_location_name", device.Location.name);
        setFieldValue(
          "device_location_description",
          device.Location.description
        );
        setFieldValue(
          "device_latitude",
          device.Location.location.coordinates[1]
        );
        setFieldValue(
          "device_longitude",
          device.Location.location.coordinates[0]
        );
      }
    }
  };

  useEffect(() => {
    ReactGA.event({
      category: GAactionStepper.category,
      action: GAactionStepper.action,
      label: GAactionStepper.label,
    });
    setLoading(true);
    fetchFrostPort();
    setLoading(false);
  }, []);

  return (
    <>
      <Dashboard>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <Grid container justifyContent="center">
              <Grid item>
                <BounceLoader color="#233044" />
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Formik
            initialValues={{
              // First Step

              device_existing_id: "",

              device_name: "",
              device_description: "",
              device_location_name: "",
              device_location_description: "",
              device_latitude: "",
              device_longitude: "",

              // Second Step

              observed_property_using_existing: null,
              observedProperty_existing_id: "",

              observeProperty_name: "",
              observeProperty_definition: "",
              observeProperty_description: "",

              // Third Step
              datastreams: [
                {
                  name: "",
                  description: "",
                  observationType: "",
                  unitOfMeasurement: {
                    name: "",
                    symbol: "",
                    definition: ""
                  }
                }
              ]
            }}
            validationSchema={getValidationSchemaPerStep(activeStep)}
            onSubmit={async (values: any, helpers: any) => { 
              const isDev = process.env.REACT_APP_IS_DEVELOPMENT === 'true';  
              if (isLastStep) {
                setLoading(true);
                helpers.resetForm();
                setActiveStep(0);
                
                try {
                  // 1: Store the Device 
                  const response_post_device = await axios.post(
                    isDev ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Things`  
                         : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Things`,
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
                            coordinates: [values.device_longitude, values.device_latitude],
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
            
                  // 2: Store the Observed Property (if not existing)
                  let observed_property_id = values.observedProperty_existing_id;
                  
                  if (!observed_property_id) {
                    const response_post_observed_property = await axios.post(
                      isDev ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/ObservedProperties` 
                           : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/ObservedProperties`,
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
            
                    // Get the ID of the newly created Observed Property
                    const response_get_observed_property = await axios.get(
                      isDev ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/ObservedProperties?$filter=name eq '${encodeURIComponent(values.observeProperty_name)}'`
                           : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/ObservedProperties?$filter=name eq '${encodeURIComponent(values.observeProperty_name)}'`,
                      {
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${keycloak?.token}`,
                        },
                      }
                    );
            
                    observed_property_id = response_get_observed_property.data.value[0]["@iot.id"];
                  }
            
                  // 3: Get the ID of the Device
                  const response_get_device = await axios.get(
                    isDev ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Things?$filter=name eq '${encodeURIComponent(values.device_name)}'`
                         : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Things?$filter=name eq '${encodeURIComponent(values.device_name)}'`,
                    {
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${keycloak?.token}`,
                      },
                    }
                  );
            
                  const device_id = response_get_device.data.value[0]["@iot.id"];
            
                  // 4: Store the Sensor
                  const sensor_name = `sensor_${values.device_name}_${values.observeProperty_name}`;
                  const response_post_sensor = await axios.post(
                    isDev ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Sensors` 
                         : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Sensors`,
                    {
                      name: sensor_name,
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
            
                  // 5: Get the Sensor ID
                  const response_get_sensor = await axios.get(
                    isDev ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Sensors?$filter=name eq '${encodeURIComponent(sensor_name)}'`
                         : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Sensors?$filter=name eq '${encodeURIComponent(sensor_name)}'`,
                    {
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${keycloak?.token}`,
                      },
                    }
                  );
            
                  const sensor_id = response_get_sensor.data.value[0]["@iot.id"];
            
                  // Get current timestamp in the correct timezone
                  const currentDate = new Date();
                  const targetTimeZone = "Europe/Rome";
                  const localDate = utcToZonedTime(currentDate, targetTimeZone);
                  const formattedDate = format(localDate, "yyyy-MM-dd'T'HH:mm:ss.SS'Z'");
                  const phenomenonTimeFormatted = `${formattedDate}/${formattedDate}`;
            
                  // 6: Bulk Create Datastreams
                  if (sensor_id && device_id && observed_property_id) {
                    const datastreamPromises = values.datastreams.map(async (datastream:any) => {
                      return axios.post(
                        isDev ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Datastreams`
                             : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Datastreams`,
                        {
                          name: datastream.name,
                          unitOfMeasurement: {
                            name: datastream.unitOfMeasurement.name,
                            symbol: datastream.unitOfMeasurement.symbol,
                            definition: datastream.unitOfMeasurement.definition,
                          },
                          Thing: {
                            "@iot.id": device_id,
                          },
                          description: datastream.description,
                          Sensor: {
                            "@iot.id": sensor_id,
                          },
                          ObservedProperty: {
                            "@iot.id": observed_property_id,
                          },
                          observationType: datastream.observationType,
                          phenomenonTime: phenomenonTimeFormatted,
                        },
                        {
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${keycloak?.token}`,
                          },
                        }
                      );
                    });
            
                    try {
                      const responses = await Promise.all(datastreamPromises);
                      if (responses.every((response) => response.status === 201)) {
                        Swal.fire({
                          icon: "success",
                          title: "Success!",
                          text: `${responses.length} Datastreams created successfully!`,
                        });
                      } else {
                        Swal.fire({
                          icon: "error",
                          title: "Oops...",
                          text: "Some datastreams failed to create!",
                        });
                      }
                    } catch (error) {
                      Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Something went wrong! Some datastreams were not created.",
                      });
                    }
                  }
                  
                } catch (error) {
                  Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Something went wrong! Device, Sensor, or Datastreams were not created!",
                  });
                }
                setLoading(false);
              } else {
                setActiveStep((s) => s + 1);
              }
              helpers.setSubmitting(false);
            }}
            
          >
            {({
              isSubmitting,
              errors,
              touched,
              handleChange,
              values,
              setFieldValue,
              setFieldError,
            }) => (
              <>
                <Breadcrumbs
                  aria-label="breadcrumb"
                  style={{
                    marginBottom: "10px",
                  }}
                >
                  <Typography color="text.primary">Data Space</Typography>
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
                      {useExistingDevice == null ? (
                        <Grid item xs={12} md={6}>
                          <TextField
                            select
                            fullWidth
                            name=""
                            value={values.device_existing_id}
                            onChange={(event) => {
                              if (event.target.value === "yes") {
                                setUseExistingDevice(true);
                              } else if (event.target.value === "no") {
                                setUseExistingDevice(false);
                              }
                            }}
                            label="Do you want to use a device as a reference?"
                            variant="outlined"
                          >
                            <MenuItem value={"yes"}>Yes</MenuItem>
                            <MenuItem value={"no"}>No</MenuItem>
                          </TextField>
                        </Grid>
                      ) : (
                        <>
                          {useExistingDevice && (
                            <Grid item xs={12} md={6}>
                              <TextField
                                select
                                fullWidth
                                name="device_existing_id"
                                value={values.device_existing_id}
                                onChange={(event) =>
                                  handleOnChangeExistingDevice(
                                    event,
                                    setFieldValue
                                  )
                                }
                                variant="outlined"
                                label="Select Existing Device"
                                error={Boolean(
                                  touched.device_existing_id &&
                                  errors.device_existing_id
                                )}
                                InputLabelProps={{ shrink: true }}
                                helperText={
                                  touched.device_existing_id &&
                                  errors.device_existing_id
                                }
                              >
                                <MenuItem
                                  value=""
                                  selected={values.device_existing_id === ""}
                                >
                                  <em>None</em>
                                </MenuItem>
                                {devices.map((item: any) => (
                                  <MenuItem
                                    key={item["@iot.id"]}
                                    value={item["@iot.id"]}
                                  >
                                    {item.name + " - " + item["@iot.id"]}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Grid>
                          )}
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Device Name"
                              name="device_name"
                              required
                              onChange={handleChange}
                              value={values.device_name}
                              variant="outlined"
                              error={
                                touched.device_name &&
                                Boolean(errors.device_name)
                              }
                              helperText={
                                (touched.device_name && errors.device_name) ||
                                "Name Is Required"
                              }
                            />
                          </Grid>{" "}
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              required
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
                                (touched.device_description &&
                                  errors.device_description) ||
                                "Description Is Required"
                              }
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Device Location"
                              name="device_location_name"
                              required
                              onChange={handleChange}
                              value={values.device_location_name}
                              variant="outlined"
                              error={
                                touched.device_location_name &&
                                Boolean(errors.device_location_name)
                              }
                              helperText={
                                (touched.device_location_name &&
                                  errors.device_location_name) ||
                                "Location Is Required"
                              }
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Location Description"
                              name="device_location_description"
                              required
                              onChange={handleChange}
                              value={values.device_location_description}
                              variant="outlined"
                              error={
                                touched.device_location_description &&
                                Boolean(errors.device_location_description)
                              }
                              helperText={
                                (touched.device_location_description &&
                                  errors.device_location_description) ||
                                "Description Is Required"
                              }
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Latitude"
                              name="device_latitude"
                              required
                              onChange={handleChange}
                              value={values.device_latitude}
                              variant="outlined"
                              error={
                                touched.device_latitude &&
                                Boolean(errors.device_latitude)
                              }
                              helperText={
                                (touched.device_latitude &&
                                  errors.device_latitude) ||
                                "Latitude Is Required"
                              }
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Longitude"
                              required
                              name="device_longitude"
                              onChange={handleChange}
                              value={values.device_longitude}
                              variant="outlined"
                              error={
                                touched.device_longitude &&
                                Boolean(errors.device_longitude)
                              }
                              helperText={
                                (touched.device_longitude &&
                                  errors.device_longitude) ||
                                "Longitude Is Required"
                              }
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>
                  )}
                  {/* Observation Property Step */}
                  {activeStep === 1 && (
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          select
                          fullWidth
                          name="observed_property_using_existing"
                          value={values.observed_property_using_existing}
                          label="Do you want to choose an existing Measurement Property?"
                          variant="outlined"
                          required
                          onChange={(event) => {
                            setFieldValue(
                              "observed_property_using_existing",
                              event.target.value
                            );

                            if (event.target.value === "yes") {
                              setFieldValue("observeProperty_name", "");
                              setFieldValue("observeProperty_description", "");
                              setFieldValue("observeProperty_definition", "");
                            } else if (event.target.value === "no") {
                              setFieldValue("observedProperty_existing_id", "");
                            }
                          }}
                        >
                          <MenuItem value={"yes"}>Yes</MenuItem>
                          <MenuItem value={"no"}>No</MenuItem>
                        </TextField>
                      </Grid>{" "}
                      {values.observed_property_using_existing === "yes" && (
                        <>
                          <Grid item xs={12} md={6}>
                            <TextField
                              select
                              fullWidth
                              required={
                                values.observed_property_using_existing ===
                                "yes"
                              }
                              name="observedProperty_existing_id"
                              value={values.observedProperty_existing_id}
                              label="Choose the existing Measurement Property"
                              variant="outlined"
                              error={
                                touched.observedProperty_existing_id &&
                                Boolean(errors.observedProperty_existing_id)
                              }
                              helperText={
                                (touched.observedProperty_existing_id &&
                                  errors.observedProperty_existing_id) ||
                                "Measurement Property Is Required"
                              }
                              onChange={(event) => {
                                if (event.target.value) {
                                  setFieldValue(
                                    "observedProperty_existing_id",
                                    event.target.value
                                  );
                                  setFieldValue("observeProperty_name", "");
                                  setFieldValue(
                                    "observeProperty_description",
                                    ""
                                  );
                                  setFieldValue(
                                    "observeProperty_definition",
                                    ""
                                  );
                                } else {
                                  setFieldValue(
                                    "observedProperty_existing_id",
                                    ""
                                  );
                                  setFieldValue("observeProperty_name", "");
                                  setFieldValue(
                                    "observeProperty_description",
                                    ""
                                  );
                                  setFieldValue(
                                    "observeProperty_definition",
                                    ""
                                  );
                                }
                              }}
                            >
                              {ObservedProperties.map((item: any) => (
                                <MenuItem
                                  key={item["@iot.id"]}
                                  value={item["@iot.id"]}
                                >
                                  {"Use " +
                                    item.name +
                                    " with ID: " +
                                    item["@iot.id"]}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                        </>
                      )}
                      {values.observed_property_using_existing === "no" && (
                        <>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Name"
                              required={
                                values.observed_property_using_existing === "no"
                              }
                              name="observeProperty_name"
                              onChange={handleChange}
                              value={values.observeProperty_name}
                              variant="outlined"
                              error={
                                touched.observeProperty_name &&
                                Boolean(errors.observeProperty_name)
                              }
                              helperText={
                                (touched.observeProperty_name &&
                                  errors.observeProperty_name) ||
                                "Name Is Required"
                              }
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              required={
                                values.observed_property_using_existing === "no"
                              }
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
                                (touched.observeProperty_definition &&
                                  errors.observeProperty_definition) ||
                                "Definition Is Required"
                              }
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Description"
                              required={
                                values.observed_property_using_existing === "no"
                              }
                              name="observeProperty_description"
                              onChange={handleChange}
                              value={values.observeProperty_description}
                              variant="outlined"
                              error={
                                touched.observeProperty_description &&
                                Boolean(errors.observeProperty_description)
                              }
                              helperText={
                                (touched.observeProperty_description &&
                                  errors.observeProperty_description) ||
                                "Description Is Required"
                              }
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>
                  )}

                  {/* DataStream Step */}
                  {activeStep === 2 && (
  <Grid container spacing={2}>
    {/* Render FieldArray for Datastreams */}
    <FieldArray
      name="datastreams"
      render={({ push, remove }) => (
        <>
          {values.datastreams.map((datastream, index) => (
            <React.Fragment key={index}>
              {/* Datastream Group */}
              <Grid container spacing={2} style={{ marginBottom: "20px" }}>
                {/* Datastream Name */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={`Datastream Name ${index + 1}`}
                    name={`datastreams[${index}].name`}
                    value={datastream.name}
                    onChange={handleChange}
                    error={
                      touched.datastreams?.[index]?.name &&
                      Boolean(errors.datastreams?.[index]?.name)
                    }
                    helperText={
                      touched.datastreams?.[index]?.name &&
                      errors.datastreams?.[index]?.name
                    }
                  />
                </Grid>

                {/* Generate Datastream Name Button */}
                <Grid item xs={12} md={12}>
                  <Button
                    onClick={() =>
                      setFieldValue(
                        `datastreams[${index}].name`,
                        `datastream_${values.device_name}_${values.observeProperty_name}`
                      )
                    }
                  >
                    Generate Datastream Name
                  </Button>
                </Grid>

                {/* Show/Hide Optional Data Button */}
                <Grid item xs={12} md={12}>
                  <Button
                    onClick={() =>
                      setOptionalDatastreamData({
                        ...optionalDatastreamData,
                        [index]: !optionalDatastreamData[index],
                      })
                    }
                  >
                    {optionalDatastreamData[index]
                      ? "Hide Optional Data"
                      : "Show Optional Data"}
                  </Button>
                </Grid>

                {/* Optional Fields */}
                {optionalDatastreamData[index] && (
                  <>
                    {/* Datastream Description */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Datastream Description"
                        name={`datastreams[${index}].description`}
                        value={datastream.description || ""}
                        onChange={handleChange}
                        error={
                          touched.datastreams?.[index]?.description &&
                          Boolean(errors.datastreams?.[index]?.description)
                        }
                        helperText={
                          touched.datastreams?.[index]?.description &&
                          errors.datastreams?.[index]?.description
                        }
                      />
                    </Grid>

                    {/* Observation Type */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Observation Type"
                        name={`datastreams[${index}].observationType`}
                        value={datastream.observationType || ""}
                        onChange={handleChange}
                        error={
                          touched.datastreams?.[index]?.observationType &&
                          Boolean(
                            typeof errors.datastreams?.[index] === "object" &&
                              errors.datastreams?.[index]?.observationType
                          )
                        }
                        helperText={
                          touched.datastreams?.[index]?.observationType &&
                          typeof errors.datastreams?.[index] === "object" &&
                          errors.datastreams?.[index]?.observationType
                        }
                      />
                    </Grid>

                    {/* Unit of Measurement Name */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Unit of Measurement Name"
                        name={`datastreams[${index}].unitOfMeasurement.name`}
                        value={datastream.unitOfMeasurement?.name || ""}
                        onChange={handleChange}
                        error={
                          touched.datastreams?.[index]?.unitOfMeasurement?.name &&
                          Boolean(
                            typeof errors.datastreams?.[index] === "object" &&
                              errors.datastreams?.[index]?.unitOfMeasurement?.name
                          )
                        }
                        helperText={
                          touched.datastreams?.[index]?.unitOfMeasurement?.name &&
                          typeof errors.datastreams?.[index] === "object" &&
                          errors.datastreams?.[index]?.unitOfMeasurement?.name
                        }
                      />
                    </Grid>

                    {/* Unit of Measurement Symbol */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Unit of Measurement Symbol"
                        name={`datastreams[${index}].unitOfMeasurement.symbol`}
                        value={datastream.unitOfMeasurement?.symbol || ""}
                        onChange={handleChange}
                        error={
                          touched.datastreams?.[index]?.unitOfMeasurement?.symbol &&
                          Boolean(
                            typeof errors.datastreams?.[index] === "object" &&
                              errors.datastreams?.[index]?.unitOfMeasurement?.symbol
                          )
                        }
                        helperText={
                          touched.datastreams?.[index]?.unitOfMeasurement?.symbol &&
                          typeof errors.datastreams?.[index] === "object" &&
                          errors.datastreams?.[index]?.unitOfMeasurement?.symbol
                        }
                      />
                    </Grid>

                    {/* Unit of Measurement Definition */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Unit of Measurement Definition"
                        name={`datastreams[${index}].unitOfMeasurement.definition`}
                        value={datastream.unitOfMeasurement?.definition || ""}
                        onChange={handleChange}
                        error={
                          touched.datastreams?.[index]?.unitOfMeasurement?.definition &&
                          Boolean(
                            typeof errors.datastreams?.[index] === "object" &&
                              errors.datastreams?.[index]?.unitOfMeasurement?.definition
                          )
                        }
                        helperText={
                          touched.datastreams?.[index]?.unitOfMeasurement?.definition &&
                          typeof errors.datastreams?.[index] === "object" &&
                          errors.datastreams?.[index]?.unitOfMeasurement?.definition
                        }
                      />
                    </Grid>
                  </>
                )}
              </Grid>

              {/* Remove Button */}
              {index > 0 && (
                <Grid item xs={12}>
                  <Button onClick={() => remove(index)}>Remove</Button>
                </Grid>
              )}

              {/* Divider Between Datastreams */}
              {index < values.datastreams.length - 1 && (
                <Grid item xs={12}>
                  <Divider style={{ marginTop: "20px", marginBottom: "20px" }} />
                </Grid>
              )}
            </React.Fragment>
          ))}

          {/* Add Datastream Button */}
          <Grid item xs={12}>
            <Button
              onClick={() =>
                push({
                  name: "",
                  description: "",
                  observationType: "",
                  unitOfMeasurement: {
                    name: "",
                    symbol: "",
                    definition: "",
                  },
                })
              }
            >
              Add Datastream
            </Button>
          </Grid>
        </>
      )}
    />
  </Grid>
)}
                  {/* Summary Step */}
                  {activeStep === 3 && (
                    <Grid container spacing={2}>
                      {/* Device Information */}
                      <Grid item xs={12} md={12}>
                        <Typography variant="h2" gutterBottom>
                          Device Information{" "}
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => setActiveStep(0)}
                          >
                            <CreateOutlinedIcon />
                          </Button>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography gutterBottom>
                          <span style={{ fontWeight: "bold", color: "#233044" }}>Device Name:</span>{" "}
                          {values.device_name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography gutterBottom>
                          <span style={{ fontWeight: "bold", color: "#233044" }}>
                            Device Description:
                          </span>{" "}
                          {values.device_description}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography gutterBottom>
                          <span style={{ fontWeight: "bold", color: "#233044" }}>
                            Device Location Name:
                          </span>{" "}
                          {values.device_location_name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography gutterBottom>
                          <span style={{ fontWeight: "bold", color: "#233044" }}>
                            Device Location Description:
                          </span>{" "}
                          {values.device_location_description}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography gutterBottom>
                          <span style={{ fontWeight: "bold", color: "#233044" }}>Device Latitude:</span>{" "}
                          {values.device_latitude}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography gutterBottom>
                          <span style={{ fontWeight: "bold", color: "#233044" }}>
                            Device Longitude:
                          </span>{" "}
                          {values.device_longitude}
                        </Typography>
                      </Grid>

                      {/* Divider */}
                      <Grid item xs={12} md={12}>
                        <Divider
                          style={{
                            marginTop: "20px",
                            marginBottom: "20px",
                            width: "100%",
                          }}
                        />
                      </Grid>

                      {/* Measurement Property Information */}
                      <Grid item xs={12} md={12}>
                        <Typography variant="h2" gutterBottom>
                          Measurement Property Information{" "}
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => setActiveStep(1)}
                          >
                            <CreateOutlinedIcon />
                          </Button>
                        </Typography>
                      </Grid>
                      {values.observedProperty_existing_id &&
                        values.observed_property_using_existing === "yes" ? (
                        <Grid item xs={12} md={4}>
                          <Typography gutterBottom>
                            <span style={{ fontWeight: "bold", color: "#233044" }}>
                              Existing Measurement Property ID:
                            </span>{" "}
                            {values.observedProperty_existing_id}
                          </Typography>
                        </Grid>
                      ) : (
                        <>
                          <Grid item xs={12} md={4}>
                            <Typography gutterBottom>
                              <span style={{ fontWeight: "bold", color: "#233044" }}>
                                Measurement Property Name:
                              </span>{" "}
                              {values.observeProperty_name}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography gutterBottom>
                              <span style={{ fontWeight: "bold", color: "#233044" }}>
                                Measurement Property Definition:
                              </span>{" "}
                              {values.observeProperty_definition}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography gutterBottom>
                              <span style={{ fontWeight: "bold", color: "#233044" }}>
                                Measurement Property Description:
                              </span>{" "}
                              {values.observeProperty_description}
                            </Typography>
                          </Grid>
                        </>
                      )}

                      {/* Divider */}
                      <Grid item xs={12} md={12}>
                        <Divider
                          style={{
                            marginTop: "20px",
                            marginBottom: "20px",
                            width: "100%",
                          }}
                        />
                      </Grid>

                      {/* Datastream Information */}
                      <Grid item xs={12} md={12}>
                        <Typography variant="h2" gutterBottom>
                          Datastream Information{" "}
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => setActiveStep(2)}
                          >
                            <CreateOutlinedIcon />
                          </Button>
                        </Typography>
                      </Grid>
                      {values.datastreams.map((datastream, index) => (
                        <React.Fragment key={index}>
                          <Grid item xs={12} md={4}>
                            <Typography gutterBottom>
                              <span style={{ fontWeight: "bold", color: "#233044" }}>
                                Datastream Name {index + 1}:
                              </span>{" "}
                              {datastream.name}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography gutterBottom>
                              <span style={{ fontWeight: "bold", color: "#233044" }}>
                                Datastream Description {index + 1}:
                              </span>{" "}
                              {datastream.description || <em>Not defined</em>}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography gutterBottom>
                              <span style={{ fontWeight: "bold", color: "#233044" }}>
                                Observation Type {index + 1}:
                              </span>{" "}
                              {datastream.observationType || <em>Not defined</em>}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography gutterBottom>
                              <span style={{ fontWeight: "bold", color: "#233044" }}>
                                Unit of Measurement Name {index + 1}:
                              </span>{" "}
                              {datastream.unitOfMeasurement?.name || <em>Not defined</em>}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography gutterBottom>
                              <span style={{ fontWeight: "bold", color: "#233044" }}>
                                Unit of Measurement Symbol {index + 1}:
                              </span>{" "}
                              {datastream.unitOfMeasurement?.symbol || <em>Not defined</em>}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography gutterBottom>
                              <span style={{ fontWeight: "bold", color: "#233044" }}>
                                Unit of Measurement Definition {index + 1}:
                              </span>{" "}
                              {datastream.unitOfMeasurement?.definition || <em>Not defined</em>}
                            </Typography>
                          </Grid>
                          {/* Add a divider between Datastreams */}
                          {index < values.datastreams.length - 1 && (
                            <Grid item xs={12} md={12}>
                              <Divider
                                style={{
                                  marginTop: "20px",
                                  marginBottom: "20px",
                                  width: "100%",
                                }}
                              />
                            </Grid>
                          )}
                        </React.Fragment>
                      ))}
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
                        onClick={() => {
                          const isDev = process.env.REACT_APP_IS_DEVELOPMENT === 'true';

                          // Step 0: Validate Device Name
                          if (activeStep === 0 && values.device_name !== "") {
                            axios
                              .get(
                                isDev
                                  ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Things?$filter=name%20eq%20%27${encodeURIComponent(values.device_name)}%27`
                                  : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Things?$filter=name%20eq%20%27${encodeURIComponent(values.device_name)}%27`,
                                {
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                  },
                                }
                              )
                              .then((response) => {
                                if (response.data.value.length > 0) {
                                  setFieldError("device_name", "Device name is already taken, please choose another one");
                                  Swal.fire({
                                    icon: "error",
                                    title: "Oops...",
                                    text: "Device name is already taken, please choose another one",
                                  });
                                  setActiveStep(0);
                                }
                              })
                              .catch((error) => {
                                console.error("Error checking device name:", error);
                              });
                          }

                          // Step 1: Validate Observed Property Name
                          else if (activeStep === 1 && values.observeProperty_name !== "") {
                            axios
                              .get(
                                isDev
                                  ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/ObservedProperties?$filter=name%20eq%20%27${encodeURIComponent(values.observeProperty_name)}%27`
                                  : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/ObservedProperties?$filter=name%20eq%20%27${encodeURIComponent(values.observeProperty_name)}%27`,
                                {
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                  },
                                }
                              )
                              .then((response) => {
                                if (response.data.value.length > 0) {
                                  setFieldError("observeProperty_name", "Measurement Property name is already taken, please choose another one");
                                  Swal.fire({
                                    icon: "error",
                                    title: "Oops...",
                                    text: "Measurement Property name is already taken, please choose another one",
                                  });
                                  setActiveStep(1);
                                }
                              })
                              .catch((error) => {
                                console.error("Error checking observed property name:", error);
                              });
                          }

                          // Step 2: Validate Datastream Names Dynamically
                          else if (activeStep === 2) {
                            // Array to track duplicate checks
                            const duplicatePromises = values.datastreams.map(async (datastream, index) => {
                              if (datastream.name.trim() === "") {
                                return; // Skip empty names
                              }

                              try {
                                const response = await axios.get(
                                  isDev
                                    ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Datastreams?$filter=name%20eq%20%27${encodeURIComponent(datastream.name)}%27`
                                    : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Datastreams?$filter=name%20eq%20%27${encodeURIComponent(datastream.name)}%27`,
                                  {
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${token}`,
                                    },
                                  }
                                );

                                if (response.data.value.length > 0) {
                                  // Set error for the specific datastream
                                  setFieldError(`datastreams[${index}].name`, "Datastream name is already taken, please choose another one");
                                  Swal.fire({
                                    icon: "error",
                                    title: "Oops...",
                                    text: `Datastream name "${datastream.name}" is already taken, please choose another one`,
                                  });
                                  setActiveStep(2); // Stay on the current step
                                }
                              } catch (error) {
                                console.error(`Error checking Datastream name "${datastream.name}":`, error);
                              }
                            });

                            // Wait for all duplicate checks to complete
                            Promise.all(duplicatePromises).then(() => {
                              // If no duplicates, proceed to the next step
                              setActiveStep(activeStep + 1);
                            });
                          }
                        }}
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
        )}
      </Dashboard>
    </>
  );
}

export default StepperStore;
