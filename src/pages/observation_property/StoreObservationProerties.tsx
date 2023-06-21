import {
  Breadcrumbs,
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
import { useKeycloak } from "@react-keycloak/web";
import { useFormik } from "formik";
import DashboardComponent from "../../components/DashboardComponent";
import { observation_property_initial_values } from "../../formik/initial_values";
import { observation_property_validationSchema } from "../../formik/validation_schema";
import { useEffect, useState } from "react";
import { NOTFOUND } from "../404";
import axios from "axios";
import { Link } from "react-router-dom";
import LinkCustom from "../../components/LinkCustom";
import { toast } from "react-toastify";
import { t } from "i18next";
import Swal from "sweetalert2";
function StoreObservationProerties() {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const formik = useFormik({
    initialValues: observation_property_initial_values,
    validationSchema: observation_property_validationSchema,
    onSubmit: async (values: any) => {
      formik.resetForm();
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/ObservedProperties`,
          {
            name: values.name,
            description: values.description,
            definition: values.definition,
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
            text: "Observation Property created successfully!",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong! Observation Property not created!",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong! Observation Property not created!",
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
            <LinkCustom to="/observation_properties">
              <Typography color="text.primary">Observation Property</Typography>
            </LinkCustom>
            <Typography color="text.primary">Store</Typography>
          </Breadcrumbs>
          <Typography
            variant="h4"
            style={{
              textAlign: "center",
            }}
          >
            Store Observation Property
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <Typography variant="h6" gutterBottom>
              Observation Property Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  id="name"
                  name="name"
                  label="Name"
                  fullWidth
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  id="description"
                  name="description"
                  label="Description"
                  fullWidth
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.description &&
                    Boolean(formik.errors.description)
                  }
                  helperText={
                    formik.touched.description && formik.errors.description
                  }
                />
              </Grid>{" "}
              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  id="definition"
                  name="definition"
                  label="Definition"
                  fullWidth
                  value={formik.values.definition}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.definition &&
                    Boolean(formik.errors.definition)
                  }
                  helperText={
                    formik.touched.definition && formik.errors.definition
                  }
                />
              </Grid>
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
export default StoreObservationProerties;
