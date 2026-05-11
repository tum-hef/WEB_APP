import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useFormik } from "formik";
import {
  Button,
  Grid,
  Typography,
  Box,
  Modal,
  TextField,
  MenuItem,
  Divider,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useKeycloak } from "@react-keycloak/web";
import { useHistory, useParams } from "react-router-dom";
import Dashboard from "../components/DashboardComponent";
import { ToastContainer, toast } from "react-toastify";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import LinkCustom from "../components/LinkCustom";
import { editLocationValidationSchema } from "../formik/validation_schema";
interface ApiResponse {
  success: boolean;
  PORT?: number;
  message?: string;
  error_code?: number;
}
const Location = () => {
  const getCoordinateTitle = (lat: number, lng: number) =>
    `Lat ${lat.toFixed(6)}, Lng ${lng.toFixed(6)}`;

  const primaryButtonSx = {
    backgroundColor: "rgb(35, 48, 68)",
    "&:hover": {
      backgroundColor: "rgb(26, 36, 51)",
    },
  };
  const cancelButtonSx = {
    backgroundColor: "#6e7881",
    color: "#ffffff",
    borderColor: "#6e7881",
    "&:hover": {
      backgroundColor: "#5f6870",
      borderColor: "#5f6870",
    },
  };

  const history = useHistory();
  const activeLocationRequestRef = useRef(0);
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;
  const [longitude, setLongitude] = useState<number | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  // const [current_time, setCurrentTime] = useState<Date | null>(null);
  const [displayName, setDisplayName] = useState(""); 
  const [sensorThingDesc, setSensorThingDesc] = useState<{
  name: string;
  description: string;
}>({
  name: "",
  description: "",
});
  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [locationLoaded, setLocationLoaded] = useState(false);
  const [linkedThing, setLinkedThing] = useState<{ id: number | null; name: string }>({
    id: null,
    name: "",
  });
  const { id } = useParams<{ id: string }>();
  const isHistoricalLocation = locationLoaded && linkedThing.id === null;

  

  const editFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: sensorThingDesc?.name || "",
      description: sensorThingDesc?.description || "",
      latitude: latitude !== null ? String(latitude) : "",
      longitude: longitude !== null ? String(longitude) : "",
    },
    validationSchema: editLocationValidationSchema,
    onSubmit: async (values) => {
      const parsedLat = parseFloat(values.latitude);
      const parsedLng = parseFloat(values.longitude);

      try {
        setSaving(true);
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/update`,
          {
            url: `Locations(${id})`,
            FROST_PORT: frostServerPort,
            keycloak_id: userInfo?.sub,
            body: {
              name: values.name,
              description: values.description,
              encodingType: "application/vnd.geo+json",
              location: {
                type: "Point",
                coordinates: [parsedLng, parsedLat],
              },
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${keycloak?.token}`,
            },
          }
        );

        if (response.status === 200) {
          setSensorThingDesc({ name: values.name, description: values.description });
          setLatitude(parsedLat);
          setLongitude(parsedLng);
          setEditOpen(false);

          try {
            const reverseRes = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${parsedLat}&lon=${parsedLng}`
            );
            if (reverseRes.data?.display_name) {
              setDisplayName(reverseRes.data.display_name);
            } else {
              setDisplayName(getCoordinateTitle(parsedLat, parsedLng));
            }
          } catch {
            setDisplayName(getCoordinateTitle(parsedLat, parsedLng));
          }

          toast.success("Location updated successfully!");
        } else {
          toast.error("Failed to update location.");
        }
      } catch {
        toast.error("Failed to update location.");
      } finally {
        setSaving(false);
      }
    },
  });

  const createFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: "",
      description: "",
      latitude: "",
      longitude: "",
    },
    validationSchema: editLocationValidationSchema,
    onSubmit: async (values) => {
      if (!linkedThing.id) {
        toast.error("Linked device not found. Cannot create location.");
        return;
      }
      if (!frostServerPort) {
        toast.error("FROST server port not available.");
        return;
      }

      const parsedLat = parseFloat(values.latitude);
      const parsedLng = parseFloat(values.longitude);
      const isDev = process.env.REACT_APP_IS_DEVELOPMENT === "true";
      const apiUrl = isDev
        ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Locations`
        : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Locations`;

      try {
        setCreating(true);
        const response = await axios.post(
          apiUrl,
          {
            name: values.name,
            description: values.description,
            encodingType: "application/vnd.geo+json",
            location: {
              type: "Point",
              coordinates: [parsedLng, parsedLat],
            },
            Things: [{ "@iot.id": linkedThing.id }],
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${keycloak?.token}`,
            },
          }
        );

        if (response.status === 201) {
          const locationHeader = response.headers?.location as string | undefined;
          const idMatch = locationHeader?.match(/Locations\((\d+)\)/);
          const newLocationId = idMatch?.[1];

          if (newLocationId) {
            toast.success("Location created successfully!");
            setCreateOpen(false);
            history.push(`/locations/${newLocationId}`);
          } else {
            toast.success("Location created. Reloading locations page.");
            setCreateOpen(false);
            history.push("/locations");
          }
        } else {
          toast.error("Failed to create location.");
        }
      } catch {
        toast.error("Failed to create location.");
      } finally {
        setCreating(false);
      }
    },
  });

  const customMarkerIcon = new L.Icon({
    iconUrl: require("../assets/pinpoint.png"), // Specify the correct path to your custom icon
    iconSize: [30, 30],
  });

  const fetchFrostPort = async () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL;
    const email =
      localStorage.getItem("selected_others") === "true"
        ? localStorage.getItem("user_email")
        : userInfo?.preferred_username;
    const group_id = localStorage.getItem("group_id");
  
    if (!email || !group_id) {
      toast.error("User email and group ID are required.");
      return;
    }
  
    try {
      const response = await axios.post<ApiResponse>(
        `${backend_url}/frost-server`,
        {
          user_email: email,
          group_id: group_id
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Include Keycloak token
          },
          validateStatus: (status) => true,
        }
      );
  
      if (response.status === 200 && response.data.PORT) {
        setFrostServerPort(response.data.PORT);
      } else {
        toast.error(response.data.message || "Failed to fetch Frost Server port.");
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const errorResponse = error.response?.data as ApiResponse;
        toast.error(errorResponse.message || "An error occurred.");
      } else {
        toast.error("An unexpected error occurred.");
      }
      console.error("Error fetching Frost Server port:", error);
    }
  };
  

  const getLocation = async () => {
    try {
      const requestId = activeLocationRequestRef.current + 1;
      activeLocationRequestRef.current = requestId;
      const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT; 
      const isDev = process.env.REACT_APP_IS_DEVELOPMENT === 'true';  
     const url = isDev
       ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Locations(${id})?$expand=Things`
       : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Locations(${id})?$expand=Things`;
      setLatitude(null);
      setLongitude(null);
      setDisplayName("");
      setSensorThingDesc({ name: "", description: "" });
      setLinkedThing({ id: null, name: "" });
      setLocationLoaded(false);
      axios
        .get(
          url,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          if (requestId !== activeLocationRequestRef.current) return;
          if (response.status === 200 && response.data.location.coordinates) {
            const currentLat = response.data.location.coordinates[1];
            const currentLng = response.data.location.coordinates[0];
            setLatitude(currentLat);
            setLongitude(currentLng);
            setDisplayName(getCoordinateTitle(currentLat, currentLng));

            axios
              .get(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${currentLat}&lon=${currentLng}`
              )
              .then((response) => {
                if (requestId !== activeLocationRequestRef.current) return;
                if (response.data.display_name) {
                  setDisplayName(response.data.display_name); 
                }
              })
              .catch(() => {
                if (requestId !== activeLocationRequestRef.current) return;
                setDisplayName(getCoordinateTitle(currentLat, currentLng));
              });
              setSensorThingDesc({name:response?.data?.name , description:response?.data?.description})
              const firstThing = response?.data?.Things?.[0];
              setLinkedThing({
                id: firstThing?.["@iot.id"] ?? null,
                name: firstThing?.name ?? "",
              });
              setLocationLoaded(true);
          }
        })
        .catch((err) => {
          if (requestId !== activeLocationRequestRef.current) return;
          toast.error("Error Getting Location");
          setLocationLoaded(true);
        });
    } catch (error) {}
  };

  const openEditModal = () => {
    if (isHistoricalLocation) return;
    editFormik.resetForm();
    setEditOpen(true);
  };

  const openCreateModal = () => {
    createFormik.resetForm();
    setCreateOpen(true);
  };

  useEffect(() => {
    if (frostServerPort !== null) {
      getLocation();
    } else {
      fetchFrostPort();
    }
    setLoading(true);
    setLoading(false);
  }, [frostServerPort, id]);

  loading && <div>Loading...</div>;
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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        flexDirection={{ xs: "column", md: "row" }}
        gap={{ xs: 1.5, md: 0 }}
        mb={1.25}
      >
        <LinkCustom to="/devices">
          <Button
            variant="contained"
            color="primary"
            sx={primaryButtonSx}
            fullWidth
          >
            Devices
          </Button>
        </LinkCustom>

        <Box
          display="flex"
          gap={1}
          flexDirection={{ xs: "column", sm: "row" }}
          width={{ xs: "100%", md: "auto" }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={openCreateModal}
            disabled={isHistoricalLocation}
            sx={primaryButtonSx}
          >
            Create New Location
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={openEditModal}
            disabled={isHistoricalLocation}
            startIcon={<EditOutlinedIcon />}
            sx={primaryButtonSx}
          >
            Edit Location
          </Button>
        </Box>
      </Box>
      {isHistoricalLocation && (
        <Box
          sx={{
            mb: 2.5,
            px: 2,
            py: 1.5,
            borderRadius: 1,
            backgroundColor: "#eef2f7",
            border: "1px solid #c7d1dc",
            borderLeft: "6px solid rgb(35, 48, 68)",
          }}
        >
          <Typography sx={{ color: "rgb(35, 48, 68)", fontWeight: 700, fontSize: 15 }}>
            Historical Location
          </Typography>
          <Typography variant="body2" sx={{ color: "#3f4b59", mt: 0.25 }}>
            This location has no active linked device and is read-only.
          </Typography>
        </Box>
      )}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "94%", sm: 640 },
            maxHeight: "88vh",
            overflowY: "auto",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
            p: { xs: 2, sm: 3 },
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Create New Location
            </Typography>
          </Box>
          <Divider />

          <Typography variant="subtitle2" color="text.secondary">
            Device Reference
          </Typography>
          <TextField
            select
            label="Device"
            value={linkedThing.id !== null ? String(linkedThing.id) : ""}
            fullWidth
            disabled
            helperText={
              isHistoricalLocation
                ? "No active linked device (historical location)"
                : "Linked device is read-only"
            }
          >
            <MenuItem value={linkedThing.id !== null ? String(linkedThing.id) : ""}>
              {linkedThing.name || "Historical location (no active linked device)"}
            </MenuItem>
          </TextField>

          <Typography variant="subtitle2" color="text.secondary">
            New Location Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Location Name"
                name="name"
                value={createFormik.values.name}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
                error={createFormik.touched.name && Boolean(createFormik.errors.name)}
                helperText={createFormik.touched.name && createFormik.errors.name}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={createFormik.values.description}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
                error={
                  createFormik.touched.description &&
                  Boolean(createFormik.errors.description)
                }
                helperText={
                  createFormik.touched.description && createFormik.errors.description
                }
                fullWidth
                multiline
                minRows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Latitude"
                type="number"
                name="latitude"
                value={createFormik.values.latitude}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
                error={
                  createFormik.touched.latitude &&
                  Boolean(createFormik.errors.latitude)
                }
                helperText={
                  createFormik.touched.latitude && createFormik.errors.latitude
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Longitude"
                type="number"
                name="longitude"
                value={createFormik.values.longitude}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
                error={
                  createFormik.touched.longitude &&
                  Boolean(createFormik.errors.longitude)
                }
                helperText={
                  createFormik.touched.longitude && createFormik.errors.longitude
                }
                fullWidth
              />
            </Grid>
          </Grid>

          <Divider />
          <Box display="flex" justifyContent="flex-end" gap={1.25}>
            <Button
              variant="contained"
              onClick={() => createFormik.submitForm()}
              disabled={creating || !createFormik.isValid}
              sx={primaryButtonSx}
            >
              {creating ? "Creating..." : "Create"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setCreateOpen(false)}
              disabled={creating}
              sx={cancelButtonSx}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "94%", sm: 640 },
            maxHeight: "88vh",
            overflowY: "auto",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
            p: { xs: 2, sm: 3 },
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Edit Location
            </Typography>
          </Box>
          <Divider />

          <Typography variant="subtitle2" color="text.secondary">
            Device Reference
          </Typography>
          <TextField
            select
            label="Device"
            value={linkedThing.id !== null ? String(linkedThing.id) : ""}
            fullWidth
            disabled
            helperText={
              isHistoricalLocation
                ? "No active linked device (historical location)"
                : "Linked device is read-only"
            }
          >
            <MenuItem value={linkedThing.id !== null ? String(linkedThing.id) : ""}>
              {linkedThing.name || "Historical location (no active linked device)"}
            </MenuItem>
          </TextField>

          <Typography variant="subtitle2" color="text.secondary">
            Location Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Location Name"
                name="name"
                value={editFormik.values.name}
                onChange={editFormik.handleChange}
                onBlur={editFormik.handleBlur}
                error={editFormik.touched.name && Boolean(editFormik.errors.name)}
                helperText={editFormik.touched.name && editFormik.errors.name}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={editFormik.values.description}
                onChange={editFormik.handleChange}
                onBlur={editFormik.handleBlur}
                error={
                  editFormik.touched.description &&
                  Boolean(editFormik.errors.description)
                }
                helperText={
                  editFormik.touched.description && editFormik.errors.description
                }
                fullWidth
                multiline
                minRows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Latitude"
                type="number"
                name="latitude"
                value={editFormik.values.latitude}
                onChange={editFormik.handleChange}
                onBlur={editFormik.handleBlur}
                error={
                  editFormik.touched.latitude &&
                  Boolean(editFormik.errors.latitude)
                }
                helperText={editFormik.touched.latitude && editFormik.errors.latitude}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Longitude"
                type="number"
                name="longitude"
                value={editFormik.values.longitude}
                onChange={editFormik.handleChange}
                onBlur={editFormik.handleBlur}
                error={
                  editFormik.touched.longitude &&
                  Boolean(editFormik.errors.longitude)
                }
                helperText={
                  editFormik.touched.longitude && editFormik.errors.longitude
                }
                fullWidth
              />
            </Grid>
          </Grid>

          <Divider />
          <Box display="flex" justifyContent="flex-end" gap={1.25}>
            <Button
              variant="contained"
              onClick={() => editFormik.submitForm()}
              disabled={saving || !editFormik.isValid}
              sx={primaryButtonSx}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setEditOpen(false)}
              disabled={saving}
              sx={cancelButtonSx}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      {(displayName && sensorThingDesc?.name && sensorThingDesc?.description) && ( 
        <>
        <Grid container justifyContent="left" alignItems="left">
          <Typography variant="h6" component="h6" m={2}>
            <b>Title: </b> {displayName}
          </Typography>{" "}
        </Grid>
        <Grid container justifyContent="left" alignItems="left">
          <Typography variant="h6" component="h6" m={2}>
            <b>Location Name: </b> {sensorThingDesc?.name}
          </Typography>{" "}
        </Grid>
        <Grid container justifyContent="left" alignItems="left">
          <Typography variant="h6" component="h6" m={2}>
            <b>Location Description: </b> {sensorThingDesc?.description}
          </Typography>{" "}
        </Grid>
        </>
        
      )}
      {latitude && longitude && (
        <>
        
          {/* add text left */}
          <Grid item xs={12} sm={12}>
            <MapContainer
              center={[latitude, longitude]}
              zoom={14}
              scrollWheelZoom={false}
              style={{ height: "60vh", width: "30wh" }}
            >
              <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                position={[latitude, longitude]}
                icon={customMarkerIcon}
              ></Marker>
            </MapContainer>
          </Grid>
        </>
      )}
    </Dashboard>
  );
};

export default Location;
