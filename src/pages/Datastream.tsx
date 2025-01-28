import { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { Button } from "@mui/material";
import LinkCustom from "../components/LinkCustom";
import { useParams } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { useHistory } from "react-router-dom";
import Dashboard from "../components/DashboardComponent";
import { useKeycloak } from "@react-keycloak/web";
import { ToastContainer, toast } from "react-toastify";
const Datastreams = () => {
  const [datastreans, setDatastreams] = useState([]);
  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const history = useHistory();
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();

  const getDatastreams = async () => {
    try {
      const backend_url = process.env.REACT_APP_FROST_URL; 
      const isDev = process.env.REACT_APP_IS_DEVELOPMENT === 'true';  
      console.log("hhhhhjk",frostServerPort) 
      const url = isDev ?  `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Things(${id})/Datastreams` : `https://${frostServerPort}-${backend_url}/FROST-Server/v1.0/Things(${id})/Datastreams`

      console.log(url);
      axios
        .get(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          console.log(response);
          if (response.status === 200 && response.data.value) {
            setDatastreams(response.data.value);
          }
        })
        .catch((err) => {
          console.log(err);
          toast.error("Error Getting Last Update Time");
        });
    } catch (error) {
      console.log(error);
    }
  };

  const fetchFrostPort = async () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL;
    const email = localStorage.getItem("selected_others") === "true"
    ? localStorage.getItem("user_email")
    : userInfo?.preferred_username
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
    if (frostServerPort !== null) { 
      console.log("frostServerPort",frostServerPort)
      getDatastreams();
    } else {
      fetchFrostPort();
    }
    setLoading(false);
  }, [frostServerPort]);

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
        <LinkCustom to={`/observations/${row["@iot.id"]}`}>
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
