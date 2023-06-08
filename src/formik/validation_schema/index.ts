import * as yup from "yup";

export const devoice_validationSchema = yup.object().shape({
    device_name: yup.string().required("Device name is required").min(3, "Device name must be at least 3 characters").max(20, "Device name must be at most 20 characters"),
    device_description: yup.string().required("Device description is required").min(3, "Device description must be at least 3 characters").max(30, "Device description must be at most 30 characters"),
    location_name: yup.string().required("Location name is required").min(3, "Location name must be at least 3 characters").max(20, "Location name must be at most 20 characters"),
    location_description: yup.string().required("Location description is required").min(3, "Location description must be at least 3 characters").max(30, "Location description must be at most 30 characters"),
    location_longitude: yup
    .string()
    .required("Location longitude is required")
    .matches(
      /^-?\d+(\.\d+)?$/,
      "Location longitude must be a float format"
    ),
    location_latitude: yup
    .string()
    .required("Location latitude is required")
    .matches(
        /^-?\d+(\.\d+)?$/,
        "Location latitude must be a float format"
    ),

});

export const sensor_validationSchema = yup.object().shape({
    sensor_name: yup.string().required("Sensor name is required").min(3, "Sensor name must be at least 3 characters").max(20, "Sensor name must be at most 20 characters"),
    sensor_description: yup.string().required("Sensor description is required").min(3, "Sensor description must be at least 3 characters").max(30, "Sensor description must be at most 30 characters"),
    sensor_metadata: yup.string().required("Sensor metadata is required").min(3, "Sensor metadata must be at least 3 characters").max(30, "Sensor metadata must be at most 30 characters"),
});

export const observation_property_validationSchema = yup.object().shape({
    name: yup.string().required("Observation property name is required").min(3, "Observation property name must be at least 3 characters").max(20, "Observation property name must be at most 20 characters"),
    description: yup.string().required("Observation property description is required").min(3, "Observation property description must be at least 3 characters").max(30, "Observation property description must be at most 30 characters"),
    definition: yup.string().required("Observation property definition is required").min(3, "Observation property definition must be at least 3 characters").max(30, "Observation property definition must be at most 30 characters"),
});