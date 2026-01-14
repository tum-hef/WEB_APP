import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Tooltip,
  Box,
  CircularProgress,
  TablePagination,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { AgGridReact } from "ag-grid-react";
import type { GridApi, IGetRowsParams } from "ag-grid-community";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";

/* ================================
   Props
================================ */
interface InfiniteDataTableCardProps {
  title: string;
  description?: string;
  columnDefs: any[];

  /** Factory that returns an AG Grid Infinite datasource */
  createDatasource: (args: {
  pageSize: number;
  currentPage: number;
  onRowCountChange?: (count: number) => void;
}) => {
  getRows: (params: import("ag-grid-community").IGetRowsParams) => void;
};

  filterQuery?: string;
  sortQuery?: string;

  loading?: boolean;
    onFilterModelChange?: (model: any) => void;
  onSortModelChange?: (model: any) => void;
}

/* ================================
   Component
================================ */
const InfiniteDataTableCard: React.FC<InfiniteDataTableCardProps> = ({
  title,
  description,
  columnDefs,
  createDatasource,
  filterQuery,
  sortQuery,
    onFilterModelChange,
  onSortModelChange,
  loading = false,
}) => {
  const gridApiRef = useRef<GridApi | null>(null);

  /* ------------------------------
     Pagination state (UI only)
  ------------------------------ */
  const [pageSize, setPageSize] = useState<any>(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowCount, setRowCount] = useState(0);

  /* ------------------------------
     Datasource (v29+ declarative)
  ------------------------------ */

   const handleRowCountChange = (count: number) => { 
  setRowCount((prev) => (count > 0 ? count : prev));
};
const datasource = useMemo(
  () =>
    createDatasource({
      pageSize,
      currentPage,
      onRowCountChange: handleRowCountChange,
    }),
  [createDatasource, pageSize, currentPage]
);


  /* ------------------------------
     Page navigation (KEY LOGIC)
  ------------------------------ */
  useEffect(()=>{
   console.log("currentPage changed:", currentPage);
  },[currentPage])

 useEffect(() => {
  if (!gridApiRef.current) return;

  console.log("🔁 Setting new datasource with filter:", filterQuery);

  gridApiRef.current.setGridOption("datasource", datasource);
  gridApiRef.current.ensureIndexVisible(0, "top");
}, [datasource]);

const handlePageChange = (_: any, newPage: number) => {
  setCurrentPage(newPage);

  // 🔑 FORCE AG Grid to refetch
  gridApiRef.current?.purgeInfiniteCache();
};
  React.useEffect(() => {
  console.log("ROW COUNT STATE UPDATED:", rowCount);
}, [rowCount]);
  return (
    <Card elevation={1} sx={{ borderRadius: "8px" }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <Typography variant="h3" sx={{ fontWeight: 400 }}>
              {title}
            </Typography>

            {description && (
              <Tooltip title={description} placement="top" arrow>
                <InfoOutlinedIcon
                  sx={{
                    ml: 1,
                    fontSize: 22,
                    color: "gray",
                    cursor: "pointer",
                    mt: 2,
                  }}
                />
              </Tooltip>
            )}
          </Box>
        }
      />

      <CardContent
        sx={{
          p: 0,
          height: "600px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ================================
            AG Grid
        ================================ */}
        <div style={{ flex: 1 }} className="ag-theme-material">
          <AgGridReact
            onGridReady={(params) => {
              gridApiRef.current = params.api;
            }}
            rowModelType="infinite"
            datasource={datasource}
            maxBlocksInCache={1}
            columnDefs={columnDefs}
            cacheBlockSize={pageSize} 
             rowBuffer={0}
              domLayout="normal"
suppressHorizontalScroll={true}
  // UX (optional but recommended)
  suppressScrollOnNewData={true} 
 suppressRowVirtualisation={true}
  pagination={false}
alwaysShowHorizontalScroll={true}
  suppressPaginationPanel
            getRowId={(params) => params.data["@iot.id"]}
             onFilterChanged={(p) =>
              onFilterModelChange?.(p.api.getFilterModel())
            }
            onSortChanged={(p) =>
              onSortModelChange?.(p.api.getState().sort)
            }
            rowHeight={65}
            headerHeight={42}
            defaultColDef={{
              filter: true,
              floatingFilter: true,
              sortable: true,
              resizable: true,
              wrapText: false,
              autoHeight: false,
            }}
          />
        </div>

        {/* ================================
            MUI Pagination (UI only)
        ================================ */}
       <TablePagination
  component="div"
  count={rowCount}
  page={currentPage}
  onPageChange={handlePageChange}
  rowsPerPage={pageSize}
  onRowsPerPageChange={(e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(0);
  }}
/>

        {/* ================================
            Loading Overlay
        ================================ */}
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
      </CardContent>
    </Card>
  );
};

export default InfiniteDataTableCard;
