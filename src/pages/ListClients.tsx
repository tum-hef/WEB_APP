import LinkCustom from "../components/LinkCustom";
import { ToastContainer, toast } from "react-toastify";
import { useKeycloak } from "@react-keycloak/web";
import { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import { Button, Grid, Typography } from "@mui/material";
import axios from "axios";

export default function ListClients() {
  const [userID, setUserID] = useState<string | null>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;

  useEffect(() => {
    const fetchData = async () => {
      if (keycloak && userInfo && userInfo.sub) {
        setUserID(userInfo.sub);

        if (userID) {
          try {
            const response = await axios.get(
              `http://138.246.237.35:4500/get_clients?user_id=${userID}`
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
  }, [keycloak, userInfo, userID]);

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
                  <LinkCustom to={`/client`}>
                    <Button
                      variant="contained"
                      color="primary"
                      style={{ marginLeft: "auto" }}
                    >
                      View
                    </Button>
                  </LinkCustom>
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
      )}
    </Dashboard>
  );
}
