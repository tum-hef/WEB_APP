import { Box, Button, Grid, TextField, useMediaQuery } from "@mui/material";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { CSVLink } from "react-csv";
import { MobileDateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
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
import { format } from "date-fns";
import axios from "axios";
import { toast } from "react-toastify";
import SaveAltIcon from "@mui/icons-material/SaveAlt";

// allow using process.env without installing node types
declare const process: any;

const formatLocalDateTime = (value: string | Date) =>
  format(new Date(value), "dd.MM.yyyy HH:mm");

function GraphObservationsPerDatastream({
  token,
  frostServerPort,
  id,
  fetchFrostPort,
  isGraphButtonSelected,
  setIsGraphButtonSelected,
  datastreamMetadata,
}: any) {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [start_date, setStartDate] = useState<any | null>(null);
  const [end_date, setEndDate] = useState<any | null>(null);
  const [phenomenon_times, setPhenomenonTimes] = useState<any[]>([]);
  const [result_times, setResultTimes] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [chartWidth, setChartWidth] = useState(0);

  const observedPropertyLabel =
    datastreamMetadata?.ObservedProperty?.name ||
    datastreamMetadata?.ObservedProperty?.description ||
    datastreamMetadata?.name ||
    "Observation";

  const data = {
    labels: phenomenon_times,
    datasets: [
      {
        label: observedPropertyLabel,
        data: result_times,
        backgroundColor: "#1976D2",
        borderColor: "#1976D2",
        borderWidth: 3,
        pointStyle: "line",
        pointBackgroundColor: "#1976D2",
        pointBorderColor: "#1976D2",
      },
    ],
  };
  // derive unit from datastream metadata (unitOfMeasurement preferred)
  const unit =
    datastreamMetadata?.unitOfMeasurement?.symbol ||
    datastreamMetadata?.unitOfMeasurement?.name ||
    datastreamMetadata?.ObservedProperty?.definition ||
    "";

  useEffect(() => {
    if (!chartContainerRef.current) {
      return;
    }

    const element = chartContainerRef.current;
    const updateWidth = () => {
      setChartWidth(element.clientWidth || 0);
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const tickPixelSpacing = isMobile ? 110 : 90;
  const xAxisTickLimit = Math.max(
    isMobile ? 4 : 6,
    Math.floor(chartWidth / tickPixelSpacing)
  );
  const xAxisTickStep =
    phenomenon_times.length > xAxisTickLimit
      ? Math.ceil(phenomenon_times.length / xAxisTickLimit)
      : 1;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: {
        borderColor: "#1976D2",
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          color: "#1976D2",
          font: {
            weight: 'bold',
            size: 12,
          },
          usePointStyle: true,
          pointStyleWidth: 36,
          boxWidth: 36,
          boxHeight: 2,
          padding: 15,
          generateLabels(chart: any) {
            const defaultLabels =
              ChartJS.defaults.plugins.legend.labels.generateLabels(chart);

            return defaultLabels.map((label: any) => ({
              ...label,
              pointStyle: "line",
              strokeStyle: "#1976D2",
              fillStyle: "#1976D2",
              lineWidth: 5,
            }));
          },
        }
      },
      title: {
        display: true,
        text: datastreamMetadata?.name || datastreamMetadata?.name || "Observations",
        font: {
          weight: 'bold',
          size: 16
        }
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: unit || "Value",
          font: {
            weight: 'bold',
            size: 13
          },
          padding: { top: 10, bottom: 10 }
        },
        ticks: {
          font: {
            size: 12
          }
        },
      },
      x: {
        title: {
          display: true,
          text: "Time",
          font: {
            weight: 'bold',
            size: 13
          },
          padding: { top: 8 }
        },
        ticks: {
          font: {
            size: 11
          },
          autoSkip: true,
          maxTicksLimit: xAxisTickLimit,
          maxRotation: 0,
          minRotation: 0,
          padding: 6,
          callback: function (_tickValue: any, index: number) {
            const label = phenomenon_times[index];

            if (!label) {
              return "";
            }

            const isFirst = index === 0;
            const isLast = index === phenomenon_times.length - 1;
            const shouldShowTick =
              isFirst || isLast || index % xAxisTickStep === 0;

            if (!shouldShowTick) {
              return "";
            }

            const [date, time] = label.split(" ");
            return [date, time];
          },
        },
        grid: {
          drawTicks: true,
        },
      },
    },
  };
 
  const fetchObservations = useCallback(() => {
    const backend_url = process.env.REACT_APP_FROST_URL;
    axios
      .get(
        `https://${frostServerPort}-${backend_url}/FROST-Server/v1.0/Datastreams(${id})/Observations?$orderby=phenomenonTime desc&$top=50`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        if (res.status === 200 && res.data.value) {
          const latestSorted = [...res.data.value].sort(
            (a: any, b: any) =>
              new Date(a.phenomenonTime).getTime() -
              new Date(b.phenomenonTime).getTime()
          );

          setObservations(latestSorted);
          setPhenomenonTimes(
            latestSorted.map((item: any) =>
              formatLocalDateTime(item.phenomenonTime)
            )
          );
          setResultTimes(latestSorted.map((item: any) => item.result));
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error Getting Things");
      });
  }, [frostServerPort, id, token]);

  useEffect(() => {
    setLoading(true);
    if (frostServerPort !== null) {
      fetchObservations();
    } else {
      fetchFrostPort();
    }
    setLoading(false);
  }, [frostServerPort, fetchFrostPort, fetchObservations]);

  async function fetchAllObservations(
    baseUrl: string,
    token: string
  ): Promise<any[]> {
    let all: any[] = [];
    let url: string | null = baseUrl;
  
    while (url) {
      const res :any= await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      all = all.concat(res.data.value);
      url = res.data["@iot.nextLink"] || null;
  
      // Fix relative URLs
      if (url && url.startsWith("/")) {
        const urlObj = new URL(baseUrl);
        url = `${urlObj.origin}${url}`;
      }
    }
  
    return all;
  }

  const filterObservations = async () => {
    try {
      const backend_url = process.env.REACT_APP_FROST_URL;
  
      const startDate = new Date(start_date).toISOString();
      const endDate = new Date(end_date).toISOString();
  
      const filterQuery = `phenomenonTime ge ${startDate} and phenomenonTime le ${endDate}`;
      const baseUrl = `https://${frostServerPort}-${backend_url}/FROST-Server/v1.0/Datastreams(${id})/Observations?$filter=${encodeURIComponent(
        filterQuery
      )}&$orderby=phenomenonTime&$top=100`;
  
      const observations = await fetchAllObservations(baseUrl, token);

  
      // Optional: sort by time in case FROST doesn't guarantee it
      const sorted = observations.sort(
        (a, b) =>
          new Date(a.phenomenonTime).getTime() -
          new Date(b.phenomenonTime).getTime()
      );
  
      // Set to chart
      setObservations(sorted);
      setPhenomenonTimes(
        sorted.map((item: any) => formatLocalDateTime(item.phenomenonTime))
      );
      setResultTimes(sorted.map((item: any) => item.result));
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
        const localTime = formatLocalDateTime(observations[i].phenomenonTime);

        csvData.push([
          `${observations[i]["@iot.id"]}`,
          `${observations[i].result}`,
          localTime,
        ]);
      }
    } else if (observations.length > 0) {
      for (i = 0; i < Object.keys(observations).length; i += 1) {
        csvData.push([
          `${observations[i]["@iot.id"]}`,
          `${observations[i].result}`,
          formatLocalDateTime(observations[i].phenomenonTime),
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
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              {/* Left side buttons - Table View / Graph View */}
              <Grid
                item
                xs={12}
                sm="auto"
                sx={{ display: "flex", gap: 1 }}
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

              {/* Center - Filter Fields */}
              <Grid item xs={12} sm="auto" sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", position: "relative", zIndex: 1 }}>
                <MobileDateTimePicker
                  label="Start Datetime"
                  inputFormat="dd.MM.yyyy HH:mm"
                  value={start_date}
                  onChange={handleChangeStartDate}
                  renderInput={(params) => <TextField {...params} size="small" />}
                />
                <MobileDateTimePicker
                  label="End Datetime"
                  value={end_date}
                  inputFormat="dd.MM.yyyy HH:mm"
                  onChange={handleChangeEndDate}
                  renderInput={(params) => <TextField {...params} size="small" />}
                />
                {start_date && end_date && (
                  <Button
                    variant="contained"
                    style={{
                      color: "red",
                      backgroundColor: "#ffffff",
                      border: "1px solid red"
                    }}
                    onClick={() => {
                      setStartDate(null);
                      setEndDate(null);
                      fetchObservations();
                    }}
                  >
                    Clear
                  </Button>
                )}
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

              {/* Right side - Download CSV Button */}
              <Grid item xs={12} sm="auto" sx={{ ml: "auto" }}>
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
          </LocalizationProvider>
          <Box
            ref={chartContainerRef}
            sx={{
              width: "100%",
              maxWidth: "100%",
              height: { xs: 360, md: 480 },
              overflow: "hidden",
            }}
          >
            <Line
              options={options as any}
              data={data}
              style={{ width: "100%", height: "100%" }}
            />
          </Box>
        </>
      )}
    </>
  );
}

export default GraphObservationsPerDatastream;
