import {
  Breadcrumbs,
  Button,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { useFormik } from "formik";
import DashboardComponent from "../../components/DashboardComponent";
import { sensor_initial_values } from "../../formik/initial_values";
import { sensor_validationSchema } from "../../formik/validation_schema";
import { useEffect, useState } from "react";
import { NOTFOUND } from "../404";
import axios from "axios";
import Swal from "sweetalert2";
import LinkCustom from "../../components/LinkCustom";
function StoreSensor() {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const formik = useFormik({
    initialValues: sensor_initial_values,
    validationSchema: sensor_validationSchema,
    onSubmit: async (values: any) => {
      formik.resetForm();
      const isDev = process.env.REACT_APP_IS_DEVELOPMENT === 'true';  
      try {
        const response = await axios.post(
          isDev ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Sensors`  :   `$https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Sensors`,
          {
            name: values.sensor_name,
            description: values.sensor_description,
            metadata: values.sensor_metadata,
            encodingType: "application/pdf",
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
            text: "Sensor created successfully!",
          });
        } else {
          alert("1");
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong! Sensor not created!",
          });
        }
      } catch (error) {
        await axios.post(
          `http://localhost:4500/mutation_error_logs`,
          {
            keycloak_id: userInfo?.sub,
            method: "POST",
            attribute: "Sensors",
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
          text: "Something went wrong! Sensor not created!",
        });
      }
    },
  });
  const fetchData = async () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL;
    const email =
    localStorage.getItem("selected_others") === "true"
      ? localStorage.getItem("user_email")
      : userInfo?.preferred_username;


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
            <LinkCustom color="inherit" to="/sensors">
              <Typography color="text.primary">Sensor Types</Typography>
            </LinkCustom>
            <Typography color="text.primary">Store</Typography>
          </Breadcrumbs>
          <Typography
            variant="h4"
            style={{
              textAlign: "center",
            }}
          >
            Store Sensor Type
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <Typography variant="h6" gutterBottom>
              Sensor Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  id="Sensor ID"
                  name="sensor_name"
                  label="Sensor Name"
                  fullWidth
                  value={formik.values.sensor_name}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.sensor_name &&
                    Boolean(formik.errors.sensor_name)
                  }
                  helperText={
                    formik.touched.sensor_name && formik.errors.sensor_name
                  }
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  id="sensor_description"
                  name="sensor_description"
                  label="Sensor Description"
                  fullWidth
                  value={formik.values.sensor_description}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.sensor_description &&
                    Boolean(formik.errors.sensor_description)
                  }
                  helperText={
                    formik.touched.sensor_description &&
                    formik.errors.sensor_description
                  }
                />
              </Grid>{" "}
              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  id="sensor_metadata"
                  name="sensor_metadata"
                  label="Sensor Metadata"
                  fullWidth
                  value={formik.values.sensor_metadata}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.sensor_metadata &&
                    Boolean(formik.errors.sensor_metadata)
                  }
                  helperText={
                    formik.touched.sensor_metadata &&
                    formik.errors.sensor_metadata
                  }
                />
              </Grid>
            </Grid>

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
export default StoreSensor;
