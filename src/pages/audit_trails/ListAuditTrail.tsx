import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Breadcrumbs,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Box,
  Button,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { ToastContainer, toast } from "react-toastify";

import Dashboard from "../../components/DashboardComponent";
import LinkCustom from "../../components/LinkCustom";
import { useKeycloak } from "@react-keycloak/web";
import moment from "moment";
import { AgGridReact } from "ag-grid-react";
import type { GridApi } from "ag-grid-community";
import { CsvExportModule, ModuleRegistry } from "ag-grid-community";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";

// Register CSV export module
ModuleRegistry.registerModules([CsvExportModule]);

/**
 * API call to request the audit trail endpoint.
 * @param groupId - The active project/group ID.
 * @param token - Keycloak authorization token.
 */
export const getAuditTrail = async (groupId: string, token: string) => {
  const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/audit_trail`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      group_id: groupId,
    },
  });
  return response.data; // returns { success: true, audit_trail: [...] }
};

const ListAuditTrail = () => {
  const { keycloak } = useKeycloak();
  const token = keycloak?.token;

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const gridApiRef = useRef<GridApi<any> | null>(null);

  const group_id = localStorage.getItem("group_id");

  const fetchLogs = async () => {
    if (!group_id) {
      setLogs([]);
      return;
    }
    if (!token) return;

    setLoading(true);
    try {
      const data = await getAuditTrail(group_id, token);
      if (data.success) {
        setLogs(data.audit_trail || []);
      } else {
        toast.error("Failed to fetch audit trail");
      }
    } catch (err) {
      console.error("Failed to fetch audit trail:", err);
      toast.error("Failed to fetch audit trail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [group_id, token]);

  const handleExport = () => {
    if (gridApiRef.current) {
      gridApiRef.current.exportDataAsCsv({
        fileName: `audit_trail_${group_id || "export"}.csv`,
        columnKeys: ["timestamp", "user_full_name", "activity", "status", "status_meaning"],
        processCellCallback: (params) => {
          if (params.column.getColId() === "timestamp") {
            return params.value ? moment(params.value).format("YYYY-MM-DD HH:mm:ss") : "";
          }
          return params.value;
        },
      });
    } else {
      toast.error("Grid is not ready yet");
    }
  };

  // ---------- AG GRID COLUMN DEFINITIONS ----------
  const columnDefs = [
    {
      headerName: "Timestamp",
      field: "timestamp",
      sortable: true,
      filter: "agDateColumnFilter",
      cellDataType: "dateTime",
      filterParams: {
        defaultOption: "inRange",
        suppressAndOrCondition: true,
        buttons: ["apply", "reset"],
        closeOnApply: true,
      },
      flex: 1.2,
      // Return Date object for filtering and sorting
      valueGetter: (params: any) =>
        params.data.timestamp ? moment(params.data.timestamp, "YYYY-MM-DD HH:mm:ss").toDate() : null,
      // Format display string
      valueFormatter: (params: any) =>
        params.value ? moment(params.value).format("YYYY-MM-DD HH:mm:ss") : "",
    },
    {
      headerName: "User",
      field: "user_full_name",
      filter: "agTextColumnFilter",
      sortable: true,
      flex: 1.8,
    },
    {
      headerName: "Activity",
      field: "activity",
      filter: "agTextColumnFilter",
      sortable: true,
      flex: 2.2,
      wrapText: true,
      autoHeight: true,
      cellStyle: { whiteSpace: "normal" },
    },
    {
      headerName: "Status",
      field: "status",
      filter: "agTextColumnFilter",
      sortable: true,
      flex: 1.2,
    },
    {
      headerName: "Status Meaning",
      field: "status_meaning",
      filter: "agTextColumnFilter",
      sortable: true,
      flex: 1.2,
    },
  ];

  return (
    <Dashboard>
      <ToastContainer position="bottom-right" autoClose={5000} theme="dark" />

      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" style={{ marginBottom: "15px" }}>
        <LinkCustom to="/">Data Space</LinkCustom>
        <Typography color="text.primary">Audit Trail</Typography>
      </Breadcrumbs>

      <Card elevation={1} sx={{ borderRadius: "8px" }}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center">
              <Typography variant="h3" sx={{ fontWeight: 400 }}>
                Audit Trail
              </Typography>
              <Tooltip title="A read-only log of all operations and activities performed in this project." placement="top" arrow>
                <InfoOutlinedIcon
                  sx={{
                    ml: 1,
                    fontSize: 22,
                    color: "gray",
                    cursor: "pointer",
                    mt: 0.5,
                  }}
                />
              </Tooltip>
            </Box>
          }
          action={
            <Box display="flex" alignItems="center" gap={1} sx={{ mt: 1, mr: 1 }}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                sx={{
                  backgroundColor: "#233044",
                  whiteSpace: "nowrap",
                  "&:hover": { backgroundColor: "#1e293b" },
                }}
                onClick={handleExport}
              >
                Export CSV
              </Button>
            </Box>
          }
        />

        <CardContent sx={{ p: 0, height: "600px", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <div className="ag-theme-material custom-ag-grid" style={{ height: "100%", width: "100%" }}>
              <AgGridReact
                onGridReady={(params) => (gridApiRef.current = params.api)}
                columnDefs={columnDefs}
                rowData={logs}
                pagination={true}
                paginationPageSize={10}
                domLayout="normal"
                rowHeight={65}
                headerHeight={42}
                suppressRowTransform={true}
                defaultColDef={{
                  filter: true,
                  floatingFilter: true,
                  sortable: true,
                  resizable: true,
                  wrapText: false,
                  autoHeight: false,
                  cellStyle: { textAlign: "left", whiteSpace: "nowrap" },
                }}
                overlayLoadingTemplate={'<span style="display:none"></span>'}
                overlayNoRowsTemplate={
                  '<span class="ag-overlay-no-rows-center">No audit logs to display</span>'
                }
              />
            </div>

            {loading && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255,255,255,0.6)",
                  zIndex: 2,
                }}
              >
                <CircularProgress size={48} />
              </Box>
            )}
          </div>
        </CardContent>
      </Card>
    </Dashboard>
  );
};

export default ListAuditTrail;
