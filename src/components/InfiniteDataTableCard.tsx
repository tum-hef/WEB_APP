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
interface InfiniteDataTableCardProps {
  title: string;
  description?: string;
  columnDefs: any[];


  createDatasource: (args: {
    pageSize: number;
    currentPage: number;
    onRowCountChange?: (count: number) => void; 
    onLoadingChange?: (loading: boolean) => void;
  }) => {
    getRows: (params: import("ag-grid-community").IGetRowsParams) => void;
  };

  filterQuery?: string;
  sortQuery?: string;

  loading?: boolean;
  onFilterModelChange?: (model: any) => void;
  onSortModelChange?: (model: any) => void;
}

const InfiniteDataTableCard: React.FC<InfiniteDataTableCardProps> = ({
  title,
  description,
  columnDefs,
  createDatasource,
  filterQuery,
  sortQuery,
  onFilterModelChange,
  onSortModelChange,
}) => {
  const gridApiRef = useRef<GridApi | null>(null);


  const [pageSize, setPageSize] = useState<any>(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const handleRowCountChange = (count: number) => {
    setRowCount((prev) => (count > 0 ? count : prev));
  };
  const datasource = useMemo(
    () =>
      createDatasource({
        pageSize,
        currentPage,
        onRowCountChange: handleRowCountChange, 
        onLoadingChange: setLoading,
      }),
    [createDatasource, pageSize, currentPage]
  );


  useEffect(() => {
    console.log("currentPage changed:", currentPage);
  }, [currentPage])

  useEffect(() => {
    if (!gridApiRef.current) return;

    gridApiRef.current.setGridOption("datasource", datasource);
    gridApiRef.current.ensureIndexVisible(0, "top");
  }, [datasource]);

  const handlePageChange = (_: any, newPage: number) => {
    setCurrentPage(newPage);

    gridApiRef.current?.purgeInfiniteCache();
  };
  const loadingOverlayTemplate = `
  <div style="
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255,255,255,0.6);
    z-index: 2;
  ">
    <div class="ag-spinner ag-spinner-large"></div>
  </div>
`;


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
      
        <div style={{ flex: 1, position: "relative" }}>
  <div
    className="ag-theme-material custom-ag-grid"
    style={{ height: "100%", width: "100%" }}
  >
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
            overlayLoadingTemplate={loadingOverlayTemplate}
            domLayout="normal"
            suppressHorizontalScroll={true}
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
               floatingFilterComponentParams: {
    suppressFilterButton: true,
  },  sortable: true,
                resizable: true,
                wrapText: false,
                autoHeight: false,
                cellStyle: { textAlign: "left", whiteSpace: "nowrap" },
      
            }}
          />
            </div>
        </div>

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
