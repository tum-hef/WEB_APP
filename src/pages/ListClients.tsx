import LinkCustom from "../components/LinkCustom";
import { ToastContainer, toast } from "react-toastify";
import Stats from "../components/Stats";
import { useKeycloak } from "@react-keycloak/web";
import styled from "styled-components";
import { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import {
  Box,
  Button,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import CommentIcon from "@mui/icons-material/Comment";
import { use } from "i18next";
import axios from "axios";

export default function ListClients() {
  const [userID, setUserID] = useState<string | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;

  const items = ["Item 1", "Item 2", "Item 3", "Item 4"];
  useEffect(() => {
    const fetchData = async () => {
      if (keycloak && userInfo && userInfo.sub) {
        setUserID(userInfo.sub);

        try {
          const response = await axios.get(
            `http://138.246.237.35:4500/get_clients?user_id=${userInfo.sub}`
          );

          if (response.status === 200 && response.data.clients) {
            setClients(response.data.clients);
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
    };

    fetchData();
  }, [keycloak, userInfo]);

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
            Clients
          </Typography>
          {clients.map((item, index) => (
            <Grid item xs={12} key={item.client_id}>
              <Grid container alignItems="center">
                <Grid item xs={10}>
                  <Typography variant="h6" gutterBottom>
                    {item.client_id}
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ marginLeft: "auto" }}
                  >
                    Button
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
      )}
    </Dashboard>
  );
}
