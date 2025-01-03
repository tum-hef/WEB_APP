import LinkCustom from "../components/LinkCustom";
import { ToastContainer, toast } from "react-toastify";
import { useKeycloak } from "@react-keycloak/web";
import { useEffect, useState } from "react";
import Dashboard from "../components/DashboardComponent";
import { Breadcrumbs, Button, Grid, Typography } from "@mui/material";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";

export default function ListClients() {
  const [userID, setUserID] = useState<string | null>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const message = searchParams.get("message");

  useEffect(() => {
    const fetchData = async () => {
      if (message === "no_group") {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "You have not selected a group. Please select a group first.",
        });
      }
      if (keycloak && userInfo && userInfo.sub) {
        setUserID(userInfo.sub);

        if (userID) {
          try {
            const response = await axios.get(
              `${process.env.REACT_APP_BACKEND_URL}/get_clients?user_id=${userID}`
            );

            if (response.status === 200 && response.data.groups) {
              setGroups(response.data.groups);
              setLoading(false);
            } else if (response.status === 404 && response.data.message) {
              toast.error(response.data.message);
              setLoading(false);
            } else {
              toast.error("Error fetching clients");
              setLoading(false);
            }
          } catch (error) {
            toast.error("An error occurred while fetching clients.");
            console.log(error);
            setLoading(false);
          }
        }
      }
    };

    fetchData();
  }, [keycloak, userInfo, userID, message]);

  return (
    <Dashboard>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      {loading ? (
        <Typography variant="h4" align="center" gutterBottom>
          Loading...
        </Typography>
      ) : (
        <>
          <Breadcrumbs
            aria-label="breadcrumb"
            style={{
              marginBottom: "10px",
            }}
          >
            <Typography color="text.primary">Landing Page</Typography>
          </Breadcrumbs>

          <Grid container spacing={2}>
            <Typography
              variant="h2"
              align="center"
              gutterBottom
              style={{
                color: "#233044",
              }}
            >
              Groups
            </Typography>

            {groups.map((item, index) => (
              <Grid item xs={12} key={item.group_name}>
                <Grid container alignItems="center">
                  <Grid item xs={10}>
                    <Typography variant="h6" gutterBottom>
                      {item.attributes.group_name +
                        " - " +
                        item.attributes.group_type}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <LinkCustom to={`/dashboard/${item.id}`}>
                      <Button
                        variant="contained"
                        color="primary"
                        style={{ marginLeft: "auto" }}
                        onClick={() => {
                          localStorage.setItem("group_id", item.id);
                        }}
                      >
                        Select
                      </Button>
                    </LinkCustom>
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Dashboard>
  );
}
