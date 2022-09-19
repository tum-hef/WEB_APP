import { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import ContentBar from "../components/ContentBar";
import { Button } from "@mui/material";
import LinkCustom from "../components/LinkCustom";
import { useParams } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
const Datastreams = () => {
  const [datastreans, setDatastreams] = useState([]);
  const { id } = useParams<{ id: string }>();

  const getDatastreams = async () => {
    try {
      const response = await axios.get(
        `https://iot.hef.tum.de/frost/v1.0/Things(${id})/Datastreams`
      );
      console.log(response.data);
      setDatastreams(response.data.value);
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
        <a href={row.unitOfMeasurement.definition}
        style={{
          textDecoration: "none",
          
        }}
        >Link</a>
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
      name: "Observervation",
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
    <ContentBar>
      <DataTable
        title="Datastreams"
        columns={columns}
        data={datastreans}
        pagination={true}
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 15]}
      />
    </ContentBar>
  );
};

export default Datastreams;
