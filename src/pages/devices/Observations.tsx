import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Breadcrumbs,
  Typography,
} from "@mui/material";
import LinkCustom from "../../components/LinkCustom";

import Dashboard from "../../components/DashboardComponent";
import { useKeycloak } from "@react-keycloak/web";
import { ToastContainer } from "react-toastify";
import { useParams } from "react-router-dom";
import TableObservationPerDatastream from "../../components/TableObservationPerDatastream";
import GraphObservationsPerDatastream from "../../components/GraphObservationsPerDatastream";

const Observations = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [datastream, setDataStream] = useState<any[]>([]);

  const { id } = useParams<{ id: string }>();
  const { device_id } = useParams<{ device_id: string }>();

  const [observations, setObservations] = useState<any[]>([]);
  const [isGraphButtonSelected, setIsGraphButtonSelected] = useState(false);

  const fetchObservations = () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
    const isDev = process.env.REACT_APP_IS_DEVELOPMENT === 'true';  
    axios
      .get(
        isDev ?  `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Datastreams(${id})/Observations?$orderby=phenomenonTime%20desc` :   `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Datastreams(${id})/Observations?$orderby=phenomenonTime%20desc`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        if (res.status === 200 && res.data.value) {
          setDataStream(res.data.value);
        }
      });
  };

  const fetchFrostPort = async () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL;
    const email =
    localStorage.getItem("selected_others") === "true"
      ? localStorage.getItem("user_email")
      : userInfo?.preferred_username;

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
      fetchObservations();
    } else {
      fetchFrostPort();
    }
  }, [frostServerPort]);

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
        <LinkCustom to="/devices">Devices</LinkCustom>
        <LinkCustom to={`/devices/${device_id}/datastreams`}>
          Datastreams of Device #{device_id}
        </LinkCustom>
        <Typography color="text.primary">
          Observations for Datastream #{id}{" "}
        </Typography>
      </Breadcrumbs>

      {isGraphButtonSelected ? (
        <GraphObservationsPerDatastream
          token={token}
          id={id}
          frostServerPort={frostServerPort}
          fetchFrostPort={fetchFrostPort}
          isGraphButtonSelected={isGraphButtonSelected}
          setIsGraphButtonSelected={setIsGraphButtonSelected}
        />
      ) : (
        <TableObservationPerDatastream
          datastream={datastream}
          setDataStream={setDataStream}
          observations={observations}
          id={id}
          frostServerPort={frostServerPort}
          token={token}
          setObservations={setObservations}
          isGraphButtonSelected={isGraphButtonSelected}
          setIsGraphButtonSelected={setIsGraphButtonSelected}
        />
      )}
    </Dashboard>
  );
};

export default Observations;
