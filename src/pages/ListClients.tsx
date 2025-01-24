import LinkCustom from "../components/LinkCustom";
import { ToastContainer, toast } from "react-toastify";
import { useKeycloak } from "@react-keycloak/web";
import { useEffect, useState } from "react";
import Dashboard from "../components/DashboardComponent";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Breadcrumbs,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function ListClients() {
  const [userID, setUserID] = useState<string | null>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [joinNewGroups, setJoinNewGroups] = useState<any[]>([]);
  const [myGroups, setMyGroups] = useState<any[]>([]);
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
              console.log("response.data.groups",response.data.groups)
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

  useEffect(() => {
    getAllGroups();
  }, [userID]);

  const getAllGroups = async () => {
    if (userID) {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/groups?email=${userInfo?.email}`
        );
        console.log("(response?.data?.join_new_grou",response?.data?.join_new_group)
        setJoinNewGroups(response?.data?.join_new_group);
        setMyGroups(response?.data?.my_groups);
      } catch (error) {
        toast.error("Failed to fetch groups.");
        console.error(error);
      }
    }
  };

  const handleAction = (action: string, userId: any) => {
    let data = {"membership_id":userId, "action":action}
    Swal.fire({
      title: `Are you sure you want to ${action} this request?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/manage_membership`,
            data
          );
          Swal.fire("Success", response.data.message, "success");
          getAllGroups();
        } catch (error:any) {
          Swal.fire(
            "Error",
            error?.response?.data?.message || "An error occurred.",
            "error"
          );
        }
      }
    });
  };

  const joinGroup = async (group_id: any) => {
    if (!group_id) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Group",
        text: "Please select a valid group to join.",
      });
      return;
    }

    try {
      const data = {
        user_email: userInfo?.email,
        group_id,
      };
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/join_group`,
        data
      );
      Swal.fire({
        icon: "success",
        title: "Join Request Sent",
        text: response?.data?.message || "Your request to join the group was successful!",
      });
      getAllGroups();
    } catch (error: any) {
      console.error("Error joining group:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to join the group. Please try again later.",
      });
    }
  };

  const handleLeaveGroup = async (groupId: number ,userEmail:any , remove_admin:boolean) => {
    Swal.fire({
      title:remove_admin ? "Are you sure you want to remove this member ?" : "Are you sure you want to leave this group ?" ,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/leave_group`,
            {
              user_email: userEmail,
              group_id: groupId,
            }
          );
          Swal.fire("Success", response.data.message, "success");
          getAllGroups();
        } catch (error:any) {
          Swal.fire(
            "Error",
            error.response?.data?.message || "An error occurred.",
            "error"
          );
        }
      }
    });
  };

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

            {groups?.length > 0 ? (
              groups?.filter((x:any)=>{return x?.attributes?.group_name[0] == userInfo?.email}).map((item, index) => (
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
                          onClick={() => {
                            localStorage.setItem("group_id", item.id);
                            localStorage.setItem("selected_others","false")
                            localStorage.removeItem("user_email")
                          }}
                        >
                          Select
                        </Button>
                      </LinkCustom>
                    </Grid>
                  </Grid>
                </Grid>
              ))
            ) : (
              <Typography>No groups available.</Typography>
            )}
          </Grid>

          <Box sx={{ padding: 2 }}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="join-group-content"
                id="join-group-header"
              >
                <Typography variant="h6">Join Group:</Typography>
              </AccordionSummary>
              <AccordionDetails>
  {joinNewGroups.length === 0 ? (
    <Typography>No groups available to join.</Typography>
  ) : (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Group ID</TableCell>
            <TableCell>Group Owner Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {joinNewGroups.map((group, index) => (
            <TableRow key={group.id || index}>
              <TableCell>{group.keycloak_group_id}</TableCell>
              <TableCell>{group?.firstName + " " + group?.lastName}</TableCell>
              <TableCell>{group.owner_email}</TableCell>
              <TableCell align="center">
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  disabled={group?.status === "pending" || group?.status === "approved"}
                  onClick={() => joinGroup(group?.id)}
                  sx={{ marginRight: 1 }}
                >
                  Join
                </Button>

                <Button
                  variant="contained"
                  size="small"
                  color="error"
                  onClick={() => handleLeaveGroup(group?.id, userInfo?.email ,false)}
                  disabled={
                    group?.status === "pending" || !group?.status || group?.status === "rejected" || group?.status =="left"
                  }
                  sx={{ marginRight: 1 }}
                >
                  Leave
                </Button>

                <LinkCustom to={`/dashboard/${group?.keycloak_group_id}?other_group=true`}>
                  <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    onClick={() => {
                      localStorage.setItem("group_id", group?.keycloak_group_id);
                      localStorage.setItem("selected_others","true")
                      localStorage.setItem("user_email",group?.owner_email)
                    }}
                    disabled={
                      group?.status === "pending" || !group?.status || group?.status === "rejected" ||  group?.status =="left"
                    }
                  >
                    Select
                  </Button>
                </LinkCustom>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )}
</AccordionDetails>

            </Accordion>

            <Accordion sx={{ marginTop: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2-content"
                id="panel2-header"
              >
                <Typography>Pending Requests:</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {myGroups.length === 0 ? (
                  <Typography>No pending requests.</Typography>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Username</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {myGroups
                          .filter((x: any) => x?.status === "pending")
                          .map((request, index) => (
                            <TableRow key={index}>
                              <TableCell>{
                                request?.firstName + " " + request?.lastName
                              }</TableCell>
                              <TableCell>{request.email}</TableCell>
                              <TableCell>
                                <Button
                                  variant="contained"
                                  size="small"
                                  sx={{ marginRight: 1 }}
                                  onClick={() => handleAction("approve", request.membership_id

)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="contained"
                                  size="small"
                                  color="error"
                                  onClick={() => handleAction("reject", request.membership_id)}
                                >
                                  Reject
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </AccordionDetails>
            </Accordion>
            <Accordion sx={{ marginTop: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2-content"
                id="panel2-header"
              >
                <Typography>Current Members:</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {myGroups?.filter((x:any)=> {return x?.status == "approved"}).length === 0 ? (
                  <Typography>No pending requests.</Typography>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Username</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {myGroups
                          .filter((x: any) => x?.status === "approved")
                          .map((request, index) => (
                            <TableRow key={index}>
                              <TableCell>{
                                request?.firstName + " " + request?.lastName
                              }</TableCell>
                              <TableCell>{request.email}</TableCell>
                              <TableCell>
              
                                <Button
                                  variant="contained"
                                  size="small"
                                  color="error"
                                  onClick={() => handleLeaveGroup(request?.id, request.email ,true)}
                                >
                                  Remove Member
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </AccordionDetails>
            </Accordion>
          </Box>
        </>
      )}
    </Dashboard>
  );
}
