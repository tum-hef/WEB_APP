import { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import ContentBar from "../components/ContentBar";
import { format } from "date-fns";
import { useParams } from "react-router-dom";
import { Box, Button, Grid, TextField } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";

import {
  DatePicker,
  DateTimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { CSVLink } from "react-csv";
import { Line } from "react-chartjs-2";
import { useHistory } from "react-router-dom";

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
import Dashboard from "./Dashboard";
import { useKeycloak } from "@react-keycloak/web";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
export const options = {
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

const Observervation = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;
  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [datastreans, setDatastreams] = useState<any[]>([]);
  const { id } = useParams<{ id: string }>();
  const [start_date, setStartDate] = useState<Date | null>(null);
  const [end_date, setEndDate] = useState<Date | null>(null);
  const [phenomenon_times, setPhenomenonTimes] = useState([]);
  const [result_times, setResultTimes] = useState([]);
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const handleChangeStartDate = (newValue: any) => {
    setStartDate(newValue);

    if (start_date && end_date) {
      const formatted_start_date = start_date.toISOString();
      const formatted_end_date = end_date.toISOString();

      const url =
        `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Datastreams(${id})/Observations?` +
        "$filter=phenomenonTime%20gt%20" +
        formatted_start_date +
        "%20and%20phenomenonTime%20lt%20" +
        formatted_end_date +
        "&$select=phenomenonTime,result&$top=1000&$orderby=phenomenonTime%20desc";

      axios
        .get(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response: any) => {
          console.log(response.data);
          setDatastreams(response.data.value);
          setPhenomenonTimes(
            response?.data.value
              .map((item: any) =>
                format(new Date(item.phenomenonTime), "dd.MM.yyyy HH:mm")
              )
              .slice(0, 10)
          );
          setResultTimes(
            response?.data.value.map((item: any) => item.result).slice(0, 10)
          );
        });
    }
  };
  const handleChangeEndDate = (newValue: any) => {
    setEndDate(newValue);

    if (start_date && end_date) {
      const formatted_start_date = start_date.toISOString();
      const formatted_end_date = end_date.toISOString();

      const url =
        `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Datastreams(${id})/Observations?` +
        "$filter=phenomenonTime%20gt%20" +
        formatted_start_date +
        "%20and%20phenomenonTime%20lt%20" +
        formatted_end_date +
        "&$select=phenomenonTime,result&$top=1000&$orderby=phenomenonTime%20desc";

      axios
        .get(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response: any) => {
          console.log(response.data);
          setDatastreams(response.data.value);
          setPhenomenonTimes(
            response?.data.value
              .map((item: any) =>
                format(new Date(item.phenomenonTime), "dd.MM.yyyy HH:mm")
              )
              .slice(0, 10)
          );
          setResultTimes(
            response?.data.value.map((item: any) => item.result).slice(0, 10)
          );
        });
    }
  };

  const fetchObservations = () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
    console.log(backend_url);
    axios
      .get(
        `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Datastreams(${id})/Observations?$top=100&$orderby=phenomenonTime%20desc`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        if (res.status === 200 && res.data.value) {
          setDatastreams(res.data.value);
          setPhenomenonTimes(
            res?.data.value
              .map((item: any) =>
                format(new Date(item.phenomenonTime), "dd.MM.yyyy HH:mm")
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

  const getCsvData = () => {
    const csvData = [["ID", "Result", "Phenomenom Time"]];
    let i;

    if (datastreans.length > 0 && start_date && end_date) {
      for (
        i = 0;
        i <
        Object.keys(
          datastreans.filter(
            (item: any) =>
              start_date &&
              end_date &&
              new Date(item.phenomenonTime).getTime() >= start_date.getTime() &&
              new Date(item.phenomenonTime).getTime() <= end_date.getTime()
          )
        ).length;
        i += 1
      ) {
        csvData.push([
          `${datastreans[i]["@iot.id"]}`,
          `${datastreans[i].result}`,
          format(new Date(datastreans[i].phenomenonTime), "dd.MM.yyyy HH:mm"),
        ]);
      }
    } else if (datastreans.length > 0 && !start_date && !end_date) {
      for (i = 0; i < Object.keys(datastreans).length; i += 1) {
        csvData.push([
          `${datastreans[i]["@iot.id"]}`,
          `${datastreans[i].result}`,
          format(new Date(datastreans[i].phenomenonTime), "dd.MM.yyyy HH:mm"),
        ]);
      }
    } else {
      csvData.push(["No Data"]);
    }

    return csvData;
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

  useEffect(() => {
    setLoading(true);
    if (frostServerPort !== null) {
      fetchObservations();
    } else {
      fetchFrostPort();
    }
    setLoading(false);
  }, [frostServerPort]);

  const columns = [
    {
      name: "ID",
      selector: (row: any) => `${row["@iot.id"]}`,

      sortable: true,
    },
    {
      name: "Phenomenon Time",
      selector: (row: any) =>
        format(new Date(row.phenomenonTime), "dd.MM.yyyy hh:mm:ss"),
      sortable: true,
    },
    {
      name: "Result",
      selector: (row: any) => row.result,
      sortable: true,
    },
  ];
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
      <CSVLink filename="observation.csv" data={getCsvData()}>
        {" "}
        <Button variant="contained">Download CSV</Button>
      </CSVLink>
      {result_times.length > 0 && <Line options={options} data={data} />}

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
          <Grid item xs={12} md={12} mt={2}></Grid>
        </Grid>
      </LocalizationProvider>
      <DataTable
        title="Observation"
        columns={columns}
        data={datastreans}
        pagination={true}
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 20]}
      />
    </Dashboard>
  );
};

export default Observervation;
