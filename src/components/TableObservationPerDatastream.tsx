import { Box, Button, Grid, Modal, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { CSVLink } from "react-csv";
import DataTable from "react-data-table-component";
import { format } from "date-fns-tz";
import axios from "axios";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import DataTableCard from "./DataGrid";

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

// Add the Observation interface for type safety
interface Observation {
  "@iot.id": number;
  result: any;
  phenomenonTime: string;
  // Add other fields as needed
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

  // Add the fetchAllObservations function
  async function fetchAllObservations(
    baseUrl: string,
    token: string
  ): Promise<Observation[]> {
    let allObservations: Observation[] = [];
    let url: string | null = baseUrl;
    while (url) {
      const res: any = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      allObservations = allObservations.concat(res.data.value as Observation[]);
      url = res.data["@iot.nextLink"] ? res.data["@iot.nextLink"] : null;
      // If nextLink is relative, prepend the base URL's origin
      if (url && url.startsWith("/")) {
        const urlObj = new URL(baseUrl);
        url = `${urlObj.origin}${url}`;
      }
    }
    return allObservations;
  }

  const getCsvData = async () => {
    const csvData: string[][] = [["ID", "Result", "Phenomenon Time"]];
    const backend_url = process.env.REACT_APP_FROST_URL;

    // ✅ Base URL (navigation-based, not filter-based)
    let baseUrl = `https://${frostServerPort}-${backend_url}/FROST-Server/v1.0/Datastreams(${id})/Observations`;

    const filters: string[] = [];

    if (start_date && end_date) {
      filters.push(
        `phenomenonTime ge ${start_date.toISOString()}`,
        `phenomenonTime le ${end_date.toISOString()}`
      );
    }

    if (filters.length > 0) {
      baseUrl += `?$filter=${encodeURIComponent(filters.join(" and "))}&$top=100`;
    } else {
      baseUrl += `?$top=100`;
    }

    // ✅ Fetch all pages
    const observations = await fetchAllObservations(baseUrl, token);

    // ✅ Optional frontend filter (fallback safety)
    const filteredObservations = observations.filter((item) => {
      if (start_date && end_date) {
        const itemTime = new Date(item.phenomenonTime);
        return itemTime >= start_date && itemTime <= end_date;
      }
      return true;
    });

    // ✅ Build CSV rows
    if (filteredObservations.length === 0) {
      csvData.push(["No Data"]);
    } else {
      for (const obs of filteredObservations) {
        const romeTime = format(new Date(obs.phenomenonTime), "dd.MM.yyyy HH:mm", {
          timeZone: "Europe/Rome",
        });

        csvData.push([`${obs["@iot.id"]}`, `${obs.result}`, romeTime]);
      }
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

  const filterData = async () => {
    if (!start_date || !end_date) return;

    const backend_url = process.env.REACT_APP_FROST_URL;

    // Format ISO timestamps for OData
    const startISO = start_date.toISOString();
    const endISO = end_date.toISOString();

    const url = `https://${frostServerPort}-${backend_url}/FROST-Server/v1.0/Datastreams(${id})/Observations?$filter=phenomenonTime ge ${startISO} and phenomenonTime le ${endISO}&$orderby=phenomenonTime desc`;

    try {
      const res = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200 && res.data.value) {
        setDataStream(res.data.value);
        setIsDataFiltered(true);
      }
    } catch (err) {
      console.error("Error fetching filtered observations:", err);
    }
  };


  const columnDefs = [
    {
      headerName: "ID",
      field: "@iot.id",
      sortable: true,
      filter: true,
      flex: 1,
      valueGetter: (params: any) => params.data["@iot.id"]
    },
    {
      headerName: "Phenomenon Time",
      field: "phenomenonTime",
      sortable: true,
      filter: true,
      flex: 2,
      minWidth: 180,
      valueFormatter: (params: any) =>
        format(new Date(params.value), "dd.MM.yyyy HH:mm", {
          timeZone: "Europe/Rome",
        }),
    },
    {
      headerName: "Result",
      field: "result",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 120,
    },
  ];

  const [csvData, setCsvData] = useState<string[][]>([["ID", "Result", "Phenomenon Time"]]);
  const [csvReady, setCsvReady] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);

  const prepareCsvData = async () => {
    setCsvLoading(true);
    const data = await getCsvData();
    setCsvData(data);
    setCsvReady(true);
    setCsvLoading(false);
  };

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
                disabled={csvLoading || !start_date || !end_date || start_date > end_date}
                variant="contained"
                style={{
                  backgroundColor: !start_date || !end_date ? "#cccccc" : "",
                  color: !start_date || !end_date ? "#000000" : "",
                }}
                onClick={async () => {
                  setCsvLoading(true);
                  const data = await getCsvData();
                  setCsvData(data);
                  setCsvLoading(false);

                  // Auto-trigger download after data is set
                  const blob = new Blob([data.map(row => row.join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "observation.csv";
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
              >
                {csvLoading ? "Preparing..." : "Download CSV"}
              </Button>
            </Box>
          </Grid>
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
      <DataTableCard
        title={`Observations for Datastream ${id}`}
        description="This page shows the individual observations recorded for the selected datastream. 
Each observation represents a single measurement value captured at a specific time."
        columnDefs={columnDefs}
        rowData={datastream}
      />
    </>
  );
}

export default TableObservationPerDatastream;
