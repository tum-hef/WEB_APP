import { Box, Button, Grid, Modal, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { CSVLink } from "react-csv";
import DataTable from "react-data-table-component";
import { format } from "date-fns-tz";
import axios from "axios";
import SaveAltIcon from "@mui/icons-material/SaveAlt";

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
  height: "50%",
  margin: "auto",
  marginTop: "5%",
};

interface TableObservationPerDatastreamProps {
  datastream: any[];
  setDataStream: any;
  observations: any[];
  id: string;
  frostServerPort: number | null;
  token: any;
  setObservations: any;
  isGraphButtonSelected: boolean;
  setIsGraphButtonSelected: any;
}

function TableObservationPerDatastream({
  datastream,
  setDataStream,
  observations,
  id,
  frostServerPort,
  token,
  setObservations,
  isGraphButtonSelected,
  setIsGraphButtonSelected,
}: TableObservationPerDatastreamProps) {
  const [start_date, setStartDate] = useState<Date | null>(null);
  const [end_date, setEndDate] = useState<Date | null>(null);
  const [isDataFiltered, setIsDataFiltered] = useState(false);  

  useEffect(() => {
    if (start_date && end_date && start_date < end_date) {
      const backend_url = process.env.REACT_APP_FROST_URL;
      axios
        .get(
          `https://${frostServerPort}-${backend_url}/FROST-Server/v1.0/Datastreams(${id})/Observations`,
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

  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
  };

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

  const resetFilter = () => {
    const orderedObservations = observations.sort((a, b) => {
      return (
        new Date(b.phenomenonTime).getTime() -
        new Date(a.phenomenonTime).getTime()
      );
    });
    setDataStream(orderedObservations);
    setIsDataFiltered(false);
    setStartDate(null);
    setEndDate(null);
  };

  const filterData = () => {
    console.log(start_date, end_date);

    if (start_date && end_date) {
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

      setIsDataFiltered(true);
      setDataStream(filteredObservations);
    }
  };

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

  return (
    <>
      <Grid container spacing={2}>
        {/* Left side buttons */}
        <Grid
          item
          xs={12}
          sm={6}
          md={4}
          lg={3}
          mt={4}
          mb={4}
          style={{ display: "flex" }}
        >
          <Button
            disabled={isGraphButtonSelected ? false : true}
            variant="contained"
            onClick={() => {
              setIsGraphButtonSelected(false);
            }}
            style={{
              backgroundColor: isGraphButtonSelected ? "#233044" : "#cccccc",
              color: isGraphButtonSelected ? "#ffffff" : "#000000",
              marginRight: "8px",
            }}
          >
            Table View
          </Button>
          <Button
            disabled={isGraphButtonSelected ? true : false}
            variant="contained"
            onClick={() => {
              setIsGraphButtonSelected(true);
            }}
            style={{
              backgroundColor: isGraphButtonSelected ? "#cccccc" : "#233044",
              color: isGraphButtonSelected ? "#000000" : "#ffffff",
            }}
          >
            Graph View
          </Button>
        </Grid>
        {start_date && end_date && isDataFiltered && (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
            mt={4}
            mb={4}
            style={{ marginLeft: "auto" }}
          >
            <Button
              variant="contained"
              style={{
                color: "#ffffff",
                backgroundColor: "#233044",
              }}
              onClick={resetFilter}
            >
              Reset Data
            </Button>
          </Grid>
        )}

        <Grid
          item
          xs={12}
          sm={6}
          md={4}
          lg={3}
          mt={4}
          mb={4}
          style={{ marginLeft: "auto" }}
        >
          <Button
            variant="contained"
            style={{
              color: "#ffffff",
            }}
            endIcon={<SaveAltIcon />}
            onClick={handleOpenModal}
          >
            Filter Data & Download CSV
          </Button>
        </Grid>
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
            Filter Data & Download CSV
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
                      onClick={resetFilter}
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
          <Typography
            variant="body1"
            color="secondary"
            style={{
              margin: "10px",
            }}
          >
            Note: Both start and end date must be selected and start date must
            be before end date
          </Typography>
          {/* Download CSV Button */}
          <Grid item xs={12} md={12} mb={2}>
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
          </Grid>{" "}
          {/* Filter Data Button*/}
          <Grid item xs={12} md={12} mb={2}>
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
                onClick={filterData}
              >
                Filter Data
              </Button>
            </Box>
          </Grid>{" "}
        </Box>
      </Modal>
      {start_date && end_date && isDataFiltered && (
        <Typography
          variant="body1"
          color="secondary"
          style={{
            margin: "10px",
          }}
        >
          Showing data from{" "}
          {format(start_date, "dd.MM.yyyy HH:mm", {
            timeZone: "Europe/Rome",
          })}{" "}
          to{" "}
          {format(end_date, "dd.MM.yyyy HH:mm", {
            timeZone: "Europe/Rome",
          })}
        </Typography>
      )}
      <DataTable
        title={`Observations for Datastream ${id}`}
        columns={columns}
        data={datastream}
        pagination={true}
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 15]}
      />
    </>
  );
}

export default TableObservationPerDatastream;
