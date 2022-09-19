import { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import ContentBar from "../components/ContentBar";
import { format } from "date-fns";
import { useParams } from "react-router-dom";
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

const Observervation = () => {
  const [datastreans, setDatastreams] = useState([]);
  const { id } = useParams<{ id: string }>();
  const getObservation = async () => {
    try {
      const response = await axios.get(
        `https://iot.hef.tum.de/frost/v1.0/Datastreams(${id})/Observations`
      );
      console.log(response.data);
      setDatastreams(response.data.value);
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

  return (
    <ContentBar>
      <DataTable
        title="Observation"
        columns={columns}
        data={datastreans}
        pagination={true}
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 15]}
      />
    </ContentBar>
  );
};

export default Observervation;
