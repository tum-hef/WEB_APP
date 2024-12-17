import React, { useCallback } from "react";
import { Link, Redirect, useLocation } from "react-router-dom";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useKeycloak } from "@react-keycloak/web";
import * as yup from "yup";
import { Alert } from "@mui/material";
import axios from "axios";
import Swal from "sweetalert2";

function Register() {
  const { keycloak } = useKeycloak();

  const login = useCallback(() => {
    keycloak?.login();
  }, [keycloak]);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      // password: "",
      // passwordConfirmation: "",
    },
    validationSchema: yup.object({
      firstName: yup.string().required("First Name is required"),
      lastName: yup.string().required("Last Name is required"),
      email: yup
        .string()
        .email("Invalid email address")
        .required("Email is required")
        // .matches(
        //   /^([a-zA-Z0-9_\-\.]+)@tum\.de$/,
        //   "Email must be a TUM email address"
        // ),
      // password: yup
      //   .string()
      //   .required("Password is required")
      //   .min(8, "Password must be at least 8 characters"),
      // passwordConfirmation: yup
      //   .string()
      //   .required("Password Confirmation is required")
      //   .min(8, "Password must be at least 8 characters")
      //   .oneOf([yup.ref("password"), null], "Passwords must match"),
    }),
    onSubmit: async (values) => {
      formik.resetForm();
    
      if (!process.env.REACT_APP_BACKEND_URL) {
        Swal.fire("Error", "Problem with credentials", "error");
        return;
      }
    
      try {
        console.log("url", `${process.env.REACT_APP_BACKEND_URL}/register`);
        await axios
          .post(`${process.env.REACT_APP_BACKEND_URL}/register`, {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
          })
          .then((response) => {
            if (response.status === 200) {
              Swal.fire(
                "Good job!",
                "Please check your email to verify and to access your account",
                "success"
              );
            } else {
              Swal.fire("Error", "Unexpected response from server", "error");
            }
          })
          .catch((error) => {
            if (!error.response) {
              Swal.fire("Error", "Network error. Please try again.", "error");
              return;
            }
    
            const { status, data } = error.response;
    
            // Handle specific backend error responses
            if (status === 403 && data.error === "Email not found in TUM database") {
              Swal.fire("Error", "The provided email does not exist in the TUM database.", "error");
            } else if (status === 504 && data.error === "LDAP script execution timed out") {
              Swal.fire(
                "Error",
                "The verification process timed out. Please try again later.",
                "error"
              );
            } else if (status === 500 && data.error === "Failed to connect to the database") {
              Swal.fire(
                "Error",
                "Server encountered an issue connecting to the database. Please try again.",
                "error"
              );
            } else if (status === 400 && data.code === "A00001") {
              Swal.fire("Error", data.error || "Already registered but not verified.", "error");
            } else if (status === 400 && data.code === "A00002") {
              Swal.fire("Error", data.error || "Verification email resent.", "error");
            } else if (status === 400 && data.code === "A00003") {
              Swal.fire("Error", data.error || "You are already registered and verified.", "error");
            } else {
              Swal.fire("Error", data.error || "An unexpected error occurred. Please try again.", "error");
            }
          });
      } catch (error) {
        Swal.fire("Error", "An unexpected error occurred. Please try again.", "error");
      }
    },
    
  });
  const location = useLocation<{ [key: string]: unknown }>();
  const currentLocationState = location.state || {
    from: { pathname: "/dashboard" },
  };

  const theme = createTheme();

  if (keycloak?.authenticated) {
    console.log("Logged out");
    return <Redirect to={currentLocationState?.from as string} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>

          <Box
            component="form"
            noValidate
            onSubmit={formik.handleSubmit}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.firstName && Boolean(formik.errors.firstName)
                  }
                  helperText={
                    formik.touched.firstName && formik.errors.firstName
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.lastName && Boolean(formik.errors.lastName)
                  }
                  helperText={formik.touched.lastName && formik.errors.lastName}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>
              {/* <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  helperText={formik.touched.password && formik.errors.password}
                />
              </Grid>{" "}
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="passwordConfirmation"
                  label="Password Confirmation"
                  type="password"
                  id="passwordConfirmation"
                  autoComplete="new-password"
                  value={formik.values.passwordConfirmation}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.passwordConfirmation &&
                    Boolean(formik.errors.passwordConfirmation)
                  }
                  helperText={
                    formik.touched.passwordConfirmation &&
                    formik.errors.passwordConfirmation
                  }
                />
              </Grid> */}
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Button onClick={login}>Already have an account?</Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default Register;
