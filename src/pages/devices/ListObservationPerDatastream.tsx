import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import {
  Box,
  Breadcrumbs,
  Button,
  Grid,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import LinkCustom from "../../components/LinkCustom";

import Dashboard from "../../components/DashboardComponent";
import { useKeycloak } from "@react-keycloak/web";
import { ToastContainer } from "react-toastify";
import { useParams } from "react-router-dom";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { CSVLink } from "react-csv";
import { format } from "date-fns-tz";

const ListObservationsPerDatastream = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [datastream, setDataStream] = useState<any[]>([]);

  const { id } = useParams<{ id: string }>();
  const { device_id } = useParams<{ device_id: string }>();

  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setStartDate(null);
    setEndDate(null);
  };

  const [start_date, setStartDate] = useState<Date | null>(null);
  const [end_date, setEndDate] = useState<Date | null>(null);

  const [observations, setObservations] = useState<any[]>([]);

  const fetchObservations = () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
    axios
      .get(
        `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Datastreams(${id})/Observations`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        if (res.status === 200 && res.data.value) {
          setDataStream(res.data.value);
        }
      });
  };

  const fetchFrostPort = async () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL;
    const email = userInfo?.preferred_username;
    await axios
      .get(`${backend_url}/frost-server?email=${email}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.status === 200 && res.data.PORT) {
          setFrostServerPort(res.data.PORT);
        }
      });
  };

  // Assuming observations is an array of objects containing timestamps like "2020-06-02T16:04:18.812Z"

  const getCsvData = () => {
    const csvData = [["ID", "Result", "Phenomenon Time"]];

    if (observations.length > 0 && start_date && end_date) {
      const filteredObservations = observations.filter(
        (item) =>
          format(new Date(item.phenomenonTime), "dd.MM.yyyy HH:mm", {
            timeZone: "Europe/Rome",
          }) >=
            format(start_date, "dd.MM.yyyy HH:mm", {
              timeZone: "Europe/Rome",
            }) &&
          format(new Date(item.phenomenonTime), "dd.MM.yyyy HH:mm", {
            timeZone: "Europe/Rome",
          }) <=
            format(end_date, "dd.MM.yyyy HH:mm", { timeZone: "Europe/Rome" })
      );

      for (let i = 0; i < filteredObservations.length; i++) {
        const romeTime = format(
          new Date(filteredObservations[i].phenomenonTime),
          "dd.MM.yyyy HH:mm",
          { timeZone: "Europe/Rome" }
        );

        csvData.push([
          `${filteredObservations[i]["@iot.id"]}`,
          `${filteredObservations[i].result}`,
          romeTime,
        ]);
      }
    } else if (observations.length > 0 && !start_date && !end_date) {
      for (let i = 0; i < observations.length; i++) {
        const romeTime = format(
          new Date(observations[i].phenomenonTime),
          "dd.MM.yyyy HH:mm",
          { timeZone: "Europe/Rome" }
        );

        csvData.push([
          `${observations[i]["@iot.id"]}`,
          `${observations[i].result}`,
          romeTime,
        ]);
      }
    } else {
      csvData.push(["No Data"]);
    }

    return csvData;
  };

  useEffect(() => {
    if (frostServerPort !== null) {
      fetchObservations();
    } else {
      fetchFrostPort();
    }
  }, [frostServerPort]);

  useEffect(() => {
    if (start_date && end_date && start_date < end_date) {
      const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
      axios
        .get(
          `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Datastreams(${id})/Observations`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          if (res.status === 200 && res.data.value) {
            setObservations(res.data.value);
          }
        });
    }
  }, [start_date, end_date]);

  const columns = [
    {
      name: "ID",
      selector: (row: any) => `${row["@iot.id"]}`,

      sortable: true,
    },
    {
      name: "Phenomenon Time",
      selector: (row: any) =>
        format(new Date(row.phenomenonTime), "dd.MM.yyyy HH:mm", {
          timeZone: "Europe/Rome",
        }),
      sortable: true,
    },
    {
      name: "Result",
      selector: (row: any) => row.result,
      sortable: true,
    },
  ];
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    height: "50%", // Adjust the height as needed
    margin: "auto", // Center the modal horizontally
    marginTop: "5%", // Adjust the top margin as needed
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
      <Breadcrumbs
        aria-label="breadcrumb"
        style={{
          marginBottom: "10px",
        }}
      >
        <LinkCustom to="/">Data Space</LinkCustom>
        <LinkCustom to="/frost_entities">Data Items</LinkCustom>
        <LinkCustom to="/devices">Devices</LinkCustom>
        <LinkCustom to={`/devices/${device_id}/datastreams`}>
          Datastreams of Device {device_id}
        </LinkCustom>
        <Typography color="text.primary">
          Observations for Datastream {id}
        </Typography>
      </Breadcrumbs>
      {/* Add button on right side */}
      <Grid item xs={12} sm={6} md={4} lg={3} mt={4} mb={4}>
        <LinkCustom
          to={`/devices/${device_id}/datastreams/${id}/observations/graph`}
        >
          <Button
            variant="contained"
            style={{
              backgroundColor: "#233044",
              color: "#ffffff",
            }}
          >
            Check graph
          </Button>
        </LinkCustom>
      </Grid>{" "}
      <Grid item xs={12} sm={6} md={4} lg={3} mt={4} mb={4}>
        <Button
          variant="contained"
          style={{
            backgroundColor: "#233044",
            color: "#ffffff",
          }}
          onClick={handleOpenModal}
        >
          Download CSV
        </Button>
      </Grid>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {/* Close button */}
          <Button
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              color: "red",
            }}
            onClick={handleCloseModal}
          >
            Close Window
          </Button>

          <Typography id="modal-modal-title" variant="h6" component="h2">
            Download CSV
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container justifyContent="center" alignItems="center">
              <Grid
                item
                xs={12}
                md={6}
                m={{
                  xs: 2,
                  md: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "30px",
                  }}
                >
                  <DateTimePicker
                    label="Start Datetime"
                    inputFormat="dd.MM.yyyy HH:mm"
                    value={start_date}
                    onChange={(e) => {
                      setStartDate(e);
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Box>
              </Grid>{" "}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <DateTimePicker
                    label="End Datetime"
                    value={end_date}
                    inputFormat="dd.MM.yyyy HH:mm"
                    onChange={(e) => {
                      setEndDate(e);
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Box>
              </Grid>{" "}
              {start_date && end_date && (
                <Grid item xs={12} md={12}>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Button
                      style={{
                        color: "red",
                      }}
                      onClick={() => {
                        setStartDate(null);
                        setEndDate(null);
                        // fetchObservations();
                      }}
                    >
                      Clear Filter
                    </Button>
                  </Box>
                </Grid>
              )}
              <Grid item xs={12} md={12} mt={2}></Grid>
            </Grid>
          </LocalizationProvider>

          {/* create a helper text */}
          <Typography variant="body1" color="secondary">
            Note: If you don't select any date, all observations will be
            downloaded.
          </Typography>

          <Grid item xs={12} md={12}>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                disabled={
                  !start_date || !end_date || start_date > end_date
                    ? true
                    : false
                }
                variant="contained"
                style={{
                  backgroundColor: !start_date || !end_date ? "#cccccc" : "",
                  color: !start_date || !end_date ? "#000000" : "",
                }}
              >
                <CSVLink
                  filename="observation.csv"
                  data={getCsvData()}
                  style={{
                    color: "#ffffff",
                    textDecoration: "none",
                  }}
                >
                  Download CSV
                </CSVLink>
              </Button>
            </Box>
          </Grid>
        </Box>
      </Modal>
      <DataTable
        title={`Observations for Datastream ${id}`}
        columns={columns}
        data={datastream}
        pagination={true}
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 15]}
      />
    </Dashboard>
  );
};

export default ListObservationsPerDatastream;
