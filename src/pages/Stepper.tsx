import React, { useState } from "react";
import { Form, Formik } from "formik";
import Dashboard from "./Dashboard";
import {
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Grid,
  MenuItem,
  TextField,
  Button,
} from "@mui/material";

const steps = [
  "Store Device",
  "Store Sensor",
  "Store ObserveProperty",
  "Store Datastream",
];

const getValidationSchemaPerStep = (step: number) => {
  switch (step) {
    case 0:
      return null;
    case 1:
      return null;
    case 2:
      return null;
  }
};

function StepperStore() {
  const [activeStep, setActiveStep] = useState(0);
  const isLastStep = activeStep === steps.length - 1;

  return (
    <>
      <Dashboard>
        <Formik
          initialValues={{
            // First Step
            device_name: "",
            device_description: "",
            device_location_name: "",
            device_encodingType: "",
            device_location_description: "",
            device_latitude: "",
            device_longitude: "",
            device_type: "",

            // Second Step
            sensor_name: "",
            sensor_encodingType: "",
            sensor_metadata: "",
            sensor_description: "",

            // Third Step
            observeProperty_name: "",
            observeProperty_definition: "",
            observeProperty_description: "",

            // Fourth Step
            datastream_name: "",
            datastream_unit_of_measurement_name: "",
            datastream_unit_of_measurement_symbol: "",
            datastream_unit_of_measurement_definition: "",
            datastream_device_id: "",
            datastram_description: "",
            datastream_sensor_id: "",
            datastream_observedProperty_id: "",
            datasteam_observation_type: "",
          }}
          validationSchema={getValidationSchemaPerStep(activeStep)}
          onSubmit={async (values: any, helpers: any) => {
            if (isLastStep) {
              helpers.resetForm();
              setActiveStep(0);
              console.log(values);
            } else {
              setActiveStep((s) => s + 1);
            }
            helpers.setSubmitting(false);
          }}
        >
          {({ isSubmitting, errors, touched, handleChange, values }) => (
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
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Device Description"
                      name="device_description"
                      onChange={handleChange}
                      value={values.device_description}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Device Location"
                      name="devicelocation_name"
                      onChange={handleChange}
                      value={values.device_location_name}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Encoding Type"
                      name="device_encodingType"
                      onChange={handleChange}
                      value={values.device_encodingType}
                      variant="outlined"
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
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Type"
                      name="device_type"
                      onChange={handleChange}
                      value={values.device_type}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              )}
              {activeStep === 1 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Sensor Name"
                      name="sensor_name"
                      onChange={handleChange}
                      value={values.sensor_name}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Encoding Type"
                      name="sensor_encodingType"
                      onChange={handleChange}
                      value={values.sensor_encodingType}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Metadata"
                      name="sensor_metadata"
                      onChange={handleChange}
                      value={values.sensor_metadata}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="sensor_description"
                      onChange={handleChange}
                      value={values.sensor_description}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              )}
              {activeStep === 2 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="observeProperty_name"
                      onChange={handleChange}
                      value={values.observeProperty_name}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Definition"
                      name="observeProperty_definition"
                      onChange={handleChange}
                      value={values.observeProperty_definition}
                      variant="outlined"
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
                    />
                  </Grid>
                </Grid>
              )}
              {activeStep === 3 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="datastream_name"
                      onChange={handleChange}
                      value={values.datastream_name}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="datastream_unit_of_measurement_name"
                      label="Unit of Measurement Name"
                      onChange={handleChange}
                      value={values.datastream_unit_of_measurement_name}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="datastream_unit_of_measurement_symbol"
                      label="Unit of Measurement Symbol"
                      onChange={handleChange}
                      value={values.datastream_unit_of_measurement_symbol}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="datastream_unit_of_measurement_definition"
                      label="Unit of Measurement Definition"
                      onChange={handleChange}
                      value={values.datastream_unit_of_measurement_definition}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="datastream_device_id"
                      label="Device ID"
                      onChange={handleChange}
                      value={values.datastream_device_id}
                      variant="outlined"
                      select
                    >
                      <MenuItem value="1">Device 1</MenuItem>
                      <MenuItem value="2">Device 2</MenuItem>
                      <MenuItem value="3">Device 3</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="datastram_description"
                      label="Datastream Description"
                      onChange={handleChange}
                      value={values.datastram_description}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="datastream_sensor_id"
                      onChange={handleChange}
                      value={values.datastream_sensor_id}
                      select
                      label="Sensor ID"
                      variant="outlined"
                    >
                      <MenuItem value="1">Sensor 1</MenuItem>
                      <MenuItem value="2">Sensor 2</MenuItem>
                      <MenuItem value="3">Sensor 3</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="datastream_observedProperty_id"
                      select
                      label="Observed Property ID"
                      onChange={handleChange}
                      value={values.datastream_observedProperty_id}
                      variant="outlined"
                    >
                      <MenuItem value="1">Temperature</MenuItem>
                      <MenuItem value="2">Humidity</MenuItem>
                      <MenuItem value="3">Pressure</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="datasteam_observation_type"
                      label="Observation Type"
                      onChange={handleChange}
                      value={values.datasteam_observation_type}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              )}
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
          )}
        </Formik>
      </Dashboard>
    </>
  );
}

export default StepperStore;
