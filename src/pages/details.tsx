import { Paper } from "@material-ui/core";
import { Button, Divider, Grid, TextField, Typography } from "@mui/material";
import React from "react";
import Dashboard from "../components/DashboardComponent";
import { useKeycloak } from "@react-keycloak/web";
import { useFormik } from "formik";
import { update_password_initial_values } from "../formik/initial_values";
import { update_password_validationSchema } from "../formik/validation_schema";
import ReactLoading from "react-loading";
import axios from "axios";
import Swal from "sweetalert2";

function Details() {
  const { keycloak } = useKeycloak();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const userInfo = keycloak?.idTokenParsed;
  const formik = useFormik({
    initialValues: update_password_initial_values,
    validationSchema: update_password_validationSchema,

    onSubmit: async (values: any) => {
      formik.resetForm();
      try {
        setIsLoading(true);
        const response = await axios.post(
          `http://localhost:4500/reset_password`,
          {
            user_id: keycloak?.idTokenParsed?.sub,
            password: values.new_password,
          },

          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setIsLoading(false);

        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Password updated successfully!",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong! Password was not updated!",
          });
        }
      } catch (error) {
        setIsLoading(false);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong! Password was not updated!",
        });
      }
    },
  });
  return (
    <Dashboard>
      {/* ADd page in middle of page */}
      <form onSubmit={formik.handleSubmit}>
        <Paper
          style={{
            borderRadius: 10,
            padding: 20,
            textAlign: "center",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h1"
            style={{
              color: "#233044",
            }}
          >
            Account Details
          </Typography>
          {isLoading ? (
            <Grid container justifyContent="center" m={6}>
              <ReactLoading color="#233044" width={100} height={100} 
              type="spin"
              />
            </Grid>
          ) : (
            <Grid
              container
              spacing={3}
              style={{
                marginTop: 20,
                marginBottom: 20,
              }}
            >
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="name"
                  name="name"
                  label="Name"
                  fullWidth
                  autoComplete="given-name"
                  disabled
                  value={userInfo?.name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="email"
                  name="email"
                  label="Email"
                  fullWidth
                  autoComplete="email"
                  disabled
                  value={userInfo?.email}
                />
              </Grid>
              <Divider
                style={{
                  width: "100%",
                  marginTop: 20,
                  marginBottom: 20,
                }}
              />
              <Grid item xs={12} sm={12}>
                <Typography
                  variant="h4"
                  style={{
                    color: "#233044",
                    marginTop: 20,
                    marginBottom: 20,
                  }}
                >
                  Change Password
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="new_password"
                  name="new_password"
                  label="New Password"
                  type="password"
                  fullWidth
                  value={formik.values.new_password}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.new_password &&
                    Boolean(formik.errors.new_password)
                  }
                  helperText={
                    formik.touched.new_password && formik.errors.new_password
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="confirm_password"
                  name="confirm_password"
                  label="Confirm Password"
                  fullWidth
                  type="password"
                  value={formik.values.confirm_password}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.confirm_password &&
                    Boolean(formik.errors.confirm_password)
                  }
                  helperText={
                    formik.touched.confirm_password &&
                    formik.errors.confirm_password
                  }
                />
              </Grid>
              {/* submit button */}
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
                Update
              </Button>
            </Grid>
          )}
        </Paper>
      </form>
    </Dashboard>
  );
}

export default Details;
