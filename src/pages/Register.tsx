import React, { useCallback, useState } from "react";
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
import { CircularProgress } from '@mui/material';
import ReactLoading from "react-loading";

function Register() {
  const { keycloak } = useKeycloak(); 
  const [loading ,setLoading] = useState<Boolean>(false)

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
        await setLoading(true)
        await axios
          .post(`${process.env.REACT_APP_BACKEND_URL}/register`, {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
          })
          .then(async(response) => {
            if (response.status === 200) { 
              await setLoading(false)
              await   Swal.fire(
                "Good job!",
                "A verification email has been sent to your inbox. Please check it within the next 5 minutes to activate your account. If you don’t see it, be sure to check your spam folder!",
                "success"
              );
            } else { 
              await setLoading(false)
            await  Swal.fire("Error", "Unexpected response from server", "error");
            }
          })
          .catch(async(error) => {
            // Check if there is a response from the backend 
            if (error.response) {
              const { status, data } = error.response;
    
              if (status === 403 && data.error === "Email not found in TUM database") { 
                await setLoading(false)
                await Swal.fire("Error", data.error, "error");
              } else if (status === 504) {
                await setLoading(false)
               await Swal.fire(
                  "Error",
                  "The verification process timed out. Please try again later.",
                  "error"
                );
              } else if (status === 500) { 
                await setLoading(false)
               await Swal.fire(
                  "Error",
                  "Server encountered an internal error. Please try again later.",
                  "error"
                );
              } else if (status === 400 && data.error) { 
                await setLoading(false)
               await Swal.fire("Error", data.error, "error");
              } else {
                await setLoading(false)
                await Swal.fire("Error", "An unexpected error occurred. Please try again.", "error");
              }
            } else {
              // If no response (network or server down)
              await setLoading(false)
              await  Swal.fire("Error", "Network error. Please check your connection.", "error");
            }
          });
      } catch (error) { 
         setLoading(false)
         Swal.fire("Error", "An unexpected error occurred. Please try again.", "error");
      }
    }
    
    
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
          position: 'relative',  // Ensures the loader is positioned above the form
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>

        {/* Form */}
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
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
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
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
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
              <Button onClick={() => console.log("Redirect to login")}>Already have an account?</Button>
            </Grid>
          </Grid>
        </Box>

        {/* Show the loader when loading is true */}
        {loading && (
          <Box
            sx={{
              position: 'absolute',  // Position loader on top of form
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',  // Optional: add background overlay
              zIndex: 9999,  // Ensure it's above the form
              backdropFilter: 'blur(5px)',  // Optional: blur the background to give a dim effect
            }}
          >
            <CircularProgress size={50} color="primary" />  {/* MUI CircularProgress spinner */}
          </Box>
        )}
      </Box>
    </Container>
  </ThemeProvider>
  );
}

export default Register;

