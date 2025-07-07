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
  ClickAwayListener,
  CircularProgress,
  FormControlLabel,
  Switch
} from "@mui/material";
import axios, { AxiosError } from "axios";
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
import Tooltip from "@mui/material/Tooltip";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useFormik } from "formik";
import * as Yup from "yup";
import { setSelectedGroupId } from "../store/rolesSlice";
import { useAppDispatch } from "../hooks/hooks";


interface Group {
  group_name_id: string;
  group_name: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  groups?: Group[];
}
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
  const [openPendingGroupId, setOpenPendingGroupId] = useState<number | null>(null);
  const [pendingPopover, setPendingPopover] = useState<{ anchorEl: HTMLElement | null, groupId: number | null }>({ anchorEl: null, groupId: null });
  const [membersPopover, setMembersPopover] = useState<{ anchorEl: HTMLElement | null, groupId: number | null }>({ anchorEl: null, groupId: null });
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const dispatch = useAppDispatch();



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
  const formikCreateProject = useFormik({
    initialValues: {
      projectName: "",
      projectDescription: "",
      includeNodeRed: false,
    },
    validationSchema: Yup.object({
      projectName: Yup.string()
        .min(3, "Project name must be at least 3 characters")
        .required("Project name is required"),
      projectDescription: Yup.string()
        .min(10, "Description must be at least 10 characters")
        .required("Project description is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      const token = keycloak?.token;
      if (!token) {
        Swal.fire("Error", "Authentication token not found. Please log in.", "error");
        return;
      }

      Swal.fire({
        title: "Are you sure you want to create this project?",
        text: `Project Name: ${values.projectName}`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, create it!",
        cancelButtonText: "Cancel",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            setIsCreatingProject(true); // ✅ Show loading overlay
            const response = await axios.post(
              `${process.env.REACT_APP_BACKEND_URL}/create_project`,
              {
                user_email: userInfo?.email,
                project_name: values.projectName,
                project_description: values.projectDescription,
                create_node_red: values.includeNodeRed,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            Swal.fire("Success", response.data.message || "Project created successfully!", "success");

            resetForm();
            getAllGroups();
          } catch (error: any) {
            const errorMessage = error.response?.data?.error || "Failed to create project. Please try again.";
            Swal.fire("Error", errorMessage, "error");
          } finally {
            setIsCreatingProject(false); // ✅ Hide loading overlay
          }
        }
      });
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
        return; // ✅ Prevents unnecessary API call
      }

      if (keycloak && userInfo?.sub) {
        const userID = userInfo.sub; // ✅ Ensures correct user ID before setting state
        setUserID(userID);

        try {
          setLoading(true);

          const response = await axios.get<ApiResponse>(
            `${process.env.REACT_APP_BACKEND_URL}/get_clients?user_id=${userID}`
          );

          console.log("API Response:", response.data);

          // ✅ Check if API response contains success: false
          if (!response.data.success) {
            toast.error(response.data.message || "Error fetching clients.");
            setLoading(false);
            return;
          }

          if (response.status === 200 && response.data.groups && response.data.groups.length > 0) {
            const validGroups = response.data.groups.filter(
              (group: any) => group.project_name // ✅ This ensures it's a project group, not a subgroup like "Owners"
            );
            setGroups(validGroups);
          } else {
            toast.error("No groups found.");
          }
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<ApiResponse>;
            // toast.error(axiosError.response?.data?.message || "An error occurred while fetching clients.");
          } else {
            toast.error("An unexpected error occurred.");
          }
          console.error("Error fetching clients:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [keycloak, userInfo, message]);
  useEffect(() => {
    getAllGroups();
  }, [userID]);

  useEffect(() => {
    console.log("pendingPopover", pendingPopover)
  }, [pendingPopover])

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
  const handleViewMembers = (event: React.MouseEvent<HTMLElement>, groupId: number) => {
    setMembersPopover({ anchorEl: event.currentTarget, groupId });
  };

  const handleCloseMembersPopover = () => {
    setMembersPopover({ anchorEl: null, groupId: null });
  };
  const handleOpenPendingPopover = (event: React.MouseEvent<HTMLElement>, groupId: number) => {
    setPendingPopover({ anchorEl: event.currentTarget, groupId }); // Attach popover to clicked element
    setOpenPendingGroupId(groupId);  // Track which group's popover is open
  };


  const handleClosePendingPopover = () => {
    console.log("Close button clicked");
    setPendingPopover({ anchorEl: null, groupId: null }); // New object ensures state updates
    setOpenPendingGroupId(null); // Also reset open group tracking
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

  // Update Project Function

  const handleEditProjectSwal = (group: any) => {
    Swal.fire({
      title: "Edit Project",
      html: `
     <div class="swal-input-row-with-label">` +
        `<label for="name">New Name</label>` +
        `<div class="swal-input-field">` +
        `<input id="name" class="swal2-input" placeholder="Enter the new device name" value="${group?.name || ""
        }">` +
        `</div>` +
        `</div>` +
        `<div class="swal-input-row">` +
        `<label for="description">New Description</label>` +
        `<input id="description" class="swal2-input" placeholder="Enter the new device description" value="${group?.description || ""
        }">` +
        `</div>
    `,
      showCancelButton: true,
      confirmButtonText: "Save",
      showLoaderOnConfirm: true,
      preConfirm: () => {
        const name = (document.getElementById("name") as HTMLInputElement).value.trim();
        const description = (document.getElementById("description") as HTMLInputElement).value.trim();

        if (!name) {
          Swal.showValidationMessage("Please enter a project name");
          return false;
        }

        return { name, description };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = keycloak?.token;
          await axios.patch(`${process.env.REACT_APP_BACKEND_URL}/projects/${group.id}`, {
            project_name: result.value.name,
            project_description: result.value.description
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });

          await Swal.fire("Success", "Project updated successfully!", "success");
          getAllGroups();
        } catch (error) {
          await Swal.fire("Error", "Failed to update project", "error");
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
            <Accordion sx={{ marginTop: 2 }} defaultExpanded={true}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2-content"
                id="panel2-header"
              >
                <Typography variant="h5">Own and Joined Projects</Typography>

                {/* Question Mark Help Icon */}
                <Tooltip title="Here you can see all the projects you own or have joined. You also have the option to view members, approve/reject pending requests on the projects that you owned, and leave the other joined project.">
                  <HelpOutlineIcon sx={{ marginLeft: 1, fontSize: "1.4rem", color: "#555" }} />
                </Tooltip>
              </AccordionSummary>
              <AccordionDetails>
                {myGroups?.length === 0 ? (
                  <Typography >No joined Project.</Typography>
                ) : (
                  <TableContainer component={Paper} sx={{ maxHeight: "70vh", overflowY: "auto" }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ width: "15%", fontWeight: "bold" }}>Group ID</TableCell>
                          <TableCell sx={{ width: "20%", fontWeight: "bold" }}>Project Name</TableCell>
                          <TableCell sx={{ width: "30%", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            Project Description
                          </TableCell>
                          <TableCell sx={{ width: "20%", fontWeight: "bold" }}>Project Owner</TableCell>
                          <TableCell sx={{ width: "15%", textAlign: "center", fontWeight: "bold" }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {myGroups?.map((group: any, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ maxWidth: "150px", wordBreak: "break-word" }}>{group?.keycloak_group_id}</TableCell>
                            <TableCell sx={{ maxWidth: "180px", wordBreak: "break-word", fontWeight: "bold" }}>{group?.name}</TableCell>
                            <TableCell sx={{ maxWidth: "200px", wordBreak: "break-word", whiteSpace: "normal" }}>
                              {group?.description}
                            </TableCell>
                            <TableCell sx={{ maxWidth: "100px", wordBreak: "break-word" }}>
                              {group?.owner_first_name + " " + group?.owner_last_name}
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, flexWrap: "nowrap" }}>
                                {/* View Members */}
                                <IconButton disabled={!group?.is_owner} color="primary" onClick={(e) => handleViewMembers(e, group?.id)}>
                                  <GroupIcon />
                                </IconButton>
                                {membersPopover.groupId === group?.id && (
                                  <Popover
                                    open={Boolean(membersPopover.anchorEl)}
                                    anchorEl={membersPopover.anchorEl}
                                    onClose={handleCloseMembersPopover}
                                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                                    transformOrigin={{ vertical: "top", horizontal: "left" }}
                                  >
                                    <ClickAwayListener onClickAway={handleCloseMembersPopover}>
                                      <Box sx={{ padding: 1, minWidth: 250, maxHeight: 300, overflowY: "auto" }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 1 }}>
                                          <Typography variant="subtitle1">Members</Typography>
                                          <IconButton size="small" onClick={handleCloseMembersPopover}>
                                            <CloseIcon />
                                          </IconButton>
                                        </Box>
                                        <Divider />
                                        <List>
                                          {group?.members?.some((x: any) => x?.membership_status === "approved") ? (
                                            group?.members
                                              .filter((x: any) => x?.membership_status === "approved")
                                              .map((member: any, index: any) => (
                                                <ListItem key={index} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                  <ListItemText primary={`${member?.first_name} ${member?.last_name}`} secondary={member?.email} />
                                                  <IconButton color="error" size="small" onClick={() => handleLeaveGroup(group?.id, member.email, true)}>
                                                    <RemoveCircleIcon />
                                                  </IconButton>
                                                </ListItem>
                                              ))
                                          ) : (
                                            <Typography sx={{ padding: 1 }}>No approved members found.</Typography>
                                          )}
                                        </List>
                                      </Box>
                                    </ClickAwayListener>
                                  </Popover>
                                )}

                                {/* View Pending Requests */}
                                <IconButton color="warning" disabled={!group?.is_owner} onClick={(e) => handleOpenPendingPopover(e, group?.id)}>
                                  <HourglassEmptyIcon />
                                </IconButton>
                                {openPendingGroupId === group?.id && (
                                  <Popover
                                    open={Boolean(pendingPopover.anchorEl)}
                                    anchorEl={pendingPopover.anchorEl}
                                    onClose={handleClosePendingPopover}
                                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                                    transformOrigin={{ vertical: "top", horizontal: "left" }}
                                  >
                                    <ClickAwayListener onClickAway={handleClosePendingPopover}>
                                      <Box sx={{ padding: 1, minWidth: 250, maxHeight: 300, overflowY: "auto" }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 1 }}>
                                          <Typography variant="subtitle1">Pending Requests</Typography>
                                          <IconButton size="small" onClick={handleClosePendingPopover}>
                                            <CloseIcon />
                                          </IconButton>
                                        </Box>
                                        <Divider />
                                        <List>
                                          {group?.members?.some((x: any) => x?.membership_status === "pending") ? (
                                            group?.members
                                              .filter((x: any) => x?.membership_status === "pending")
                                              .map((member: any, index: any) => (
                                                <ListItem key={index} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                  <ListItemText primary={`${member.first_name} ${member.last_name}`} secondary={member.email} />
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
                                  </Popover>
                                )}

                                {/* Leave Group */}
                                <IconButton color="error" disabled={group?.is_owner} onClick={() => handleLeaveGroup(group?.id, userInfo?.email, false)}>
                                  <ExitToAppIcon />
                                </IconButton>

                                {/* Edit Group */}
                                <IconButton color="error" disabled={!group?.is_owner} onClick={() => handleEditProjectSwal(group)}>
                                  <Tooltip title="Edit Project">
                                    <EditOutlinedIcon />
                                  </Tooltip>
                                </IconButton>

                                {/* Select Button */}
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  sx={{ backgroundColor: "#233044", whiteSpace: "nowrap", "&:hover": { backgroundColor: "#233044" } }}
                                  disabled={group?.membership_status === "pending" || group?.membership_status === "rejected" || group?.membership_status === "left" || !group?.is_ready}
                                  onClick={() => {
                                    if (!(
                                      group?.membership_status === "pending" ||
                                      group?.membership_status === "rejected" ||
                                      group?.membership_status === "left" ||
                                      !group?.is_ready
                                    )) {
                                      if (group?.is_owner) {
                                        localStorage.setItem("group_id", group.keycloak_group_id);
                                        localStorage.setItem("selected_others", "false");
                                        localStorage.removeItem("user_email");
                                        dispatch(setSelectedGroupId(group?.keycloak_group_id))
                                      } else {
                                        localStorage.setItem("group_id", group?.keycloak_group_id);
                                        localStorage.setItem("selected_others", "true");
                                        localStorage.setItem("user_email", group?.owner_email);
                                        dispatch(setSelectedGroupId(group?.keycloak_group_id))
                                      }
                                    }
                                  }}
                                >
                                  {!(group?.membership_status === "pending" || group?.membership_status === "rejected" || group?.membership_status === "left" || !group?.is_ready) ? (
                                    <LinkCustom

                                      to={group?.is_owner ? `/dashboard/${group?.keycloak_group_id}` : `/dashboard/${group?.keycloak_group_id}?other_group=true`}
                                      style={{ textDecoration: "none", color: "inherit" }}
                                    >
                                      Select
                                    </LinkCustom>
                                  ) : (
                                    "Select"
                                  )}
                                </Button>
                              </Box>
                            </TableCell>

                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                )}
              </AccordionDetails>
            </Accordion>
            <Accordion sx={{ marginTop: 2 }} defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel3-content"
                id="panel3-header"
              >
                <Typography variant="h5">Create New Project</Typography>
                <Tooltip title="Here you can create a new project by providing a project name and description. You can create maximum 2 projects.">
                  <HelpOutlineIcon sx={{ marginLeft: 1, fontSize: "1.4rem", color: "#555" }} />
                </Tooltip>
              </AccordionSummary>
              <AccordionDetails>
                <Box component="form" onSubmit={formikCreateProject.handleSubmit} sx={{ width: "100%" }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Project Name"
                        variant="outlined"
                        fullWidth
                        name="projectName"
                        value={formikCreateProject.values.projectName}
                        onChange={formikCreateProject.handleChange}
                        onBlur={formikCreateProject.handleBlur}
                        error={formikCreateProject.touched.projectName && Boolean(formikCreateProject.errors.projectName)}
                        helperText={formikCreateProject.touched.projectName && formikCreateProject.errors.projectName}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Project Description"
                        variant="outlined"
                        fullWidth
                        multiline
                        name="projectDescription"
                        value={formikCreateProject.values.projectDescription}
                        onChange={formikCreateProject.handleChange}
                        onBlur={formikCreateProject.handleBlur}
                        error={formikCreateProject.touched.projectDescription && Boolean(formikCreateProject.errors.projectDescription)}
                        helperText={formikCreateProject.touched.projectDescription && formikCreateProject.errors.projectDescription}
                      />
                    </Grid>

                    {/* ✅ Node-RED Toggle */}
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            name="includeNodeRed"
                            color="primary"
                            checked={formikCreateProject.values.includeNodeRed}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              formikCreateProject.setFieldValue("includeNodeRed", checked);

                              Swal.fire({
                                icon: "info",
                                title: "Node-RED Toggle",
                                text: checked
                                  ? "Node-RED will be included in this project."
                                  : "Node-RED will not be included in this project.",
                                timer: 2500,
                                showConfirmButton: false, 
                                position: "bottom-end",
                                toast: true,
                        
                              });
                            }}
                          />
                        }
                        label="Include Node-RED"
                      />
                    </Grid>
                  </Grid>

                  <Button
                    type="submit"
                    style={{ marginTop: "10px", backgroundColor: "#233044" }}
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={isCreatingProject}
                  >
                    {isCreatingProject ? "Processing..." : "Submit"}
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded={true}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h5">Join Existing Project</Typography>
                <Tooltip title="Here you can search for a project by its Group ID and join it.">
                  <HelpOutlineIcon sx={{ marginLeft: 1, fontSize: "1.4rem", color: "#555" }} />
                </Tooltip>
              </AccordionSummary>
              <AccordionDetails>
                <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: "100%" }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TextField
                        label="Search By ID"
                        variant="outlined"
                        size="medium"
                        name="searchQuery"
                        value={formik.values.searchQuery}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.searchQuery && Boolean(formik.errors.searchQuery)}
                        helperText={formik.touched.searchQuery && formik.errors.searchQuery}
                        sx={{ mt: 1, width: "250px" }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        sx={{
                          height: "40px",
                          width: "120px",
                          ml: 1,
                          backgroundColor: "#233044",
                          "&:hover": { backgroundColor: "#233044" },
                        }}
                      >
                        Search
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                {joinNewGroups?.length > 0 && (
                  <TableContainer component={Paper} sx={{ maxHeight: "70vh", overflowY: "auto" }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ width: "15%", fontWeight: "bold" }}>Group ID</TableCell>
                          <TableCell sx={{ width: "20%", fontWeight: "bold" }}>Project Name</TableCell>
                          <TableCell sx={{ width: "30%", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            Project Description
                          </TableCell>
                          <TableCell sx={{ width: "20%", fontWeight: "bold" }}>Project Owner</TableCell>
                          <TableCell sx={{ width: "15%", textAlign: "center", fontWeight: "bold" }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {joinNewGroups.map((group, index) => (
                          <TableRow key={group.id || index}>
                            <TableCell sx={{ maxWidth: "150px", wordBreak: "break-word" }}>{group?.keycloak_group_id}</TableCell>
                            <TableCell sx={{ maxWidth: "180px", wordBreak: "break-word", fontWeight: "bold" }}>{group?.name}</TableCell>
                            <TableCell sx={{ maxWidth: "300px", wordBreak: "break-word", whiteSpace: "normal" }}>
                              {group?.description}
                            </TableCell>
                            <TableCell sx={{ maxWidth: "200px", wordBreak: "break-word" }}>
                              {group?.owner_first_name + " " + group?.owner_last_name}
                            </TableCell>
                            <TableCell align="center">
                              <Button
                                variant="contained"
                                size="small"
                                color="primary"
                                sx={{
                                  backgroundColor: "#233044",
                                  "&:hover": { backgroundColor: "#233044" },
                                  minWidth: "80px",
                                }}
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

                )}
              </AccordionDetails>
            </Accordion>





          </Box>
        </>
      )}
      {isCreatingProject && (
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
            backgroundColor: 'rgba(14, 10, 10, 0.7)',  // Optional: add background overlay
            zIndex: 9999,  // Ensure it's above the form
            backdropFilter: 'blur(5px)',  // Optional: blur the background to give a dim effect
          }}
        >
          <CircularProgress size={50} color="primary" />  {/* MUI CircularProgress spinner */}
        </Box>
      )}
    </Dashboard>
  );
}
