import LinkCustom from "../components/LinkCustom";
import { ToastContainer, toast } from "react-toastify";
import { useKeycloak } from "@react-keycloak/web";
import { useEffect, useState } from "react";
import Dashboard from "../components/DashboardComponent";
import { Accordion, AccordionDetails, AccordionSummary, Box, Breadcrumbs, Button, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
  const pendingRequests = [
    { username: "John Doe", email: "john.doe@xyz.com" },
    { username: "Jane Smith", email: "jane.smith@xyz.com" },
  ];

  const currentMembers = [
    { username: "Alice Johnson", email: "alice.j@xyz.com" },
    { username: "Bob Smith", email: "bob.smith@xyz.com" },
  ];

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
          <Grid sx={{mt:2}}>
          <Box sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Groups
      </Typography>
      <Accordion>
      {/* Accordion Header */}
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="join-group-content"
        id="join-group-header"
      >
        <Typography variant="h6">Join Group:</Typography>
      </AccordionSummary>

      {/* Accordion Details */}
      <AccordionDetails>
        <Typography variant="body1" gutterBottom>
          List of Groups:
        </Typography>

        {/* Group List */}
        {groups.map((group, index) => (
  <Box
    key={index}
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 2,
      padding: 1,
      border: "1px solid #ccc",
      borderRadius: "4px",
      backgroundColor: "#f9f9f9",
    }}
  >
    {/* Group Details */}
    <Typography variant="body2" sx={{ flex: 1, marginRight: 2 }}>
      {group.email} - {group.type}
    </Typography>

    {/* Buttons */}
    <Button
      variant="outlined"
      size="small"
      color="primary"
      onClick={() => console.log("Join button clicked")}
      sx={{ marginRight: 1 }}
    >
      Join
    </Button>
    <Button
      variant="outlined"
      size="small"
      color="secondary"
      onClick={() => console.log("Leave button clicked")}
      sx={{ marginRight: 1 }}
    >
      Leave
    </Button>
    <Button
      variant="outlined"
      size="small"
      color="info"
      onClick={() => console.log("Configure button clicked")}
    >
      Select
    </Button>
  </Box>
))}
      </AccordionDetails>
    </Accordion>
      <Typography variant="h6" sx={{ marginTop: 2 }}>
        Manage My Group:
      </Typography>

      <Accordion sx={{ marginTop: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2-content" id="panel2-header">
          Pending Requests:
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table size="small" aria-label="pending requests table">
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingRequests.map((request, index) => (
                  <TableRow key={index}>
                    <TableCell>{request.username}</TableCell>
                    <TableCell>{request.email}</TableCell>
                    <TableCell>
                      <Button variant="outlined" size="small" sx={{ marginRight: 1 }}>
                        Approve
                      </Button>
                      <Button variant="outlined" size="small">
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ marginTop: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel3-content" id="panel3-header">
          Current Members:
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table size="small" aria-label="current members table">
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentMembers.map((member, index) => (
                  <TableRow key={index}>
                    <TableCell>{member.username}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Button variant="outlined" size="small">
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    </Box>
          </Grid>
        </>
      )}
    </Dashboard>
  );
}
