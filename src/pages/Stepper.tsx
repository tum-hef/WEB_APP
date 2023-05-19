import React, { useEffect, useState } from "react";
import { Form, Formik } from "formik";
import Dashboard from "../components/DashboardComponent";
import {
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Grid,
  MenuItem,
  TextField,
  Button,
  Typography,
  Breadcrumbs,
} from "@mui/material";
import axios from "axios";
import LinkCustom from "../components/LinkCustom";

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
  const fetchSensors = async () => {
    try {
      const response = await axios.get(
        "https://iot.hef.tum.de/frost/v1.0/Sensors"
      );
      console.log(response.data);
      setSensors(response.data.value);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchObserveProperties = async () => {
    try {
      const response = await axios.get(
        "https://iot.hef.tum.de/frost/v1.0/ObservedProperties"
      );
      console.log(response.data);
      setObserveProperties(response.data.value);
    } catch (error) {
      console.log(error);
    }
  };

  const [activeStep, setActiveStep] = useState(0);
  const isLastStep = activeStep === steps.length - 1;
  const [sensors, setSensors] = useState<any[]>([]);
  const [newSensor, setNewSensor] = useState(false);
  const [newObserveProperty, setNewObserveProperty] = useState(false);
  const [observeProperties, setObserveProperties] = useState<any[]>([]);

  useEffect(() => {
    fetchSensors();
    fetchObserveProperties();
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
            sensor_existing_id: "",
            sensor_name: "",
            sensor_metadata: "",
            sensor_description: "",

            // Third Step
            observeProperty_existing_id: "",
            observeProperty_name: "",
            observeProperty_definition: "",
            observeProperty_description: "",

            // Fourth Step
            datastream_name: "",
            datastram_description: "",
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
            <>
              <Breadcrumbs
                aria-label="breadcrumb"
                style={{
                  marginBottom: "10px",
                }}
              >
                <LinkCustom to="/">MUI</LinkCustom>
                <LinkCustom to="/material-ui/getting-started/installation/">
                  Core
                </LinkCustom>
                <Typography color="text.primary">Breadcrumbs</Typography>
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
                        name="device_location_name"
                        onChange={handleChange}
                        value={values.device_location_name}
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
                  </Grid>
                )}
                {activeStep === 1 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        select
                        fullWidth
                        label="New Sensor"
                        name="sensor_check"
                        value={newSensor ? "new" : "existing"}
                        onChange={(e) => {
                          const value = e.target.value;
                          setNewSensor(value === "new" ? true : false);
                          if (value === "existing") {
                            values.sensor_name = "";
                            values.sensor_description = "";
                            values.sensor_metadata = "";
                          } else if (value === "new") {
                            values.sensor_existing_id = "";
                          }
                        }}
                        variant="outlined"
                      >
                        <MenuItem value="new">New Sensor</MenuItem>
                        <MenuItem value="existing">Existing Sensor</MenuItem>
                      </TextField>
                    </Grid>
                    {!newSensor && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          select
                          fullWidth
                          label="Existing Sensor"
                          name="sensor_existing_id"
                          value={values.sensor_existing_id}
                          onChange={handleChange}
                          variant="outlined"
                        >
                          {sensors.map((sensor) => (
                            <MenuItem
                              key={sensor["@iot.id"]}
                              value={sensor["@iot.id"]}
                            >
                              {sensor["name"]}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    )}
                    {newSensor && (
                      <>
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
                      </>
                    )}
                  </Grid>
                )}
                {activeStep === 2 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        select
                        fullWidth
                        label="New Observed Property"
                        name="observeProperty_check"
                        value={newObserveProperty ? "new" : "existing"}
                        onChange={(e) => {
                          const value = e.target.value;
                          setNewObserveProperty(value === "new" ? true : false);
                          if (value === "existing") {
                            values.observeProperty_name = "";
                            values.observeProperty_definition = "";
                            values.observeProperty_description = "";
                          } else if (value === "new") {
                            values.observeProperty_existing_id = "";
                          }
                        }}
                        variant="outlined"
                      >
                        <MenuItem value="new">New Observed Property</MenuItem>
                        <MenuItem value="existing">
                          Existing Observed Property
                        </MenuItem>
                      </TextField>
                    </Grid>
                    {!newObserveProperty && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          select
                          fullWidth
                          label="Existing Observed Property"
                          name="observeProperty_existing_id"
                          value={values.observeProperty_existing_id}
                          onChange={handleChange}
                          variant="outlined"
                        >
                          {observeProperties.map((observeProperty) => (
                            <MenuItem
                              key={observeProperty["@iot.id"]}
                              value={observeProperty["@iot.id"]}
                            >
                              {observeProperty.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    )}

                    {newObserveProperty && (
                      <>
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
                      </>
                    )}
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
                        name="datastram_description"
                        label="Datastream Description"
                        onChange={handleChange}
                        value={values.datastram_description}
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
            </>
          )}
        </Formik>
      </Dashboard>
    </>
  );
}

export default StepperStore;
