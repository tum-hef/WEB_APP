import * as yup from "yup";

export const device_validationSchema = yup.object().shape({
  device_name: yup
    .string()
    .required("Device name is required")
    .min(3, "Device name must be at least 3 characters")
    .max(20, "Device name must be at most 20 characters"),
  device_description: yup
    .string()
    .required("Device description is required")
    .min(3, "Device description must be at least 3 characters")
    .max(30, "Device description must be at most 30 characters"),
  location_name: yup
    .string()
    .required("Location name is required")
    .min(3, "Location name must be at least 3 characters")
    .max(20, "Location name must be at most 20 characters"),
  location_description: yup
    .string()
    .required("Location description is required")
    .min(3, "Location description must be at least 3 characters")
    .max(30, "Location description must be at most 30 characters"),
  location_longitude: yup
    .string()
    .required("Location longitude is required")
    .matches(/^-?\d+(\.\d+)?$/, "Location longitude must be a float format"),
  location_latitude: yup
    .string()
    .required("Location latitude is required")
    .matches(/^-?\d+(\.\d+)?$/, "Location latitude must be a float format"),
});

export const sensor_validationSchema = yup.object().shape({
  sensor_name: yup
    .string()
    .required("Sensor name is required")
    .min(3, "Sensor name must be at least 3 characters")
    .max(20, "Sensor name must be at most 20 characters"),
  sensor_description: yup
    .string()
    .required("Sensor description is required")
    .min(3, "Sensor description must be at least 3 characters")
    .max(30, "Sensor description must be at most 30 characters"),
  sensor_metadata: yup
    .string()
    .required("Sensor metadata is required")
    .min(3, "Sensor metadata must be at least 3 characters")
    .max(30, "Sensor metadata must be at most 30 characters"),
});

export const observation_property_validationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Measurement property name is required")
    .min(3, "Measurement property name must be at least 3 characters")
    .max(20, "Measurement property name must be at most 20 characters"),
  description: yup
    .string()
    .required("Measurement property description is required")
    .min(3, "Measurement property description must be at least 3 characters")
    .max(30, "Measurement property description must be at most 30 characters"),
  definition: yup
    .string()
    .required("Measurement property definition is required")
    .min(3, "Measurement property definition must be at least 3 characters")
    .max(30, "Measurement property definition must be at most 30 characters"),
});

export const datastreams_validationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Datastream name is required")
    .min(3, "Datastream name must be at least 3 characters")
    .max(20, "Datastream name must be at most 20 characters"),
  description: yup
    .string()
    .required("Datastream description is required")
    .min(3, "Datastream description must be at least 3 characters")
    .max(30, "Datastream description must be at most 30 characters"),
  observationType: yup
    .string()
    .required("Datastream observation type is required")
    .min(3, "Datastream observation type must be at least 3 characters")
    .max(60, "Datastream observation type must be at most 60 characters"),
  unit_of_measurement_name: yup
    .string()
    .required("Datastream unit of measurement name is required")
    .min(3, "Datastream unit of measurement name must be at least 3 characters")
    .max(
      30,
      "Datastream unit of measurement name must be at most 30 characters"
    ),
  unit_of_measurement_symbol: yup
    .string()
    .required("Datastream unit of measurement symbol is required"),
  unit_of_measurement_definition: yup
    .string()
    .required("Datastream unit of measurement definition is required")
    .min(
      3,
      "Datastream unit of measurement definition must be at least 3 characters"
    )
    .max(
      60,
      "Datastream unit of measurement definition must be at most 60 characters"
    ),
  sensor_id: yup.string().required("Datastream sensor id is required"),
  thing_id: yup.string().required("Datastream thing id is required"),
  observation_property_id: yup
    .string()
    .required("Measurement property id is required"),
});
