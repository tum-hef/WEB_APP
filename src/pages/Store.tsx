import React from "react";
import ContentBar from "../components/ContentBar";
import {
  Button,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import { device_initial_values } from "../formik/initial_values";
import { devoice_validationSchema } from "../formik/validation_schema";
import { useFormik } from "formik";
import Dashboard from "./Dashboard";

function Store() {
  const formik = useFormik({
    initialValues: device_initial_values,
    validationSchema: devoice_validationSchema,
    onSubmit: async (values: any) => {
      console.log(values);
    },
  });
  return (
    <>
      <Dashboard>
        <Typography
          variant="h4"
          style={{
            // add text center
            textAlign: "center",
          }}
        >
          Store Device
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Device Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="Device ID"
                name="device_ID"
                label="Device ID"
                fullWidth
                value={formik.values.device_ID}
                onChange={formik.handleChange}
                error={
                  formik.touched.device_ID && Boolean(formik.errors.device_ID)
                }
                helperText={formik.touched.device_ID && formik.errors.device_ID}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="application_ID"
                name="application_ID"
                label="Application ID"
                fullWidth
                value={formik.values.application_ID}
                onChange={formik.handleChange}
                error={
                  formik.touched.application_ID &&
                  Boolean(formik.errors.application_ID)
                }
                helperText={
                  formik.touched.application_ID && formik.errors.application_ID
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
            TTNS Keys
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                id="AppEUI"
                name="AppEUI"
                label="AppEUI"
                fullWidth
                value={formik.values.AppEUI}
                onChange={formik.handleChange}
                error={formik.touched.AppEUI && Boolean(formik.errors.AppEUI)}
                helperText={formik.touched.AppEUI && formik.errors.AppEUI}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                id="DevEUI"
                name="DevEUI"
                label="DevEUI ID"
                fullWidth
                value={formik.values.DevEUI}
                onChange={formik.handleChange}
                error={formik.touched.DevEUI && Boolean(formik.errors.DevEUI)}
                helperText={formik.touched.DevEUI && formik.errors.DevEUI}
              />
            </Grid>{" "}
            <Grid item xs={12} sm={4}>
              <TextField
                required
                id="AppKey"
                name="AppKey"
                label="AppKey ID"
                fullWidth
                value={formik.values.AppKey}
                onChange={formik.handleChange}
                error={formik.touched.AppKey && Boolean(formik.errors.AppKey)}
                helperText={formik.touched.AppKey && formik.errors.AppKey}
              />
            </Grid>
          </Grid>{" "}
          <Divider
            style={{
              marginTop: "20px",
              marginBottom: "20px",
            }}
          />
          <Typography variant="h6" gutterBottom>
            Payload Function
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl
                fullWidth
                style={{
                  marginBottom: "1rem",
                }}
              >
                <InputLabel id="demo-simple-select-label">Type</InputLabel>
                <Select
                  required
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={formik.values.type}
                  label="Type"
                  name="type"
                  error={formik.touched.type && Boolean(formik.errors.type)}
                  onChange={(val) => {
                    formik.setFieldValue("type", val.target.value);
                  }}
                >
                  <MenuItem key={"decoder"} value={"decoder"}>
                    Decoder
                  </MenuItem>
                  <MenuItem key={"encoder"} value={"encoder"}>
                    Encoder
                  </MenuItem>
                </Select>
                {formik.touched.type && formik.errors.type && (
                  <FormHelperText
                    style={{
                      color: "red",
                    }}
                  >
                    Type is required
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl
                fullWidth
                style={{
                  marginBottom: "1rem",
                }}
              >
                <InputLabel id="demo-simple-select-label">Format</InputLabel>
                <Select
                  required
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={formik.values.format}
                  label="Format"
                  name="format"
                  error={formik.touched.format && Boolean(formik.errors.format)}
                  onChange={(val) => {
                    formik.setFieldValue("format", val.target.value);
                  }}
                >
                  <MenuItem
                    key={"FORMATTER_JAVASCRIPT"}
                    value={"FORMATTER_JAVASCRIPT"}
                  >
                    FORMATTER_JAVASCRIPT
                  </MenuItem>
                  <MenuItem
                    key={"FORMATTER_CAYENNELPP"}
                    value={"FORMATTER_CAYENNELPP"}
                  >
                    FORMATTER_CAYENNELPP
                  </MenuItem>{" "}
                  <MenuItem
                    key={"FORMATTER_DEVICEREPO"}
                    value={"FORMATTER_DEVICEREPO"}
                  >
                    FORMATTER_DEVICEREPO
                  </MenuItem>
                </Select>
                {formik.touched.type && formik.errors.type && (
                  <FormHelperText
                    style={{
                      color: "red",
                    }}
                  >
                    Format is required
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                id="function_file"
                name="function_file"
                label="Function File"
                fullWidth
                value={formik.values.function_file}
                onChange={formik.handleChange}
                error={
                  formik.touched.function_file &&
                  Boolean(formik.errors.function_file)
                }
                helperText={
                  formik.touched.function_file && formik.errors.function_file
                }
              />
            </Grid>
          </Grid>{" "}
          <Divider
            style={{
              marginTop: "20px",
              marginBottom: "20px",
            }}
          />
          <Typography variant="h6" gutterBottom>
            Lorawan Settings
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl
                fullWidth
                style={{
                  marginBottom: "1rem",
                }}
              >
                <InputLabel id="demo-simple-select-label">
                  Activation Method
                </InputLabel>
                <Select
                  required
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={formik.values.activation_method}
                  label="Activation Method"
                  name="activation_method"
                  error={
                    formik.touched.activation_method &&
                    Boolean(formik.errors.activation_method)
                  }
                  onChange={(val) => {
                    formik.setFieldValue("activation_method", val.target.value);
                  }}
                >
                  <MenuItem key={"OTAA"} value={"OTAA"}>
                    OTAA
                  </MenuItem>
                  <MenuItem key={"ABP"} value={"ABP"}>
                    ABP
                  </MenuItem>
                </Select>
                {formik.touched.activation_method &&
                  formik.errors.activation_method && (
                    <FormHelperText
                      style={{
                        color: "red",
                      }}
                    >
                      Activation Method is required
                    </FormHelperText>
                  )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl
                fullWidth
                style={{
                  marginBottom: "1rem",
                }}
              >
                <InputLabel id="demo-simple-select-label">
                  LoRaWAN Version
                </InputLabel>
                <Select
                  required
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={formik.values.lorawan_version}
                  label="LoRaWAN Version"
                  name="lorawan_version"
                  error={
                    formik.touched.lorawan_version &&
                    Boolean(formik.errors.lorawan_version)
                  }
                  onChange={(val) => {
                    formik.setFieldValue("lorawan_version", val.target.value);
                  }}
                >
                  <MenuItem key={"1.0.0"} value={"1.0.0"}>
                    1.0.0
                  </MenuItem>
                  <MenuItem key={"1.0.1"} value={"1.0.1"}>
                    1.0.1
                  </MenuItem>{" "}
                  <MenuItem key={"1.0.2"} value={"1.0.2"}>
                    1.0.2
                  </MenuItem>{" "}
                  <MenuItem key={"1.0.3"} value={"1.0.3"}>
                    1.0.3
                  </MenuItem>{" "}
                  <MenuItem key={"1.1.0"} value={"1.1.0"}>
                    1.1.0
                  </MenuItem>{" "}
                </Select>
                {formik.touched.lorawan_version &&
                  formik.errors.lorawan_version && (
                    <FormHelperText
                      style={{
                        color: "red",
                      }}
                    >
                      Lorawan Version is required
                    </FormHelperText>
                  )}
              </FormControl>
            </Grid>
          </Grid>
          <Button type="submit" fullWidth variant="contained" color="primary">
            Store
          </Button>
        </form>
      </Dashboard>
    </>
  );
}

export default Store;
