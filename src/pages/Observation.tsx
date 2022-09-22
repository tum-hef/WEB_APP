import { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import ContentBar from "../components/ContentBar";
import { format } from "date-fns";
import { useParams } from "react-router-dom";
import { Box, Button, Grid, TextField } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Export from "react-data-table-component";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
    },
  },
};

const Observervation = () => {
  const [datastreans, setDatastreams] = useState([]);
  const { id } = useParams<{ id: string }>();
  const [start_date, setStartDate] = useState<Date | null>(null);
  const [end_date, setEndDate] = useState<Date | null>(null);
  const [phenomenon_times, setPhenomenonTimes] = useState([]);
  const [result_times, setResultTimes] = useState([]);

  const handleChangeStartDate = (newValue: any) => {
    setStartDate(newValue);
  };
  const handleChangeEndDate = (newValue: any) => {
    setEndDate(newValue);
  };
  const getObservation = async () => {
    try {
      const response = await axios.get(
        `https://iot.hef.tum.de/frost/v1.0/Datastreams(${id})/Observations?$top=100&$orderby=phenomenonTime%20desc`
      );
      console.log(response.data);
      setDatastreams(response.data.value);
      setPhenomenonTimes(
        response?.data.value
          .map((item: any) =>
            format(new Date(item.phenomenonTime), "dd.MM.yyyy HH:mm:ss")
          )
          .slice(0, 10)
      );
      setResultTimes(
        response?.data.value.map((item: any) => item.result).slice(0, 10)
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getObservation();
  }, []);

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
    <ContentBar>
      {result_times.length > 0 && <Bar options={options} data={data} />}

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
              <DatePicker
                label="Start Date"
                inputFormat="dd.MM.yyyy"
                value={start_date}
                onChange={handleChangeStartDate}
                renderInput={(params) => <TextField {...params} />}
              />
            </Box>
          </Grid>{" "}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <DatePicker
                label="End Date"
                value={end_date}
                inputFormat="dd.MM.yyyy"
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
        data={
          start_date && end_date
            ? datastreans.filter((data: any) => {
                const date = new Date(data.phenomenonTime).getTime();
                return (
                  date >= start_date.getTime() && date <= end_date.getTime()
                );
              })
            : datastreans
        }
        pagination={true}
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 20]}
      />
    </ContentBar>
  );
};

export default Observervation;
