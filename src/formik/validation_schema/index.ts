import * as yup from "yup";

export const device_validationSchema = yup.object().shape({
  device_name: yup
    .string()
    .required("Device name is required")
    .min(3, "Device name must be at least 3 characters")
    .max(40, "Device name must be at most 40 characters"),
  device_description: yup
    .string()
    .required("Device description is required")
    .min(3, "Device description must be at least 3 characters")
    .max(40, "Device description must be at most 40 characters"),
  location_name: yup
    .string()
    .required("Location name is required")
    .min(3, "Location name must be at least 3 characters")
    .max(40, "Location name must be at most 40 characters"),
  location_description: yup
    .string()
    .required("Location description is required")
    .min(3, "Location description must be at least 3 characters")
    .max(40, "Location description must be at most 40 characters"),
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
    .max(40, "Sensor name must be at most 40 characters"),
  sensor_description: yup
    .string()
    .required("Sensor description is required")
    .min(3, "Sensor description must be at least 3 characters")
    .max(40, "Sensor description must be at most 40 characters"),
  sensor_metadata: yup
    .string()
    .required("Sensor metadata is required")
    .min(3, "Sensor metadata must be at least 3 characters")
    .max(40, "Sensor metadata must be at most 40 characters"),
});

export const location_validationSchema = yup.object().shape({
  location_name: yup
    .string()
    .required("Location name is required")
    .min(3, "Location name must be at least 3 characters")
    .max(40, "Location name must be at most 40 characters"),

  location_description: yup
    .string()
    .required("Location description is required")
    .min(3, "Location description must be at least 3 characters")
    .max(100, "Location description must be at most 100 characters"),

  latitude: yup
    .string()
    .required("Latitude is required")
    .matches(
      /^-?\d+(\.\d+)?$/,
      "Latitude must be a valid number (decimal allowed)"
    ),

  longitude: yup
    .string()
    .required("Longitude is required")
    .matches(
      /^-?\d+(\.\d+)?$/,
      "Longitude must be a valid number (decimal allowed)"
    ),
});

export const observation_property_validationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Measurement property name is required")
    .min(3, "Measurement property name must be at least 3 characters")
    .max(40, "Measurement property name must be at most 40 characters"),
  description: yup
    .string()
    .required("Measurement property description is required")
    .min(3, "Measurement property description must be at least 3 characters")
    .max(40, "Measurement property description must be at most 40 characters"),
  definition: yup
    .string()
    .required("Measurement property definition is required")
    .min(3, "Measurement property definition must be at least 3 characters")
    .max(40, "Measurement property definition must be at most 40 characters"),
});

export const datastreams_validationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Datastream name is required")
    .min(3, "Datastream name must be at least 3 characters")
    .max(40, "Datastream name must be at most 40 characters"),
  description: yup
    .string()
    .required("Datastream description is required")
    .min(3, "Datastream description must be at least 3 characters")
    .max(40, "Datastream description must be at most 40 characters"),
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
      40,
      "Datastream unit of measurement name must be at most 40 characters"
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

export const update_password_validationSchema = yup.object().shape({
  //  min 8 characters, 1 uppercase, one special character
  new_password: yup
    .string()
    .required("New password is required")
    .min(8, "New password must be at least 8 characters")
    .max(40, "New password must be at most 40 characters")
    // must have a capital letter
    .matches(/[A-Z]/, "New password must contain at least one capital letter")
    .matches(
      /[\W_]+/,
      "New password must contain at least one special character"
    ),
  confirm_password: yup
    .string()
    .required("Confirm password is required")
    .oneOf([yup.ref("new_password"), null], "Passwords must match"),
});
