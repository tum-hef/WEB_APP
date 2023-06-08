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
