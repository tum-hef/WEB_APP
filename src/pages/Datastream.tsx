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
interface ApiResponse {
  success: boolean;
  PORT?: number;
  message?: string;
  error_code?: number;
}
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
      : userInfo?.preferred_username;
    const group_id = localStorage.getItem("group_id");
  
    if (!email || !group_id) {
      toast.error("User email and group ID are required.");
      return;
    }
  
    try {
      const response = await axios.post<ApiResponse>(
        `${backend_url}/frost-server`,
        {
          user_email: email,
          group_id: group_id
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Include Keycloak token
          },
          validateStatus: (status) => true,
        }
      );
      if (response.status === 200 && response.data.PORT) {
        setFrostServerPort(response.data.PORT);
      } else {
        toast.error(response.data.message || "Failed to fetch Frost Server port.");
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const errorResponse = error.response?.data as ApiResponse;
        toast.error(errorResponse.message || "An error occurred.");
      } else {
        toast.error("An unexpected error occurred.");
      }
      console.error("Error fetching Frost Server port:", error);
    }
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
