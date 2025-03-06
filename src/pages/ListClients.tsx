import LinkCustom from "../components/LinkCustom";
import { ToastContainer, toast } from "react-toastify";
import { useKeycloak } from "@react-keycloak/web";
import { useEffect, useRef, useState } from "react";
import Dashboard from "../components/DashboardComponent";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Breadcrumbs,
  Button,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Popover,
  List,
  ListItem,
  ListItemText,
  Divider,
  ClickAwayListener
} from "@mui/material";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GroupIcon from "@mui/icons-material/Groups"; // View Members
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty"; // Pending Requests
import ExitToAppIcon from "@mui/icons-material/ExitToApp"; // Leave Group
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Approve Icon
import CancelIcon from "@mui/icons-material/Cancel"; // Reject Icon
import CloseIcon from "@mui/icons-material/Close"; // Close Popover Ico
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle"; // Remove Member Icon
import { useFormik } from "formik";
import * as Yup from "yup";

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
  const [anchorEl, setAnchorEl] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [anchorElPending, setAnchorElPending] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const popoverRef = useRef(null); // ✅ Store popover anchor in a ref
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const message = searchParams.get("message");
  const validationSchema = Yup.object({
    searchQuery: Yup.string()
      .length(32, "Search query must be exactly 32 characters")
      .required("Search is required"),
  });
  const formik = useFormik({
    initialValues: { searchQuery: "" },
    validationSchema,
    onSubmit: async (values) => {
      console.log("valassasues", values)
      if (values?.searchQuery) {
        await SearchGroupById(values?.searchQuery)
      }
    },
  });

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
              console.log("response.data.groups", response.data.groups)
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
        setMyGroups(response?.data?.filter((x: any) => { return x?.membership_status != "left" }));
      } catch (error) {
        toast.error("Failed to fetch project");
        console.error(error);
      }
    }
  };
  useEffect(() => {
    console.log("isPopoverOpen", isPopoverOpen)
  }, [isPopoverOpen])
  useEffect(() => {
    console.log("anchorEl", anchorEl)
  }, [anchorEl])
  const SearchGroupById = async (group_id: string) => {
    if (!group_id) {
      toast.error("Group ID is required.");
      return;
    }
  
    try {
      const token = keycloak?.token;
      if (!token) {
        throw new Error("No authentication token found.");
      }
  
      const email = userInfo?.email;
      if (!email) {
        throw new Error("User email is required.");
      }
  
      // API request to fetch group details
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/search_group?keycloak_group_id=${group_id}&email=${email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const groupData = response?.data;
  
      // Check if the response is an array (user is not a member and can join)
      if (Array.isArray(groupData)) {
        setJoinNewGroups(groupData);
  
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Project details fetched successfully.",
          confirmButtonColor: "#3085d6",
        });
      } 
      // Check if response is an object with status (user is already a member or owner)
      else if (groupData?.status === "owner") {
        Swal.fire({
          icon: "info",
          title: "Info",
          text: "You are already the owner of this project.",
          confirmButtonColor: "#3085d6",
        });
      } else if (groupData?.status === "member") {
        Swal.fire({
          icon: "info",
          title: "Info",
          text: "You are already a member of this project.",
          confirmButtonColor: "#3085d6",
        });
      } else {
        // Handle unexpected response formats
        Swal.fire({
          icon: "warning",
          title: "Warning",
          text: "Unexpected response received.",
          confirmButtonColor: "#f39c12",
        });
      }
    } catch (error: any) {
      console.error("Error fetching project:", error);
  
      let errorMessage = "Failed to fetch project details. Please try again.";
      if (error.response) {
        errorMessage = error.response?.data?.error || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
  
      toast.error(errorMessage);
  
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: "#d33",
      });
    }
  };
  
  const handleAction = (action: string, userId: any) => {
    let data = { "membership_id": userId, "action": action }
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
        } catch (error: any) {
          Swal.fire(
            "Error",
            error?.response?.data?.message || "An error occurred.",
            "error"
          );
        }
      }
    });
  };
  const handleViewMembers = (event: any, group: any) => {
    setSelectedMembers(group || []); // Set members or empty array
    setAnchorEl(event.currentTarget); // Attach popover to clicked icon
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };
  const handleOpenPendingPopover = (event: any) => {
    popoverRef.current = event.currentTarget;
    setIsPopoverOpen(true); // ✅ Opens popover
  };

  const handleClosePendingPopover = () => {
    console.log("Closing popover...");
    setIsPopoverOpen((prev) => !prev); // ✅ Ensures correct state update
  };

  const joinGroup = async (group_id: any) => {
    if (!group_id) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Group",
        text: "Please select a valid project to join.",
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
        text: response?.data?.message || "Your request to join the project was successful!",
      });
      getAllGroups();
    } catch (error: any) {
      console.error("Error joining group:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to join the project. Please try again later.",
      });
    }
  };

  const handleLeaveGroup = async (groupId: number, userEmail: any, remove_admin: boolean) => {
    Swal.fire({
      title: remove_admin ? "Are you sure you want to remove this member ?" : "Are you sure you want to leave this project ?",
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
        } catch (error: any) {
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
              Projects
            </Typography>

            {/* {groups?.length > 0 ? (
              groups?.filter((x: any) => { return x?.attributes?.group_name[0] == userInfo?.email }).map((item, index) => (
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
                      <LinkCustom to={`/dashboard/${item.group_name_id}`}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => {
                            console.log("group_id", item.id)
                            localStorage.setItem("group_id", item.group_name_id);
                            localStorage.setItem("selected_others", "false")
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
            )} */}
          </Grid>

          <Box sx={{ padding: 2 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Join Project:</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: "100%" }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TextField
                        label="Search Project"
                        variant="outlined"
                        size="medium"
                        name="searchQuery"
                        value={formik.values.searchQuery}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.searchQuery && Boolean(formik.errors.searchQuery)}
                        helperText={formik.touched.searchQuery && formik.errors.searchQuery}
                        sx={{ mt: 1, width: "250px" }} // Adjust width as needed
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        sx={{ height: "40px", width: "120px", ml: 1 }} // Adjust width and add margin for spacing
                      >
                        Search
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Group ID</TableCell>
                        <TableCell>Owner</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {joinNewGroups?.map((group, index) => (
                        <TableRow key={group.id || index}>
                          <TableCell>{group?.keycloak_group_id}</TableCell>
                          <TableCell>{group?.owner_first_name + " " + group?.owner_last_name}</TableCell>
                          <TableCell>{group.owner_email}</TableCell>
                          <TableCell align="center">
                            <Button
                              variant="contained"
                              size="small"
                              color="primary"
                              onClick={() => joinGroup(group?.id)}
                            >
                              Join
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
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2-content"
                id="panel2-header"
              >
                <Typography variant="h6">Already Joined Groups:</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {myGroups?.length === 0 ? (
                  <Typography >No joined Project.</Typography>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><b>Group ID</b></TableCell>
                          <TableCell><b>Owner Name</b></TableCell>
                          <TableCell><b>Owner Email</b></TableCell>
                          <TableCell><b>Actions</b></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {myGroups?.map((group: any, index) => (
                          <TableRow key={index}>
                            <TableCell>{group?.keycloak_group_id}</TableCell>
                            <TableCell>{group?.owner_first_name + " " + group?.owner_last_name}</TableCell>
                            <TableCell>{group?.owner_email}</TableCell>
                            <TableCell>
                              {/* View Current Members */}
                              <IconButton
                                disabled={!group?.is_owner}
                                color="primary"
                                onClick={(e) => handleViewMembers(e, group?.members?.filter((x: any) => { return x?.membership_status == "approved" }))}
                              >
                                <GroupIcon />
                              </IconButton>
                              <Popover
                                open={Boolean(anchorEl)}
                                anchorEl={anchorEl}
                                onClose={handleClosePopover}
                                anchorOrigin={{
                                  vertical: "bottom",
                                  horizontal: "right",
                                }}
                                transformOrigin={{
                                  vertical: "top",
                                  horizontal: "left",
                                }}
                              >
                                <Box sx={{ padding: 1, minWidth: 250, maxHeight: 300, overflowY: "auto" }}>
                                  {/* Header with Close Button */}
                                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 1 }}>
                                    <Typography variant="subtitle1">Members</Typography>
                                    <IconButton size="small" onClick={handleClosePopover}>
                                      <CloseIcon />
                                    </IconButton>
                                  </Box>
                                  <Divider />

                                  {/* Member List */}
                                  <List>
                                    {group?.members?.length > 0 ? (
                                      group?.members?.filter((x: any) => { return x?.membership_status == "approved" })?.map((member: any, index: any) => (
                                        <ListItem
                                          key={index}
                                          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                                        >
                                          <ListItemText
                                            primary={`${member?.firstName} ${member?.lastName}`}
                                            secondary={member?.email}
                                          />
                                          {/* Remove Member Button */}
                                          <IconButton color="error" size="small" onClick={() => handleLeaveGroup(group?.id, member.email, true)}>
                                            <RemoveCircleIcon />
                                          </IconButton>
                                        </ListItem>
                                      ))
                                    ) : (
                                      <Typography sx={{ padding: 1 }}>No members found.</Typography>
                                    )}
                                  </List>
                                </Box>
                              </Popover>

                              {/* View Pending Requests */}
                              <IconButton color="warning" disabled={!group?.is_owner} onClick={(e) => handleOpenPendingPopover(e)}>
                                <HourglassEmptyIcon />
                                {/* Pending Requests Popover */}
                                {isPopoverOpen && <Popover
                                  open={isPopoverOpen}
                                  anchorEl={popoverRef.current}
                                  onClose={handleClosePendingPopover}
                                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                                  transformOrigin={{ vertical: "top", horizontal: "left" }}
                                >
                                  <ClickAwayListener onClickAway={handleClosePendingPopover}>
                                    <Box sx={{ padding: 1, minWidth: 250, maxHeight: 300, overflowY: "auto" }}>
                                      {/* Header with Close Button */}
                                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 1 }}>
                                        <Typography variant="subtitle1">Pending Requests</Typography>
                                        <IconButton size="small" onClick={handleClosePendingPopover}>
                                          <CloseIcon />
                                        </IconButton>
                                      </Box>
                                      <Divider />

                                      {/* Pending Requests List */}
                                      <List>
                                        {group?.members?.length > 0 ? (
                                          group?.members?.filter((x: any) => { return x?.membership_status == "pending" })?.map((member: any, index: any) => (
                                            <ListItem key={index} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                              <ListItemText primary={`${member.firstName} ${member.lastName}`} secondary={member.email} />
                                              <IconButton color="success" size="small" onClick={() => handleAction("approve", member?.membership_id)}>
                                                <CheckCircleIcon />
                                              </IconButton>
                                              <IconButton color="error" size="small" onClick={() => handleAction("reject", member?.membership_id)}>
                                                <CancelIcon />
                                              </IconButton>
                                            </ListItem>
                                          ))
                                        ) : (
                                          <Typography sx={{ padding: 1 }}>No pending requests.</Typography>
                                        )}
                                      </List>
                                    </Box>
                                  </ClickAwayListener>
                                </Popover>}
                              </IconButton>

                              {/* Leave Group */}
                              <IconButton
                                color="error"
                                disabled={group?.is_owner}
                                onClick={() => handleLeaveGroup(group?.id, userInfo?.email, false)}
                              >
                                <ExitToAppIcon />
                              </IconButton>
                              <LinkCustom to={group?.is_owner ? `/dashboard/${group?.keycloak_group_id}` : `/dashboard/${group?.keycloak_group_id}?other_group=true`}>
                                {/* Select Group */}
                                <Button
                                  variant={"contained"}
                                  color="primary"
                                  size="small"
                                  onClick={() => {
                                    if (group?.is_owner) {
                                      console.log("group_id", group.id)
                                      localStorage.setItem("group_id", group.keycloak_group_id);
                                      localStorage.setItem("selected_others", "false")
                                      localStorage.removeItem("user_email")
                                    } else {
                                      localStorage.setItem("group_id", group?.keycloak_group_id);
                                      localStorage.setItem("selected_others", "true")
                                      localStorage.setItem("user_email", group?.owner_email)
                                    }
                                  }}
                                  disabled={
                                    group?.membership_status === "pending" || group?.membership_status === "rejected" || group?.membership_status == "left"
                                  }
                                >
                                  {"Select"}
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

          </Box>
        </>
      )}
    </Dashboard>
  );
}
