import {
  Breadcrumbs,
  Button,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { useFormik } from "formik";
import DashboardComponent from "../../components/DashboardComponent";
import { device_initial_values } from "../../formik/initial_values";
import { device_validationSchema } from "../../formik/validation_schema";
import React, { useEffect, useState } from "react";
import { NOTFOUND } from "../404";
import axios from "axios";
import LinkCustom from "../../components/LinkCustom";

import Swal from "sweetalert2";
function StoreDevice() {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const formik = useFormik({
    initialValues: device_initial_values,
    validationSchema: device_validationSchema,
    onSubmit: async (values: any) => {
      formik.resetForm(); 
      const isDev = process.env.REACT_APP_IS_DEVELOPMENT === 'true';  
      try {
        const response = await axios.post(
          isDev ?  `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Things`  :    `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Things`,
          {
            name: values.device_name,
            description: values.device_description,
            Locations: [
              {
                name: values.location_name,
                description: values.location_description,
                encodingType: "application/vnd.geo+json",
                location: {
                  type: "Point",
                  coordinates: [
                    values.location_longitude,
                    values.location_latitude,
                  ],
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

        if (response.status === 201) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Device created successfully!",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong! Device not created!",
          });
        }
      } catch (error) {
        await axios.post(
          `http://localhost:4500/mutation_error_logs`,
          {
            keycloak_id: userInfo?.sub,
            method: "POST",
            attribute: "Devices",
            frost_port: frostServerPort,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${keycloak?.token}`,
            },
          }
        );
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong! Device not created!",
        });
      }
    },
  });
  const fetchData = async () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL;
    const email = userInfo?.preferred_username;

    try {
      const response = await axios.get(
        `${backend_url}/frost-server?email=${email}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 && response.data.PORT) {
        setFrostServerPort(response.data.PORT);
      } else {
        setError(true);
      }
    } catch (error) {
      setError(true);
    }
  };
  useEffect(() => {
    fetchData();
    if (frostServerPort) {
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [frostServerPort]);
  return (
    <DashboardComponent>
      {loading ? (
        <p>Loading</p>
      ) : error ? (
        <NOTFOUND />
      ) : (
        <>
          <Breadcrumbs
            aria-label="breadcrumb"
            style={{
              marginBottom: "10px",
            }}
          >
            <Typography color="text.primary">Data Space</Typography>
            <LinkCustom to="/devices">
              <Typography color="text.primary">Devices</Typography>
            </LinkCustom>
            <Typography color="text.primary">Store</Typography>
          </Breadcrumbs>
          <Typography
            variant="h4"
            style={{
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
                  name="device_name"
                  label="Device Name"
                  fullWidth
                  value={formik.values.device_name}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.device_name &&
                    Boolean(formik.errors.device_name)
                  }
                  helperText={
                    formik.touched.device_name && formik.errors.device_name
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="device_description"
                  name="device_description"
                  label="Device Description"
                  fullWidth
                  value={formik.values.device_description}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.device_description &&
                    Boolean(formik.errors.device_description)
                  }
                  helperText={
                    formik.touched.device_description &&
                    formik.errors.device_description
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
              Device Location
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <TextField
                  required
                  id="location_name"
                  name="location_name"
                  label="Location Name"
                  fullWidth
                  value={formik.values.location_name}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.location_name &&
                    Boolean(formik.errors.location_name)
                  }
                  helperText={
                    formik.touched.location_name && formik.errors.location_name
                  }
                />
              </Grid>{" "}
              <Grid item xs={12} sm={3}>
                <TextField
                  required
                  id="location_description"
                  name="location_description"
                  label="Location Description"
                  fullWidth
                  value={formik.values.location_description}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.location_description &&
                    Boolean(formik.errors.location_description)
                  }
                  helperText={
                    formik.touched.location_description &&
                    formik.errors.location_description
                  }
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  required
                  id="location_latitude"
                  name="location_latitude"
                  label="Location Latitude"
                  fullWidth
                  value={formik.values.location_latitude}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.location_latitude &&
                    Boolean(formik.errors.location_latitude)
                  }
                  helperText={
                    formik.touched.location_latitude &&
                    formik.errors.location_latitude
                  }
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  required
                  id="location_longitude"
                  name="location_longitude"
                  label="Location Longitude"
                  fullWidth
                  value={formik.values.location_longitude}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.location_longitude &&
                    Boolean(formik.errors.location_longitude)
                  }
                  helperText={
                    formik.touched.location_longitude &&
                    formik.errors.location_longitude
                  }
                />
              </Grid>{" "}
            </Grid>{" "}
            <Button
              type="submit"
              style={{
                marginTop: "10px",
                backgroundColor: "#233044",
              }}
              fullWidth
              variant="contained"
              color="primary"
            >
              Store
            </Button>
          </form>
        </>
      )}
    </DashboardComponent>
  );
}
export default StoreDevice;
