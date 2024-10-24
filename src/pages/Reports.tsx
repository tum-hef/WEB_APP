import { useState, useEffect } from "react";
import axios from "axios";
import DataTable, { ExpanderComponentProps } from "react-data-table-component";
import { Breadcrumbs, Button, Typography } from "@mui/material";
import LinkCustom from "../components/LinkCustom";

import Dashboard from "../components/DashboardComponent";
import { useKeycloak } from "@react-keycloak/web";
import { ToastContainer, toast } from "react-toastify";
import { format } from "date-fns";
const Reports = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;
  console.log(token);

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [finalLogs, setFinalLogs] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      let storedDatastreams: any[] = [];
      let storedLogs: any[] = [];

      const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
      console.log(backend_url);
      const isDev = process.env.REACT_APP_IS_DEVELOPMENT; 
      const url = isDev ?  `${process.env.REACT_APP_BACKEND_URL_ROOT}:${frostServerPort}/FROST-Server/v1.0/Datastreams` : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Things`
      // First request
      const datastreamRes = await axios.get(
        url,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle the first request
      if (datastreamRes.status === 200 && datastreamRes.data.value) {
        console.log(datastreamRes.data.value);
        datastreamRes.data.value.forEach((datastream: any) => {
          // some phenomenonTime are like this:  2020-08-27T12:27:03.829Z/2020-10-02T11:00:50.359Z

          // if they are in this format, we need to split them and get the first one
          let phenomenonTime = datastream["phenomenonTime"];
          // but do not filter only by / because some phenomenonTime are like this: 2020-08-27T12:27:03.829Z
          // filter if they are two dates separated by /

          const iso8601Pattern =
            /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z)\/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z)/;

          if (iso8601Pattern.test(phenomenonTime)) {
            phenomenonTime = phenomenonTime.split("/")[0];
            // format  that date to a readable format
            phenomenonTime = format(
              new Date(phenomenonTime),
              "yyyy-MM-dd HH:mm:ss"
            );
            datastream["phenomenonTime"] = phenomenonTime;
          }

          storedDatastreams.push({
            id: datastream["@iot.id"],
            method: "CREATE",
            attribute: "Datastream",
            attribute_id: datastream["@iot.id"],
            frost_port: frostServerPort,
            created_at: datastream["phenomenonTime"],
          });
        });
      }

      const logRes = await axios.get(`http://localhost:4500/logs`, {
        params: {
          keycloak_id: userInfo?.sub,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (logRes.status === 200 && logRes.data && logRes.data.logs) {
        console.log(logRes.data.logs);

        storedLogs = logRes.data.logs.map((log: any) => {
          return {
            id: log.id,
            method: log.method,
            attribute: log.attribute,
            attribute_id: log.attribute_id,
            frost_port: log.frost_port,
            created_at: format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
          };
        });

        setFinalLogs([...storedDatastreams, ...storedLogs]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error Getting Datastreams");
    }
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
    if (frostServerPort !== null) {
      fetchData();
    } else {
      fetchFrostPort();
    }
  }, [frostServerPort]);

  const columns = [
    {
      name: "ID",
      selector: (row: any) => row.id,
      sortable: true,
      width: "10%",
    },
    {
      name: "Method",
      selector: (row: any) => row.method,
      sortable: true,
      width: "10%",
    },
    {
      name: "Attribute Type",
      selector: (row: any) => row.attribute,
      sortable: true,
      width: "10%",
    },
    {
      name: "Attribute ID",
      selector: (row: any) => row.attribute_id,
      sortable: true,
      width: "10%",
    },
    {
      name: "FROST PORT",
      selector: (row: any) => row.frost_port,
      sortable: true,
      width: "20%",
    },
    {
      name: "Timestamp",
      selector: (row: any) => row.created_at,
      sortable: true,
      width: "40%",
    },
  ];

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

      <DataTable
        title="Logs"
        columns={columns}
        data={finalLogs}
        pagination={true}
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 15]}
      />
    </Dashboard>
  );
};

export default Reports;
