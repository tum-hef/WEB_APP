import { useState, useEffect } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Button,
  Grid,
  Typography,
  Box,
  Modal,
  TextField,
  MenuItem,
} from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { useParams } from "react-router-dom";
import Dashboard from "../components/DashboardComponent";
import { ToastContainer, toast } from "react-toastify";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import LinkCustom from "../components/LinkCustom";
interface ApiResponse {
  success: boolean;
  PORT?: number;
  message?: string;
  error_code?: number;
}
const Location = () => {
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
  const [saving, setSaving] = useState(false);
  const [linkedThing, setLinkedThing] = useState<{ id: number | null; name: string }>({
    id: null,
    name: "",
  });
  const { id } = useParams<{ id: string }>();

  const editLocationValidationSchema = yup.object().shape({
    name: yup.string().required("Name is required").min(3, "Name must be at least 3 characters"),
    description: yup
      .string()
      .required("Description is required")
      .min(3, "Description must be at least 3 characters"),
    latitude: yup
      .string()
      .required("Latitude is required")
      .matches(/^-?\d+(\.\d+)?$/, "Latitude must be a valid number"),
    longitude: yup
      .string()
      .required("Longitude is required")
      .matches(/^-?\d+(\.\d+)?$/, "Longitude must be a valid number"),
  });

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
            }
          } catch {
            // Keep existing title if reverse geocoding fails.
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
      const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT; 
      const isDev = process.env.REACT_APP_IS_DEVELOPMENT === 'true';  
     const url = isDev
       ? `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Locations(${id})?$expand=Things`
       : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Locations(${id})?$expand=Things`;
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
          if (response.status === 200 && response.data.location.coordinates) {
            setLatitude(response.data.location.coordinates[1]);
            setLongitude(response.data.location.coordinates[0]);

            axios
              .get(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${response.data.location.coordinates[1]}&lon=${response.data.location.coordinates[0]}`
              )
              .then((response) => {
                if (response.data.display_name) {
                  setDisplayName(response.data.display_name); 
                }
              }); 
              setSensorThingDesc({name:response?.data?.name , description:response?.data?.description})
              const firstThing = response?.data?.Things?.[0];
              setLinkedThing({
                id: firstThing?.["@iot.id"] ?? null,
                name: firstThing?.name ?? "",
              });
          }
        })
        .catch((err) => {
          toast.error("Error Getting Location");
        });
    } catch (error) {}
  };

  const openEditModal = () => {
    editFormik.resetForm();
    setEditOpen(true);
  };

  useEffect(() => {
    if (frostServerPort !== null) {
      getLocation();
    } else {
      fetchFrostPort();
    }
    setLoading(true);
    setLoading(false);
  }, [frostServerPort]);

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
        alignItems="center"
        mb={1.25}
      >
        <LinkCustom to="/devices">
          <Button
            variant="outlined"
            color="inherit"
          >
            Devices
          </Button>
        </LinkCustom>

        <Box display="flex" gap={1}>
          <LinkCustom to="/locations/store">
            <Button variant="contained" color="primary">
              Create New Location
            </Button>
          </LinkCustom>
          <Button variant="outlined" color="primary" onClick={openEditModal}>
            Edit Location
          </Button>
        </Box>
      </Box>
      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "92%", sm: 520 },
            bgcolor: "background.paper",
            borderRadius: 1.5,
            boxShadow: 24,
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h6">Edit Location</Typography>
          <TextField
            select
            label="Device"
            value={linkedThing.id !== null ? String(linkedThing.id) : ""}
            fullWidth
            disabled
            helperText="Linked device (read-only)"
          >
            <MenuItem value={linkedThing.id !== null ? String(linkedThing.id) : ""}>
              {linkedThing.name || "No linked device"}
            </MenuItem>
          </TextField>
          <TextField
            label="Name"
            name="name"
            value={editFormik.values.name}
            onChange={editFormik.handleChange}
            onBlur={editFormik.handleBlur}
            error={editFormik.touched.name && Boolean(editFormik.errors.name)}
            helperText={editFormik.touched.name && editFormik.errors.name}
            fullWidth
          />
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
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button
              variant="outlined"
              onClick={() => setEditOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => editFormik.submitForm()}
              disabled={saving || !editFormik.isValid}
            >
              {saving ? "Saving..." : "Save"}
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
