import React, { useRef, useEffect } from "react";
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
import { AgGridReact } from "ag-grid-react";
import type { GridApi, ColumnState, SortChangedEvent } from "ag-grid-community";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import { buildFilterQuery, buildSortQuery } from "../utils/frostQueryBuilder";

interface DataTableCardV2Props {
  title: string;
  description?: string;
  columnDefs: any[];
  rowData: any[];

  page: number;
  pageSize: number;
  totalRows: number;
  loading?: boolean;

  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;

  onFilterChange?: (filterQuery: string) => void;
  onSortChange?: (sortQuery: string) => void;
}

const DataTableCard: React.FC<DataTableCardV2Props> = ({
  title,
  description,
  columnDefs,
  rowData,
  page,
  pageSize,
  totalRows,
  loading = false,
  onPageChange,
  onPageSizeChange,
  onFilterChange,
  onSortChange,
}) => {
  const gridApiRef = useRef<GridApi<any> | null>(null);

  // overlays
  useEffect(() => {
    if (!gridApiRef.current) return;
    if (loading) {
      gridApiRef.current.showLoadingOverlay();
    } else if (rowData.length === 0) {
      gridApiRef.current.showNoRowsOverlay();
    } else {
      gridApiRef.current.hideOverlay();
    }
  }, [loading, rowData]);

  return (
    <Card elevation={1} sx={{ borderRadius: "8px" }}>
      {/* Header */}
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

      {/* Grid */}
      <CardContent
        sx={{ p: 0, height: "600px", display: "flex", flexDirection: "column" }}
      >
        <div style={{ flex: 1, position: "relative" }}>
          <div
            className="ag-theme-material custom-ag-grid"
            style={{ height: "100%", width: "100%" }}
          >
            <AgGridReact
              onGridReady={(params) => (gridApiRef.current = params.api)}
              columnDefs={columnDefs}
              rowData={rowData}
              pagination={false}
              suppressPaginationPanel={true}
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
                '<span class="ag-overlay-no-rows-center">No rows to display</span>'
              }
             onFilterChanged={(params) => {
    const model = params.api.getFilterModel();
    const filterString = buildFilterQuery(model);
    onFilterChange?.(filterString);  // ✅ give parent ready string
  }}
  onSortChanged={(params: SortChangedEvent) => {
    const colState: ColumnState[] = params.api.getColumnState();
    const model = colState.filter((col) => col.sort) as Array<{
      colId: string;
      sort: "asc" | "desc";
    }>;
    const sortString = buildSortQuery(model);
    onSortChange?.(sortString);  // ✅ give parent ready string
  }}
              enableRangeSelection
              enableCellTextSelection
              suppressCopyRowsToClipboard={false}
              copyHeadersToClipboard
              allowContextMenuWithControlKey
            />
          </div>

          {/* ✅ Loader overlay */}
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

        {/* Footer */}
        <TablePagination
          component="div"
          count={totalRows}
          page={page}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) =>
            onPageSizeChange(parseInt(e.target.value, 10))
          }
          rowsPerPageOptions={[10, 20, 50, 100]}
        />
      </CardContent>
    </Card>
  );
};

export default DataTableCard;
