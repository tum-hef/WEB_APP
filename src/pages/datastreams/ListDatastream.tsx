import { useState, useEffect } from "react";
import axios from "axios";
import DataTable, { ExpanderComponentProps } from "react-data-table-component";
import { Breadcrumbs, Button, Typography } from "@mui/material";
import LinkCustom from "../../components/LinkCustom";

import Dashboard from "../../components/DashboardComponent";
import { useKeycloak } from "@react-keycloak/web";
import { ToastContainer, toast } from "react-toastify";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Swal from "sweetalert2";
import ReactGA from "react-ga4";
import { GAactionsDataStreams } from "../../utils/GA";

const ListDatastream = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [datastreams, setDatastreams] = useState<any[]>([]);

  const fetchDatastreams = () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT; 
    const isDev = process.env.REACT_APP_IS_DEVELOPMENT === 'true';  
    axios
      .get( isDev  ? `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Datastreams` :  `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Datastreams`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.status === 200 && res.data.value) {
          console.log(res.data.value);
          setDatastreams(res.data.value);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error Getting Datastreams");
      });
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
      const res = await axios.post(
        `${backend_url}/frost-server`,
        { user_email: email, group_id: group_id }, // ✅ Adding group_id to the request body
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Added Authorization header
          },
        }
      );
  
      if (res.status === 200 && res.data.PORT) {
        setFrostServerPort(res.data.PORT);
      }
    } catch (error) {
      console.error("Error fetching Frost Server Port:", error);
      toast.error("An error occurred while fetching the Frost Server port.");
    }
  };
  

  useEffect(() => {
    ReactGA.event({
      category: GAactionsDataStreams.category,
      action: GAactionsDataStreams.action,
      label: GAactionsDataStreams.label,
    });

    if (frostServerPort !== null) {
      fetchDatastreams();
    } else {
      fetchFrostPort();
    }
  }, [frostServerPort]);

  const columns = [
    {
      name: "ID",
      selector: (row: any) => `${row["@iot.id"]}`,
      sortable: true,
      grow: 1
    },
    {
      name: "Name",
      selector: (row: any) => row.name,
      sortable: true,
      grow: 2
    },
    {
      name: "Description",
      selector: (row: any) => row.description,
      sortable: true,
      width: "25%", // Allocate 25% for the Description column
    },
    {
      name: "Edit",
      selector: (row: any) => (
        <EditOutlinedIcon
          style={{
            cursor: "pointer",
            color: "#233044",
          }}
          onClick={() => {
            /* Your edit logic here */
          }}
        />
      ),
      sortable: true,
      width: "15%", // Allocate 15% for the Edit column
    },
    {
      name: "Delete",
      selector: (row: any) => (
        <DeleteForeverOutlinedIcon
          style={{
            cursor: "pointer",
            color: "red",
          }}
          onClick={() => {
            /* Your delete logic here */
          }}
        />
      ),
      sortable: true,
      width: "15%", // Allocate 15% for the Delete column
    },
    {
      name: "Export Data",
      selector: (row: any) => (
        <FileDownloadIcon
          style={{
            cursor: "pointer",
            color: "black",
          }}
          onClick={() => {
            const blob = new Blob([JSON.stringify(row, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${row.name || "data"}.json`;
            link.click();
            URL.revokeObjectURL(url);
          }}
        />
      ),
      sortable: true,
      width: "10%", // Allocate 10% for the Export Data column
    },
  ];

  const ExpandedComponent: React.FC<ExpanderComponentProps<any>> = ({
    data,
  }) => {
    return (
      <div
        style={{
          margin: "10px",
        }}
      >
        <div>
          <b>Name: </b>
          {data.name}
        </div>
        <div>
          <b>Description: </b>
          {data.description}
        </div>
      </div>
    );
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
      <Breadcrumbs
        aria-label="breadcrumb"
        style={{
          marginBottom: "10px",
        }}
      >
        <LinkCustom to="/">Data Space</LinkCustom>
        <LinkCustom to="/frost_entities">Data Items</LinkCustom>
        <Typography color="text.primary">Datastream</Typography>
      </Breadcrumbs>

      <LinkCustom to="/datastreams/store">
        <Button
          variant="contained"
          color="primary"
          style={{
            marginBottom: "10px",
          }}
        >
          Create{" "}
        </Button>
      </LinkCustom>
      <DataTable
        title="Datastreams"
        columns={columns}
        data={datastreams}
        expandableRows
        expandableRowsComponent={ExpandedComponent}
        pagination={true}
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 15]} 
        responsive={true}
      />
    </Dashboard>
  );
};

export default ListDatastream;
