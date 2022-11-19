import * as yup from "yup";

export const devoice_validationSchema = yup.object().shape({
    application_ID: yup.string().required("Required"),
    device_ID: yup.string().required("Required"),
    AppEUI: yup.string().required("Required").min(16, "Must be 16 characters").max(16, "Must be 16 characters"),
    DevEUI: yup.string().required("Required").min(16, "Must be 16 characters").max(16, "Must be 16 characters"),
    AppKey: yup.string().required("Required").min(32, "Must be 32 characters").max(32, "Must be 32 characters"),
    type: yup.string().required("Required"),
    format: yup.string().required("Required"),
    function_file: yup.string().required("Required"),
    activation_method: yup.string().required("Required"),
    lorawan_version: yup.string().required("Required"),
});
