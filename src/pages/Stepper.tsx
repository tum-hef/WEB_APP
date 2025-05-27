import React, { Fragment, useEffect, useRef, useState } from "react";
import { FieldArray, Form, Formik, FormikErrors, FormikProps } from "formik";
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
  Chip,
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
interface ObserveProperty {
  name: string;
  description: string;
  definition: string;
  unit?: string;
  symbol?: string;
}
interface FormValues {
  // First Step: Device Fields
  device_existing_id: string;
  device_name: string;
  device_description: string;
  device_location_name: string;
  device_location_description: string;
  device_latitude: string;
  device_longitude: string;

  // Second Step: Observed Properties
  observedProperty_existing_id: string[]; // Array for multi-selection
  observeProperties: Array<{
    name: string;
    description: string;
    definition: string;
    unit?: string;
    symbol?: string;
  }>;

  // Third Step: Datastreams (Dynamic FieldArray)
  datastreams: Array<{
    name: string; // Auto-generated or user-defined
    description: string; // Optional
    observation_type: string; // Optional
    unit_of_measurement_name: string; // Optional
    unit_of_measurement_symbol: string; // Optional
    unit_of_measurement_definition: string; // Optional
    showOptional?: boolean; // Optional property to preserve showOptional state
  }>;
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
        observedProperty_existing_id: yup
          .array() // Validate as an array for multi-selection
          .nullable() // Allow null if no existing properties are selected
          .of(yup.string()) // Each item in the array must be a string (ID)
          .test(
            "at-least-one-property",
            "At least one Measurement Property (existing or new) is required",
            function (value) {
              const newProperties = this.parent.observeProperties;
              return (
                (value && value.length > 0) || // At least one existing property is selected
                (newProperties && newProperties.length > 0) // At least one new property is created
              );
            }
          ),
        observeProperties: yup
          .array()
          .of(
            yup.object({
              name: yup.string().required("Name is required"),
              description: yup.string().required("Description is required"),
              definition: yup.string().required("Definition is required"),
              unit: yup.string().nullable(),
              symbol: yup.string().nullable(),
            })
          )
          .test(
            "at-least-one-property",
            "At least one Measurement Property (existing or new) is required",
            function (value) {
              const existingProperties = this.parent.observedProperty_existing_id;
              return (
                (value && value.length > 0) || // At least one new property is created
                (existingProperties && existingProperties.length > 0) // At least one existing property is selected
              );
            }
          ),
      });
    case 2:
      return yup.object({
        datastreams: yup
          .array()
          .of(
            yup.object({
              name: yup.string().required("Datastream Name is required"),
              description: yup.string().nullable(),
              observation_type: yup.string().nullable(),
              unit_of_measurement_name: yup.string().nullable(),
              unit_of_measurement_symbol: yup.string().nullable(),
              unit_of_measurement_definition: yup.string().nullable(),
            })
          )
          .min(1, "At least one Datastream is required")
          .required("Datastreams are required"),
      });
  }
};

function StepperStore() {
  const [activeStep, setActiveStep] = useState(0);
  const isLastStep = activeStep === steps.length - 1;
  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const { keycloak } = useKeycloak();
  const [isProcessing, setIsProcessing] = useState(false);
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<any>([]);
  const prevStepRef = useRef(activeStep)
  const [ObservedProperties, setObservedProperties] = useState<any>([]);
  const formikRef = useRef<any>(null);
  const [useExistingDevice, setUseExistingDevice] = useState<boolean | null>(
    null
  );
  const [optionalDatastreamData, setOptionalDatastreamData] =
    useState<boolean[]>([]);

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

      const devicesResponse = await axios.get(`${baseUrl}/Things`, {
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


  useEffect(() => {
    // console.log(`Step transitioned from ${prevStepRef.current} to ${activeStep}`);
    prevStepRef.current = activeStep;
  }, [activeStep]);


  const handleClick = async (
    values: any,
    setFieldError: any,
    validateForm: () => Promise<FormikErrors<FormValues>>
  ) => {
    if (isProcessing) return; // Prevent multiple submissions
    setIsProcessing(true); // Mark the start of validation process

    try {
      // Step 1: Trigger Formik validation
      const validationErrors = await validateForm();

      // Check if there are any validation errors from Yup schema
      if (Object.keys(validationErrors).length > 0) {
        console.error("Validation errors:", validationErrors);

        // Extract the first error message from validationErrors
        const firstErrorField = Object.keys(validationErrors)[0]; // Get the first field with an error
        const rawError: any = validationErrors[firstErrorField as keyof typeof validationErrors];

        let firstErrorMessage: any;

        if (typeof rawError === "string") {
          firstErrorMessage = rawError;
        } else if (Array.isArray(rawError)) {
          firstErrorMessage = rawError[0];
        } else if (typeof rawError === "object" && rawError !== null) {
          // Extract the first value from the object
          const firstValue = Object.values(rawError)[0];
          firstErrorMessage = typeof firstValue === "string" ? firstValue : "An error occurred";
        } else {
          firstErrorMessage = "An error occurred";
        }
        firstErrorMessage = Object.values(firstErrorMessage)
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: firstErrorMessage,
        });
        return; // Stop further processing
      }

      // Step 2: Custom Validation Logic
      let shouldProceed = true; // Control if step should proceed or not
      const isDev = process.env.REACT_APP_IS_DEVELOPMENT === "true";

      // Step 0: Validate Device Name (Custom Logic)
      if (activeStep === 0 && values.device_name !== "") {
        const response = await axios.get(
          isDev
            ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Things?$filter=name%20eq%20%27${encodeURIComponent(
              values.device_name
            )}%27`
            : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Things?$filter=name%20eq%20%27${encodeURIComponent(
              values.device_name
            )}%27`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.value.length > 0) {
          setFieldError("device_name", "Device name is already taken, please choose another one");
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Device name is already taken, please choose another one",
          });
          shouldProceed = false; // Stop further processing
        }
      }

      // Step 1: Validate Observed Property Names (Custom Logic)
      if (activeStep === 1 && shouldProceed) {
        console.log("step22")
        for (const observedProperty of values.observeProperties) {
          if (observedProperty.name !== "") {
            const response = await axios.get(
              isDev
                ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/ObservedProperties?$filter=name%20eq%20%27${encodeURIComponent(
                  observedProperty.name
                )}%27`
                : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/ObservedProperties?$filter=name%20eq%20%27${encodeURIComponent(
                  observedProperty.name
                )}%27`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (response.data.value.length > 0) {
              setFieldError("observeProperties", `Observed Property "${observedProperty.name}" is already taken, please choose another one`);
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: `Observed Property "${observedProperty.name}" is already taken, please choose another one`,
              });
              shouldProceed = false; // Stop further processing
              break; // Exit loop, no need to check further properties
            }
          }
        }
      }

      // Step 2: Validate Datastream Names (Custom Logic)
      if (activeStep === 2 && shouldProceed) {
        for (const datastream of values.datastreams) {
          if (datastream.name !== "") {
            const response = await axios.get(
              isDev
                ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Datastreams?$filter=name%20eq%20%27${encodeURIComponent(
                  datastream.name
                )}%27`
                : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Datastreams?$filter=name%20eq%20%27${encodeURIComponent(
                  datastream.name
                )}%27`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (response.data.value.length > 0) {
              setFieldError("datastreams", `Datastream "${datastream.name}" is already taken, please choose another one`);
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: `Datastream "${datastream.name}" is already taken, please choose another one`,
              });
              shouldProceed = false; // Stop further processing
              break; // Exit loop, no need to check further datastreams
            }
          }
        }
      }
      let stepUpdated = false;

      // If all validations passed, move to the next step
      if (shouldProceed && !stepUpdated) {
        setActiveStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
        stepUpdated = true;
      }
    } catch (error) {
      console.error("Error during validation:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong while validating the form.",
      });
    } finally {
      setIsProcessing(false); // End the validation process
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

  useEffect(() => {
    const formik = formikRef.current;
    if (!formik || activeStep !== 2) return;

    const { values, setFieldValue } = formik;

    // Delay update to let React finish rendering the new step
    setTimeout(() => {
      const combinedProperties = [
        ...(values.observedProperty_existing_id || []).map((id: string) => {
          const existingProperty = ObservedProperties.find((item: any) => item["@iot.id"] === id);
          return { name: existingProperty?.name || `Property ID: ${id}` };
        }),
        ...values.observeProperties,
      ];

      const updatedDatastreams = combinedProperties.map((property: any) => {
        const generatedName = `datastream_${values.device_name}_${property.name}`;

        const existingDatastream = values.datastreams.find(
          (d: any) => d.name === generatedName
        );
        const observedProperty = ObservedProperties.find((item: any) => item.name === property.name);
        const existingProp = ObservedProperties.find((item: any) => item.name === property.name);
        const fallbackProp = values.observeProperties.find((item: any) => item.name === property.name);
        const unit = existingProp?.properties?.unit || fallbackProp?.unit || "";
        const symbol = existingProp?.properties?.symbol || fallbackProp?.symbol || "";

        return {
          name: generatedName,
          // ✅ Always regenerate the description
          description: existingDatastream?.description || `datastream for ${property?.name} of ${values?.device_name}`,

          // ✅ Optionally reuse other fields
          observation_type: existingDatastream?.observation_type || "",
          unit_of_measurement_name: existingDatastream?.unit_of_measurement_name || unit,
          unit_of_measurement_symbol: existingDatastream?.unit_of_measurement_symbol || symbol,
          unit_of_measurement_definition: existingDatastream?.unit_of_measurement_definition || "",
          showOptional: existingDatastream?.showOptional || false,
        };
      });
      setFieldValue("datastreams", updatedDatastreams, false);
    }, 0); // Run after current render cycle
  }, [
    activeStep,
    ObservedProperties,
    formikRef.current?.values.observeProperties,
    formikRef.current?.values.observedProperty_existing_id,
  ]);


  // useEffect(()=>{
  //   console.log("current formkkil values to check", formikRef.current?.values)

  // },[ formikRef.current?.values])


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
              // First Step: Device Fields
              device_existing_id: "",
              device_name: "",
              device_description: "",
              device_location_name: "",
              device_location_description: "",
              device_latitude: "",
              device_longitude: "",
              // Second Step: Observed Properties
              observed_property_using_existing: null,
              observedProperty_existing_id: [], // Array for multi-selection
              observeProperties: [] as ObserveProperty[],
              // Third Step: Datastreams (Dynamic FieldArray)
              datastreams: [] as Array<{
                name: string;
                description: string;
                observation_type: string;
                unit_of_measurement_name: string;
                unit_of_measurement_symbol: string;
                unit_of_measurement_definition: string;
              }>,
            }}
            // enableReinitialize
            validationSchema={getValidationSchemaPerStep(activeStep)}
            innerRef={(instance) => {
              formikRef.current = instance; // Store the Formik instance
            }}
            onSubmit={async (values: any, helpers: any) => {
              const isDev = process.env.REACT_APP_IS_DEVELOPMENT === "true";
              const frostServerUrl = isDev
                ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0`
                : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0`;

              if (isLastStep) {
                setLoading(true);
                helpers.resetForm();
                setActiveStep(0);

                try {
                  // 1️⃣ CREATE DEVICE (THING)
                  const response_post_device = await axios.post(
                    `${frostServerUrl}/Things`,
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
                    { headers: { "Content-Type": "application/json", Authorization: `Bearer ${keycloak?.token}` } }
                  );

                  console.log("✅ Device Created:", response_post_device.data);
                  const currentDate = new Date();

                  // Set the target time zone to Europe/Rome
                  const targetTimeZone = "Europe/Rome";

                  // Convert the current date to the local time of Rome
                  const localDate = utcToZonedTime(currentDate, targetTimeZone);

                  // Format the local date
                  const formattedDate = format(
                    localDate,
                    "yyyy-MM-dd'T'HH:mm:ss.SS'Z'"
                  );
                  const phenphenomenonTimeFormated = `${formattedDate}/${formattedDate}`;

                  // Get Device ID
                  const deviceResponseUrl = isDev
                    ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Things?$filter=name%20eq%20%27${encodeURIComponent(values.device_name)}%27`
                    : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Things?$filter=name%20eq%20%27${encodeURIComponent(values.device_name)}%27`;
                  const deviceResponse = await axios.get(deviceResponseUrl, {
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${keycloak?.token}` },
                  });
                  const device_id = deviceResponse.data.value[0]["@iot.id"];

                  // 2️⃣ CREATE OBSERVED PROPERTIES (MULTIPLE)
                  let observedPropertyIds: Record<string, number> = {}; // Use datastream.name as key
                  for (const observedProperty of values.observeProperties || []) {
                    // Create the Observed Property
                    const response_post_observed_property = await axios.post(
                      `${frostServerUrl}/ObservedProperties`,
                      {
                        name: observedProperty.name,
                        definition: observedProperty.definition,
                        description: observedProperty.description,
                        properties: {
                          unit: observedProperty.unit || "",
                          symbol: observedProperty.symbol || "",
                        },
                      },
                      { headers: { "Content-Type": "application/json", Authorization: `Bearer ${keycloak?.token}` } }
                    );

                    // Get the Observed Property ID
                    const response_get_observed_property_url = `${frostServerUrl}/ObservedProperties?$filter=name%20eq%20%27${encodeURIComponent(observedProperty.name)}%27`;
                    const response_get_observed_property = await axios.get(response_get_observed_property_url, {
                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${keycloak?.token}` },
                    });

                    const observed_property_id = response_get_observed_property.data.value[0]["@iot.id"];
                    observedPropertyIds[`datastream_${values.device_name}_${observedProperty.name}`] = observed_property_id; // Store by datastream name

                    console.log(`✅ Observed Property Created: ${observedProperty.name} -> ID ${observed_property_id}`);
                  }
                  for (const existingPropertyId of values.observedProperty_existing_id || []) {
                    const response_get_observed_property = await axios.get(
                      `${frostServerUrl}/ObservedProperties(${existingPropertyId})`,
                      { headers: { "Content-Type": "application/json", Authorization: `Bearer ${keycloak?.token}` } }
                    );

                    const observedProperty = response_get_observed_property.data;
                    observedPropertyIds[`datastream_${values.device_name}_${observedProperty.name}`] = parseInt(existingPropertyId, 10);

                    console.log(`✅ Existing Observed Property Found: ${observedProperty.name} -> ID ${existingPropertyId}`);
                  }

                  // 3️⃣ CREATE SENSORS (ONE FOR EACH OBSERVED PROPERTY)
                  let sensorIds: Record<string, number> = {}; // Use datastream.name as key
                  for (const observedPropertyName in observedPropertyIds) {
                    const sensorName = `sensor_${values.device_name}_${observedPropertyName}`;
                    const response_post_sensor = await axios.post(
                      `${frostServerUrl}/Sensors`,
                      {
                        name: sensorName,
                        description: `Sensor for ${values.device_name} and ${observedPropertyName}`,
                        metadata: `Sensor MetaData for ${values.device_name} and ${observedPropertyName}`,
                        encodingType: "application/pdf",
                      },
                      { headers: { "Content-Type": "application/json", Authorization: `Bearer ${keycloak?.token}` } }
                    );

                    console.log("✅ Sensor Created:", response_post_sensor);

                    // Get the Sensor ID
                    const response_get_sensor_url = `${frostServerUrl}/Sensors?$filter=name%20eq%20%27${encodeURIComponent(sensorName)}%27`;
                    const response_get_sensor = await axios.get(response_get_sensor_url, {
                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${keycloak?.token}` },
                    });

                    const sensor_id = response_get_sensor.data.value[0]["@iot.id"];
                    sensorIds[observedPropertyName] = sensor_id; // Store by datastream name

                    console.log("✅ Sensor Created:", sensor_id);
                  }

                  console.log("sensorIds", sensorIds);
                  console.log("observed_property_id", observedPropertyIds);

                  // 4️⃣ CREATE DATASTREAMS (ONE FOR EACH PROPERTY)
                  for (const datastream of values.datastreams || []) {
                    console.log("datastream", datastream);

                    // Retrieve the ObservedProperty ID and Sensor ID using the datastream name
                    const observed_property_id = observedPropertyIds[datastream.name];
                    const sensor_id = sensorIds[datastream.name];

                    if (!observed_property_id || !sensor_id) {
                      console.error("🚨 Skipping Datastream due to missing IDs:", { datastream: datastream.name, observed_property_id, sensor_id });
                      continue; // Skip this datastream if IDs are missing
                    }

                    // Create the Datastream
                    const response_post_datastream = await axios.post(
                      `${frostServerUrl}/Datastreams`,
                      {
                        name: datastream.name,
                        description: datastream.description,
                        unitOfMeasurement: {
                          name: datastream.unit_of_measurement_name,
                          symbol: datastream.unit_of_measurement_symbol,
                          definition: datastream.unit_of_measurement_definition,
                        },
                        Thing: { "@iot.id": device_id },
                        Sensor: { "@iot.id": sensor_id },
                        ObservedProperty: { "@iot.id": observed_property_id },
                        observationType: datastream.observation_type,
                        phenomenonTime: phenphenomenonTimeFormated,
                      },
                      { headers: { "Content-Type": "application/json", Authorization: `Bearer ${keycloak?.token}` } }
                    );

                    console.log("✅ Datastream Created:", response_post_datastream.data);
                  }

                  Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: "Device, Measurement Properties, Sensors, and Datastreams created successfully!",
                  });
                } catch (error) {
                  console.error("🚨 Error in submission:", error);
                  Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Something went wrong! Some entities were not created.",
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
              validateForm
            }: FormikProps<FormValues>) => {


              return (

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
                        {/* Section 1: Select Existing Measurement Properties */}
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle1" gutterBottom>
                            Select Existing Measurement Properties
                          </Typography>
                          <TextField
                            select
                            fullWidth
                            name="observedProperty_existing_id"
                            value={values.observedProperty_existing_id || []}
                            label="Choose Existing Measurement Properties"
                            variant="outlined"
                            SelectProps={{
                              multiple: true,
                              renderValue: (selected: any) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {selected.map((value: any) => {
                                    const selectedItem = ObservedProperties.find(
                                      (item: any) => item["@iot.id"] === value
                                    );
                                    return (
                                      <Chip
                                        key={value}
                                        label={
                                          selectedItem
                                            ? selectedItem.name
                                            : value
                                        }
                                      />
                                    );
                                  })}
                                </Box>
                              ),
                            }}
                            onChange={(event) => {
                              const selectedValues = event.target.value;
                              setFieldValue("observedProperty_existing_id", selectedValues);
                            }}
                          >
                            {ObservedProperties.map((item: any) => (
                              <MenuItem key={item["@iot.id"]} value={item["@iot.id"]}>
                                {item.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>

                        {/* Section 2: Create New Measurement Properties */}
                        <Grid item xs={12}>
                          <Typography variant="subtitle1" gutterBottom>
                            Create New Measurement Properties
                          </Typography>
                          <FieldArray name="observeProperties">
                            {({ push, remove, form }) => {
                              const observeProperties = form.values.observeProperties as ObserveProperty[];
                              return (
                                <Grid container spacing={3}>
                                  {observeProperties.map((datastream: any, index) => (

                                    <Fragment key={index}>
                                      <Grid item xs={12}>
                                        <Divider sx={{ my: 2 }} />
                                      </Grid>
                                      {/* Name Field */}
                                      <Grid item xs={12} md={4}>
                                        <TextField
                                          fullWidth
                                          label="Name"
                                          name={`observeProperties.${index}.name`}
                                          value={form.values.observeProperties[index]?.name || ""}
                                          onChange={form.handleChange}
                                          variant="outlined"
                                          error={
                                            Array.isArray(form.touched.observeProperties) &&
                                            Array.isArray(form.errors.observeProperties) &&
                                            typeof form.errors.observeProperties[index] === "object" &&
                                            Boolean(form.touched.observeProperties[index]) &&
                                            Boolean((form.errors.observeProperties[index] as FormikErrors<any>)?.name)
                                          }
                                          helperText={
                                            Array.isArray(form.errors.observeProperties) &&
                                            Array.isArray(form.touched.observeProperties) &&
                                            typeof form.errors.observeProperties[index] === "object" &&
                                            form.touched.observeProperties[index] &&
                                            (form.errors.observeProperties[index] as FormikErrors<any>)?.name
                                          }
                                        />
                                      </Grid>
                                      {/* Definition Field */}
                                      <Grid item xs={12} md={4}>
                                        <TextField
                                          fullWidth
                                          label="Definition"
                                          name={`observeProperties.${index}.definition`}
                                          value={form.values.observeProperties[index]?.definition || ""}
                                          onChange={form.handleChange}
                                          variant="outlined"
                                          error={
                                            Array.isArray(form.touched.observeProperties) &&
                                            Array.isArray(form.errors.observeProperties) &&
                                            typeof form.errors.observeProperties[index] === "object" &&
                                            Boolean(form.touched.observeProperties[index]) &&
                                            Boolean((form.errors.observeProperties[index] as FormikErrors<any>)?.definition)
                                          }
                                          helperText={
                                            Array.isArray(form.errors.observeProperties) &&
                                            Array.isArray(form.touched.observeProperties) &&
                                            typeof form.errors.observeProperties[index] === "object" &&
                                            form.touched.observeProperties[index] &&
                                            (form.errors.observeProperties[index] as FormikErrors<any>)?.definition
                                          }
                                        />
                                      </Grid>
                                      {/* Description Field */}
                                      <Grid item xs={12} md={4}>
                                        <TextField
                                          fullWidth
                                          label="Description"
                                          name={`observeProperties.${index}.description`}
                                          value={form.values.observeProperties[index]?.description || ""}
                                          onChange={form.handleChange}
                                          variant="outlined"
                                          error={
                                            Array.isArray(form.touched.observeProperties) &&
                                            Array.isArray(form.errors.observeProperties) &&
                                            typeof form.errors.observeProperties[index] === "object" &&
                                            Boolean(form.touched.observeProperties[index]) &&
                                            Boolean((form.errors.observeProperties[index] as FormikErrors<any>)?.description)
                                          }
                                          helperText={
                                            Array.isArray(form.errors.observeProperties) &&
                                            Array.isArray(form.touched.observeProperties) &&
                                            typeof form.errors.observeProperties[index] === "object" &&
                                            form.touched.observeProperties[index] &&
                                            (form.errors.observeProperties[index] as FormikErrors<any>)?.description
                                          }
                                        />
                                      </Grid>
                                      <Grid item xs={12} md={4}>
                                        <TextField
                                          fullWidth
                                          label="Unit (e.g. Celsius)"
                                          name={`observeProperties.${index}.unit`}
                                          value={form.values.observeProperties[index]?.unit || ""}
                                          onChange={form.handleChange}
                                          variant="outlined"
                                        />
                                      </Grid>
                                      {/* Symbol Field */}
                                      <Grid item xs={12} md={4}>
                                        <TextField
                                          fullWidth
                                          label="Symbol (e.g. °C)"
                                          name={`observeProperties.${index}.symbol`}
                                          value={form.values.observeProperties[index]?.symbol || ""}
                                          onChange={form.handleChange}
                                          variant="outlined"
                                        />
                                      </Grid>
                                      {/* Remove Button */}
                                      <Grid item xs={12}>
                                        <Button
                                          variant="contained"
                                          color="error"
                                          onClick={() => remove(index)}
                                        >
                                          Remove Property
                                        </Button>
                                      </Grid>
                                    </Fragment>
                                  ))}
                                  {/* Add Button */}
                                  <Grid item xs={12}>
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      onClick={() =>
                                        push({
                                          name: "",
                                          definition: "",
                                          description: "",
                                          unit: "",
                                          symbol: "",
                                        })
                                      }
                                    >
                                      Add New Measurement Property
                                    </Button>
                                  </Grid>
                                </Grid>
                              );
                            }}
                          </FieldArray>

                        </Grid>
                      </Grid>
                    )}

                    {/* DataStream Step */}
                    {/* DataStream Step */}
                    {activeStep === 2 && (
                      <Grid container spacing={2}>
                        <FieldArray name="datastreams">
                          {({ push, remove, form }) => {
                            const { values, touched, errors, handleChange, setFieldValue } = form;

                            return (
                              <>
                                {values.datastreams.map((datastream: any, index: number) => (
                                  <Fragment key={index}>
                                    {/* Datastream Name (Auto-generated) */}
                                    <Grid item xs={12} md={6}>
                                      <TextField
                                        fullWidth
                                        label={`Datastream Name`}
                                        name={`datastreams.${index}.name`}
                                        value={datastream?.name}
                                        variant="outlined"
                                        InputProps={{ readOnly: true }}
                                        helperText="Auto-generated based on device name"
                                      />
                                    </Grid>
                                    {/* <Grid item xs={12} md={6}>
                                      <TextField
                                        fullWidth
                                        label={`Datastream Description`}
                                        name={`datastreams.${index}.description`}
                                        onChange={handleChange}
                                        variant="outlined"
                                        InputProps={{ value: datastream?.description }}
                                        helperText="Auto-generated based on device name"
                                      />
                                    </Grid> */}

                                    {/* Toggle Button for Optional Fields */}
                                    <Grid item xs={12}>
                                      <Button
                                        variant="contained"
                                        color={values.datastreams[index].showOptional ? "error" : "primary"}
                                        onClick={() => {
                                          const updatedDatastreams = [...values.datastreams];
                                          updatedDatastreams[index].showOptional = !updatedDatastreams[index].showOptional;
                                          setFieldValue("datastreams", updatedDatastreams);
                                        }}
                                      >
                                        {values.datastreams[index].showOptional ? "Hide Optional Data" : "Show Optional Data"}
                                      </Button>
                                    </Grid>

                                    {/* Optional Fields */}
                                    {values.datastreams[index].showOptional && (
                                      <>
                                        <Grid item xs={12} md={6}>
                                          <TextField
                                            fullWidth
                                            label="Datastream Description"
                                            name={`datastreams.${index}.description`}
                                            value={values.datastreams[index]?.description || ""}
                                            // InputProps={{ value: datastream?.description }}
                                            onChange={handleChange}
                                            variant="outlined"
                                          />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                          <TextField
                                            fullWidth
                                            label="Observation Type"
                                            name={`datastreams.${index}.observation_type`}
                                            value={values.datastreams[index]?.observation_type || ""}
                                            onChange={handleChange}
                                            variant="outlined"
                                          />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                          <TextField
                                            fullWidth
                                            label="Unit of Measurement Name"
                                            name={`datastreams.${index}.unit_of_measurement_name`}
                                            value={values.datastreams[index]?.unit_of_measurement_name || ""}
                                            onChange={handleChange}
                                            variant="outlined"
                                          />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                          <TextField
                                            fullWidth
                                            label="Unit of Measurement Symbol"
                                            name={`datastreams.${index}.unit_of_measurement_symbol`}
                                            value={values.datastreams[index]?.unit_of_measurement_symbol || ""}
                                            onChange={handleChange}
                                            variant="outlined"
                                          />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                          <TextField
                                            fullWidth
                                            label="Unit of Measurement Definition"
                                            name={`datastreams.${index}.unit_of_measurement_definition`}
                                            value={values.datastreams[index]?.unit_of_measurement_definition || ""}
                                            onChange={handleChange}
                                            variant="outlined"
                                          />
                                        </Grid>
                                      </>
                                    )}

                                    {/* Remove Button */}
                                    {/* <Grid item xs={12}>
                                      <Button variant="contained" color="error" onClick={() => remove(index)}>
                                        Remove Datastream
                                      </Button>
                                    </Grid> */}

                                    {/* Divider */}
                                    <Grid item xs={12}>
                                      <Divider sx={{ my: 2 }} />
                                    </Grid>
                                  </Fragment>
                                ))}

                                {/* Add New Datastream Button */}
                                {/* <Grid item xs={12}>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() =>
                                      push({
                                        name: "",
                                        description: "",
                                        observation_type: "",
                                        unit_of_measurement_name: "",
                                        unit_of_measurement_symbol: "",
                                        unit_of_measurement_definition: "",
                                        showOptional: false,
                                      })
                                    }
                                  >
                                    Add New Datastream
                                  </Button>
                                </Grid> */}
                              </>
                            );
                          }}
                        </FieldArray>
                      </Grid>
                    )}



                    {/* Summary Step */}
                    {/* Summary Step */}
                    {activeStep === 3 && (
                      <Grid container spacing={2}>
                        {/* Device Information Section */}
                        <Grid item xs={12}>
                          <Typography variant="h2" gutterBottom>
                            Device Information
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={() => setActiveStep(0)}
                              style={{ marginLeft: "10px" }}
                            >
                              <CreateOutlinedIcon />
                            </Button>
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography gutterBottom>
                            <strong style={{ fontWeight: "bold", color: "#233044" }}>Device Name:</strong>{" "}
                            {values.device_name || <em>Not defined</em>}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography gutterBottom>
                            <strong style={{ fontWeight: "bold", color: "#233044" }}>Device Description:</strong>{" "}
                            {values.device_description || <em>Not defined</em>}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography gutterBottom>
                            <strong style={{ fontWeight: "bold", color: "#233044" }}>Device Location Name:</strong>{" "}
                            {values.device_location_name || <em>Not defined</em>}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography gutterBottom>
                            <strong style={{ fontWeight: "bold", color: "#233044" }}>Device Location Description:</strong>{" "}
                            {values.device_location_description || <em>Not defined</em>}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography gutterBottom>
                            <strong style={{ fontWeight: "bold", color: "#233044" }}>Device Latitude:</strong>{" "}
                            {values.device_latitude || <em>Not defined</em>}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography gutterBottom>
                            <strong style={{ fontWeight: "bold", color: "#233044" }}>Device Longitude:</strong>{" "}
                            {values.device_longitude || <em>Not defined</em>}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider style={{ margin: "20px 0" }} />
                        </Grid>

                        {/* Measurement Properties Section */}
                        <Grid item xs={12}>
                          <Typography variant="h2" gutterBottom>
                            Measurement Properties
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={() => setActiveStep(1)}
                              style={{ marginLeft: "10px" }}
                            >
                              <CreateOutlinedIcon />
                            </Button>
                          </Typography>
                        </Grid>
                        {[
                          ...(values.observedProperty_existing_id || []).map((id: string) => {
                            const existingProperty = ObservedProperties.find(
                              (item: any) => item["@iot.id"] === id
                            );
                            return {
                              name: existingProperty?.name || `Property ID: ${id}`,
                              description: existingProperty?.description || "No description",
                              definition: existingProperty?.definition || "No definition",
                            };
                          }),
                          ...values.observeProperties,
                        ].map((property: any, index: number) => (
                          <Fragment key={index}>
                            <Grid item xs={12}>
                              <Grid container spacing={2}>
                                <Grid item xs={4}>
                                  <Typography>
                                    <strong style={{ fontWeight: "bold", color: "#233044" }}>Name:</strong>{" "}
                                    {property.name || <em>Not defined</em>}
                                  </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                  <Typography>
                                    <strong style={{ fontWeight: "bold", color: "#233044" }}>Description:</strong>{" "}
                                    {property.description || <em>Not defined</em>}
                                  </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                  <Typography>
                                    <strong style={{ fontWeight: "bold", color: "#233044" }}>Definition:</strong>{" "}
                                    {property.definition || <em>Not defined</em>}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Grid>
                            <Grid item xs={12}>
                              <Divider sx={{ my: 2 }} />
                            </Grid>
                          </Fragment>
                        ))}

                        {/* Datastream Information Section */}
                        <Grid item xs={12}>
                          <Typography variant="h2" gutterBottom>
                            Datastream Information
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={() => setActiveStep(2)}
                              style={{ marginLeft: "10px" }}
                            >
                              <CreateOutlinedIcon />
                            </Button>
                          </Typography>
                        </Grid>
                        {values.datastreams.map((datastream: any, index: number) => (
                          <Fragment key={index}>
                            <Grid item xs={12}>
                              <Grid container spacing={2}>
                                <Grid item xs={4}>
                                  <Typography>
                                    <strong style={{ fontWeight: "bold", color: "#233044" }}>Name:</strong>{" "}
                                    {datastream.name || <em>Not defined</em>}
                                  </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                  <Typography>
                                    <strong style={{ fontWeight: "bold", color: "#233044" }}>Description:</strong>{" "}
                                    {datastream.description || <em>Not defined</em>}
                                  </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                  <Typography>
                                    <strong style={{ fontWeight: "bold", color: "#233044" }}>Observation Type:</strong>{" "}
                                    {datastream.observation_type || <em>Not defined</em>}
                                  </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                  <Typography>
                                    <strong style={{ fontWeight: "bold", color: "#233044" }}>Unit of Measurement Name:</strong>{" "}
                                    {datastream.unit_of_measurement_name || <em>Not defined</em>}
                                  </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                  <Typography>
                                    <strong style={{ fontWeight: "bold", color: "#233044" }}>Unit of Measurement Symbol:</strong>{" "}
                                    {datastream.unit_of_measurement_symbol || <em>Not defined</em>}
                                  </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                  <Typography>
                                    <strong style={{ fontWeight: "bold", color: "#233044" }}>Unit of Measurement Definition:</strong>{" "}
                                    {datastream.unit_of_measurement_definition || <em>Not defined</em>}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Grid>
                            <Grid item xs={12}>
                              <Divider sx={{ my: 2 }} />
                            </Grid>
                          </Fragment>
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
                          onClick={() => handleClick(values, setFieldError, validateForm)}



                          style={{
                            backgroundColor: "#233044",
                            color: "#fff",
                          }}
                          type={isLastStep ? "submit" : "button"}
                          disabled={
                            isSubmitting || isProcessing ||
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
              )
            }

            }
          </Formik>
        )}
      </Dashboard>
    </>
  );
}

export default StepperStore;
