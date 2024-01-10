import React, { useEffect, useState } from "react";
import DashboardComponent from "../components/DashboardComponent";
import { NOTFOUND } from "./404";
import {
  Breadcrumbs,
  TextField,
  Typography,
  Grid,
  Button,
  MenuItem,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useKeycloak } from "@react-keycloak/web";
import axios from "axios";
import Swal from "sweetalert2";
import ReactGA from "react-ga4";
import { GAactionsContact } from "../utils/GA";

function Contact() {
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { keycloak } = useKeycloak();
  const [user, setUser] = useState({
    name: "",
    surname: "",
    email: "",
  });

  useEffect(() => {

    ReactGA.event({
      category: GAactionsContact.category,
      action: GAactionsContact.action,
      label: GAactionsContact.label,
    });

    setLoading(true);
    if (keycloak.authenticated) {
      keycloak.loadUserProfile().then((profile: any) => {
        setUser({
          name: profile.firstName,
          surname: profile.lastName,
          email: profile.email,
        });
        setLoading(false);
      });
    } else {
      setLoading(false);
      setError(true);
    }
  }, [keycloak]);

  const formik = useFormik({
    initialValues: {
      type: "",
      subject: "",
      details: "",
      email: "",
      name: "",
      surname: "",
    },
    validationSchema: Yup.object({
      type: Yup.string().required("Required"),
      subject: Yup.string().required("Required").max(50, "Max 50 characters"),
      details: Yup.string().required("Required").max(500, "Max 500 characters"),
    }),
    onSubmit: async (values: any) => {
      formik.resetForm();
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/send_email/contact`,
          {
            type: values.type,
            subject: values.subject,
            details: values.details,
            email: user.email,
            first_name: user.name,
            last_name: user.surname,
          }
        );

        if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Your message has been sent!",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong! Messagen not sent!",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong! Messagen not sent!",
        });
      }
    },
  });
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
            <Typography color="text.primary">Landing Page</Typography>
            <Typography color="text.primary">Contact</Typography>
          </Breadcrumbs>
          <Typography
            variant="h4"
            style={{
              textAlign: "center",
              marginBottom: "30px",
            }}
          >
            Question Form
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  label="Type"
                  variant="outlined"
                  error={formik.touched.type && Boolean(formik.errors.type)}
                  helperText={formik.touched.type && formik.errors.type}
                >
                  <MenuItem value={"Incident"}>Incident</MenuItem>
                  <MenuItem value={"General Question"}>
                    {" "}
                    General Question
                  </MenuItem>
                </TextField>
              </Grid>{" "}
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="subject"
                  name="subject"
                  label="Subject"
                  fullWidth
                  value={formik.values.subject}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.subject && Boolean(formik.errors.subject)
                  }
                  helperText={formik.touched.subject && formik.errors.subject}
                />
              </Grid>{" "}
              <Grid item xs={12} sm={12}>
                <TextField
                  required
                  id="details"
                  name="details"
                  label="Details"
                  fullWidth
                  multiline
                  rows={4}
                  value={formik.values.details}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.details && Boolean(formik.errors.details)
                  }
                  helperText={formik.touched.details && formik.errors.details}
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
              Submit
            </Button>
          </form>
        </>
      )}
    </DashboardComponent>
  );
}

export default Contact;
