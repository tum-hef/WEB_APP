import { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import ContentBar from "../components/ContentBar";
import { Button } from "@mui/material";
import LinkCustom from "../components/LinkCustom";
import { useParams } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { useHistory } from "react-router-dom";
import Dashboard from "./Dashboard";
const Datastreams = () => {
  const [datastreans, setDatastreams] = useState([]);
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const getDatastreams = async () => {
    try {
      await axios
        .get(`https://iot.hef.tum.de/frost/v1.0/Things(${id})/Datastreams`)
        .then((response) => {
          console.log(response.data);
          setDatastreams(response.data.value);
        })
        .catch((error) => {
          console.log(error);
          // check if 404
          if (error.response.status === 404) {
            console.log("404");
            history.push("/404");
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDatastreams();
  }, []);

  const columns = [
    {
      name: "ID",
      selector: (row: any) => `${row["@iot.id"]}`,

      width: "10%",
      sortable: true,
    },
    {
      name: "Name",
      selector: (row: any) => row.name,
      sortable: true,
    },
    {
      name: "Unit of Measurment",
      selector: (row: any) => (
        <a
          href={row.unitOfMeasurement.definition}
          style={{
            textDecoration: "none",
          }}
        >
          {row.unitOfMeasurement.name !== "-"
            ? row.unitOfMeasurement.name
            : "Not specified"}
        </a>
      ),
      sortable: true,
    },
    {
      name: "Description",
      selector: (row: any) => row.description,
      sortable: true,
      width: "40%",
    },
    {
      name: "Observations",
      selector: (row: any) => (
        <LinkCustom to={`/observation/${row["@iot.id"]}`}>
          <Button variant="contained" color="primary">
            <SearchIcon />
          </Button>
        </LinkCustom>
      ),
      sortable: true,
    },
  ];

  return (
    <Dashboard>
      <DataTable
        title="Datastreams"
        columns={columns}
        data={datastreans}
        pagination={true}
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 15]}
      />
    </Dashboard>
  );
};

export default Datastreams;
