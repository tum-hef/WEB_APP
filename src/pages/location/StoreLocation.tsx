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
import { useEffect, useState } from "react";
import { NOTFOUND } from "../404";
import axios from "axios";
import Swal from "sweetalert2";
import LinkCustom from "../../components/LinkCustom";
import { location_initial_values } from "../../formik/initial_values";
import { location_validationSchema } from "../../formik/validation_schema";

function StoreLocation() {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const token = keycloak?.token;

  const formik = useFormik({
    initialValues: location_initial_values,
    validationSchema: location_validationSchema,
    onSubmit: async (values: any) => {
      formik.resetForm();
      const isDev = process.env.REACT_APP_IS_DEVELOPMENT === "true";
      const api_url = isDev
        ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Locations`
        : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Locations`;

      try {
        const response = await axios.post(
          api_url,
          {
            name: values.location_name,
            description: values.location_description,
            encodingType: "application/vnd.geo+json",
            location: {
              type: "Point",
              coordinates: [parseFloat(values.longitude), parseFloat(values.latitude)],
            },
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
            text: "Location created successfully!",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong! Location not created!",
          });
        }
      } catch (error) {
        await axios.post(
          `http://localhost:4500/mutation_error_logs`,
          {
            keycloak_id: userInfo?.sub,
            method: "POST",
            attribute: "Locations",
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
          text: "Something went wrong! Location not created!",
        });
      }
    },
  });

  const fetchData = async () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL;
    const group_id = localStorage.getItem("group_id");
    const email =
      localStorage.getItem("selected_others") === "true"
        ? localStorage.getItem("user_email")
        : userInfo?.preferred_username;

    try {
      const response = await axios.post(
        `${backend_url}/frost-server`,
        { user_email: email, group_id: group_id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
    setLoading(false);
  }, []);

  return (
    <DashboardComponent>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <NOTFOUND />
      ) : (
        <>
          <Breadcrumbs
            aria-label="breadcrumb"
            style={{ marginBottom: "10px" }}
          >
            <Typography color="text.primary">Data Space</Typography>
            <LinkCustom color="inherit" to="/locations">
              <Typography color="text.primary">Locations</Typography>
            </LinkCustom>
            <Typography color="text.primary">Store</Typography>
          </Breadcrumbs>

          <Typography variant="h4" style={{ textAlign: "center" }}>
            Store Location
          </Typography>

          <form onSubmit={formik.handleSubmit}>
            <Typography variant="h6" gutterBottom>
              Location Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="location_name"
                  name="location_name"
                  label="Location Name"
                  fullWidth
                  value={formik.values.location_name}
                  onChange={formik.handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="location_description"
                  name="location_description"
                  label="Location Description"
                  fullWidth
                  value={formik.values.location_description}
                  onChange={formik.handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="latitude"
                  name="latitude"
                  label="Latitude"
                  fullWidth
                  value={formik.values.latitude}
                  onChange={formik.handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="longitude"
                  name="longitude"
                  label="Longitude"
                  fullWidth
                  value={formik.values.longitude}
                  onChange={formik.handleChange}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              style={{ marginTop: "10px", backgroundColor: "#233044" }}
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

export default StoreLocation;
