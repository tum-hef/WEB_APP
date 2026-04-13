import React, { useState, useEffect } from "react";
import axios from "axios";
import { Breadcrumbs, Typography } from "@mui/material";
import LinkCustom from "../../components/LinkCustom";
import BiotechSharpIcon from "@mui/icons-material/BiotechSharp";
import Dashboard from "../../components/DashboardComponent";
import { useKeycloak } from "@react-keycloak/web";
import { ToastContainer, toast } from "react-toastify";
import { useParams } from "react-router-dom";
import DataTableCardV2 from "../../components/DataGridServerSide";

const DESCRIPTION_WORD_LIMIT = 7;

const getDescriptionPreview = (value: string) => {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length <= DESCRIPTION_WORD_LIMIT) return value;
  return `${words.slice(0, DESCRIPTION_WORD_LIMIT).join(" ")}...`;
};

const DescriptionCellRenderer = ({ value }: { value?: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const fullText = String(value ?? "");
  const wordCount = fullText.trim().split(/\s+/).filter(Boolean).length;
  const isExpandable = wordCount > DESCRIPTION_WORD_LIMIT;
  const displayText = isExpanded || !isExpandable ? fullText : getDescriptionPreview(fullText);

  return (
    <span title={fullText}>
      {displayText}
      {isExpandable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded((prev) => !prev);
          }}
          style={{
            marginLeft: 6,
            border: "none",
            background: "transparent",
            color: "#1976d2",
            cursor: "pointer",
            padding: 0,
            fontSize: "0.85rem",
            fontWeight: 500,
          }}
        >
          {isExpanded ? "Less" : "More"}
        </button>
      )}
    </span>
  );
};
const ListDatastreamPerDevice = () => {
  const { keycloak } = useKeycloak();
  const userInfo = keycloak?.idTokenParsed;
  const token = keycloak?.token;

  const [frostServerPort, setFrostServerPort] = useState<number | null>(null);
  const [datastream, setDataStream] = useState<any[]>([]);
  const [filterQuery, setFilterQuery] = useState("");
const [sortQuery, setSortQuery] = useState("");
const [page, setPage] = useState(0);
const [pageSize, setPageSize] = useState(10);
const [totalRows, setTotalRows] = useState(0);
const [pageLinks, setPageLinks] = useState<{ [key: number]: string }>({});
const [loading, setLoading] = useState(false);


  const { id } = useParams<{ id: string }>();

  const fetchThings = async (
  newPage = 0,
  newPageSize = pageSize,
  filter = filterQuery,
  sort = sortQuery
) => {
  if (frostServerPort === null) return;
  setLoading(true);

  const backend_url = process.env.REACT_APP_BACKEND_URL_ROOT;
  const isDev = process.env.REACT_APP_IS_DEVELOPMENT === "true";

  let url = isDev
    ? `${backend_url}:${frostServerPort}/FROST-Server/v1.0/Things(${id})/Datastreams`
    : `https://${frostServerPort}-${process.env.REACT_APP_FROST_URL}/FROST-Server/v1.0/Things(${id})/Datastreams`;

  if (pageLinks[newPage]) {
    url = pageLinks[newPage];
  }

  try {
    const res = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      params: !pageLinks[newPage] && {
        $top: newPageSize,
        $skip: newPage * newPageSize,
        $count: true,
        ...(filter && { $filter: filter }),
        ...(sort && { $orderby: sort }),
      },
    });

    setDataStream(res.data.value);
    if (res.data["@iot.count"]) setTotalRows(res.data["@iot.count"]);
    if (res.data["@iot.nextLink"]) {
      setPageLinks((prev) => ({
        ...prev,
        [newPage + 1]: res.data["@iot.nextLink"],
      }));
    }
  } catch {
    toast.error("Error Getting Datastreams");
  } finally {
    setLoading(false);
  }
};

  const fetchFrostPort = async () => {
    const backend_url = process.env.REACT_APP_BACKEND_URL;
    const email =
      localStorage.getItem("selected_others") === "true"
        ? localStorage.getItem("user_email")
        : userInfo?.preferred_username;
    const group_id = localStorage.getItem("group_id");

    if (email) {
      try {
        const response = await axios.post(
          `${backend_url}/frost-server`,
          { user_email: email, group_id: group_id },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200 && response.data.PORT) {
          setFrostServerPort(response.data.PORT);
        }
      } catch (error) {
        console.error("Error fetching Frost server port:", error);
        toast.error("Failed to fetch Frost server port. Please try again.");
      }
    }
  };

  useEffect(() => {
    if (frostServerPort !== null) {
      fetchThings(page, pageSize);
    } else {
      fetchFrostPort();
    }
  }, [frostServerPort]);

  const columnDefs = [
    {
      headerName: "ID",
      field: "@iot.id",
      sortable: true,
      flex: 1,
      valueGetter: (params: any) => params.data["@iot.id"]
    },
    {
      headerName: "Name",
      field: "name",
      sortable: true,
      flex: 2,
    },
    {
      headerName: "Description",
      field: "description",
      sortable: true,
      flex: 3,
      wrapText: true,
      autoHeight: true,
      filter: "agTextColumnFilter",
      cellStyle: { whiteSpace: "normal" },
        cellRenderer: (params: any) => <DescriptionCellRenderer value={params.value} />,
    },
       {
  headerName: "Time Range",
  field: "phenomenonTime",
  filter: false,
  sortable: true,

  valueFormatter: (params: any) => {
    if (!params.value) return "";

    const [start, end] = (params.value as string).split("/");

    const formatUTC = (dateStr: string) => {
      const d = new Date(dateStr);
      const pad = (n: number) => String(n).padStart(2, "0");

      return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
             `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
    };

    if (!end) return `${formatUTC(start)} → ongoing`;
    if (start === end) return formatUTC(start);

    return `${formatUTC(start)} → ${formatUTC(end)}`;
  },

  comparator: (valueA: string, valueB: string) => {
    const getStart = (val: string) => {
      if (!val) return 0;
      return new Date(val.split("/")[0]).getTime();
    };

    return getStart(valueA) - getStart(valueB);
  }
},
    {
      headerName: "Observations",
      field: "observations",
      cellRenderer: (params: any) => (
        <LinkCustom
          style={{ color: "#233044", textDecoration: "none" }}
          to={`/devices/${id}/datastreams/${params.data["@iot.id"]}/observations`}
        >
          <BiotechSharpIcon />
        </LinkCustom>
      ),
      sortable: false,
      filter: false,
    },
  ];

  return (
    <Dashboard>
      <ToastContainer position="bottom-right" autoClose={5000} theme="dark" />

      <Breadcrumbs
        aria-label="breadcrumb"
        style={{ marginBottom: "10px" }}
      >
        <LinkCustom to="/">Data Space</LinkCustom>
        <LinkCustom to="/frost_entities">Data Items</LinkCustom>
        <LinkCustom to="/devices">Devices</LinkCustom>
        <Typography color="text.primary">
          Datastream of Device #{id} {datastream[0]?.name && `(${datastream[0]?.name})`}
        </Typography>
      </Breadcrumbs>

     <DataTableCardV2
  title={`Datastreams for Device #${id} ${datastream[0]?.name || ""}`}
  description="This page shows the datastreams linked to the selected device. Each datastream represents a single type of sensor measurement (e.g., temperature, humidity, pressure) and contains its description and the related observations."
  columnDefs={columnDefs}
  rowData={datastream}
  page={page}
  pageSize={pageSize}
  totalRows={totalRows}
  loading={loading}
  onPageChange={(newPage) => {
    setPage(newPage);
    fetchThings(newPage, pageSize, filterQuery, sortQuery);
  }}
  onPageSizeChange={(newPageSize) => {
    setPage(0);
    setPageSize(newPageSize);
    setPageLinks({});
    fetchThings(0, newPageSize, filterQuery, sortQuery);
  }}
  onFilterChange={(fq) => {
    setFilterQuery(fq);
    setPage(0);
    setPageLinks({});
    fetchThings(0, pageSize, fq, sortQuery);
  }}
  onSortChange={(sq) => {
    setSortQuery(sq);
    setPage(0);
    setPageLinks({});
    fetchThings(0, pageSize, filterQuery, sq);
  }}
/>

    </Dashboard>
  );
};

export default ListDatastreamPerDevice;
