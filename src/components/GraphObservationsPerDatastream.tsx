import { Box, Button, Grid, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns-tz";
import axios from "axios";
import { toast } from "react-toastify";
import SaveAltIcon from "@mui/icons-material/SaveAlt";

function GraphObservationsPerDatastream({
  token,
  frostServerPort,
  id,
  fetchFrostPort,
  isGraphButtonSelected,
  setIsGraphButtonSelected,
}: any) {
  const [start_date, setStartDate] = useState<Date | null>(null);
  const [end_date, setEndDate] = useState<Date | null>(null);
  const [phenomenon_times, setPhenomenonTimes] = useState<any[]>([]);
  const [result_times, setResultTimes] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    if (frostServerPort !== null) {
      fetchObservations();
    } else {
      fetchFrostPort();
    }
    setLoading(false);
  }, [frostServerPort]);

  const data = {
    labels: phenomenon_times,
    datasets: [
      {
        label: "Observation",
        data: result_times,
        backgroundColor: "#1976D2",
      },
    ],
  };
  const options = {
    responsive: true,
    elements: {
      line: {
        borderColor: "#1976D2",
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Observations",
      },
    },
  };

  const fetchObservations = () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
    axios
      .get(
        `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Datastreams(${id})/Observations?$orderby=phenomenonTime`,
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
          setPhenomenonTimes(
            res?.data.value
              .map(
                (item: any) =>
                  format(new Date(item.phenomenonTime), "dd.MM.yyyy HH:mm"),
                {
                  timeZone: "Europe/Rome",
                }
              )
              .slice(0, 50)
          );
          setResultTimes(
            res?.data.value.map((item: any) => item.result).slice(0, 50)
          );
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error Getting Things");
      });
  };

  const filterObservations = async () => {
    try {
      const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
      const obs_fetched = await axios.get(
        `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Datastreams(${id})/Observations?$orderby=phenomenonTime`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const fetched_observation = obs_fetched.data.value;

      if (start_date && end_date) {
        const filteredObservations = fetched_observation.filter(
          (item: any) =>
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

        setObservations(filteredObservations);
        setPhenomenonTimes(
          filteredObservations
            .map((item: any) =>
              format(new Date(item.phenomenonTime), "dd.MM.yyyy HH:mm", {
                timeZone: "Europe/Rome",
              })
            )
            .slice(0, 50)
        );

        setResultTimes(
          filteredObservations.map((item: any) => item.result).slice(0, 50)
        );
      }
    } catch (error) {
      console.error("Error fetching observations:", error);
    }
  };

  const handleChangeStartDate = (newValue: Date | null) => {
    setStartDate(newValue);
  };

  const handleChangeEndDate = (newValue: Date | null) => {
    setEndDate(newValue);
  };

  const getCsvData = () => {
    const csvData = [["ID", "Result", "Phenomenom Time"]];
    let i;

    if (observations.length > 0) {
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
    } else if (observations.length > 0) {
      for (i = 0; i < Object.keys(observations).length; i += 1) {
        csvData.push([
          `${observations[i]["@iot.id"]}`,
          `${observations[i].result}`,
          format(new Date(observations[i].phenomenonTime), "dd.MM.yyyy HH:mm", {
            timeZone: "Europe/Rome",
          }),
        ]);
      }
    } else {
      csvData.push(["No Data"]);
    }

    return csvData;
  };

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  return (
    <>
      {isLoading ? (
        "Loading.."
      ) : (
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
                  backgroundColor: isGraphButtonSelected
                    ? "#233044"
                    : "#cccccc",
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
                  backgroundColor: isGraphButtonSelected
                    ? "#cccccc"
                    : "#233044",
                  color: isGraphButtonSelected ? "#000000" : "#ffffff",
                }}
              >
                Graph View
              </Button>
            </Grid>

            {/* Right side button */}
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
                disabled={
                  start_date && end_date && start_date > end_date ? true : false
                }
                variant="contained"
                endIcon={<SaveAltIcon />}
                style={{
                  backgroundColor:
                    start_date && end_date && start_date > end_date
                      ? "#cccccc"
                      : "",
                  color:
                    start_date && end_date && start_date > end_date
                      ? "#000000"
                      : "",
                }}
              >
                <CSVLink
                  filename="observation.csv"
                  data={getCsvData()}
                  style={{
                    color: "#ffffff",
                    textDecoration: "none",
                    backgroundColor: "#1976D2",
                  }}
                >
                  Download CSV
                </CSVLink>
              </Button>
            </Grid>
          </Grid>

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
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <DateTimePicker
                    label="Start Datetime"
                    inputFormat="dd.MM.yyyy HH:mm"
                    value={start_date}
                    onChange={handleChangeStartDate}
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
                    onChange={handleChangeEndDate}
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
                        fetchObservations();
                      }}
                    >
                      Clear Filter
                    </Button>
                  </Box>
                </Grid>
              )}
              <Grid item xs={12} md={12} mt={3}>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    disabled={
                      !start_date || !end_date || start_date > end_date
                        ? true
                        : false
                    }
                    variant="contained"
                    style={{
                      backgroundColor:
                        !start_date || !end_date ? "#cccccc" : "",
                      color: !start_date || !end_date ? "#000000" : "",
                    }}
                    onClick={filterObservations}
                  >
                    Filter Data
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={12} mt={2}></Grid>
            </Grid>
          </LocalizationProvider>
          <Line options={options} data={data} />
        </>
      )}
    </>
  );
}

export default GraphObservationsPerDatastream;
