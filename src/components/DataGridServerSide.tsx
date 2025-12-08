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
  Button,
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import type { GridApi, ColumnState, SortChangedEvent } from "ag-grid-community";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import { buildFilterQuery, buildSortQuery, FilterQueryBuilderV2 } from "../utils/frostQueryBuilder";
import { CsvExportModule, ModuleRegistry } from "ag-grid-community";
import { toast } from "react-toastify";
ModuleRegistry.registerModules([CsvExportModule]);

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
  frameworkComponents?: any;
  context?: any;

  onFilterChange?: (filterQuery: string) => void;
  onSortChange?: (sortQuery: string) => void;
  clearFiltersTrigger?: boolean;
  filterType?: boolean;

  exportEnabled?: boolean;
  csv_title?: string; 
  handleExportAll?: () => void;

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
  frameworkComponents,
  context,
  onFilterChange,
  onSortChange,
  clearFiltersTrigger,
  filterType,
  exportEnabled = false,
  csv_title,
  handleExportAll
}) => {
  const gridApiRef = useRef<GridApi<any> | null>(null);


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

  useEffect(() => {
    if (clearFiltersTrigger && gridApiRef.current) {
      const api = gridApiRef.current;
      api.setFilterModel(null);
      api.onFilterChanged();
    }
  }, [clearFiltersTrigger]);

  const handleExportCurrentPage = () => {
  const api = gridApiRef.current;
  if (!api) return;
  let visibleRowCount = 0;
  api.forEachNodeAfterFilterAndSort(() => {
    visibleRowCount++;
  });

  if (visibleRowCount === 0) {
    toast.error("No data available on this page to export.");
    return;
  }

  api.exportDataAsCsv({
    fileName: "logbook_current_page.csv",
    columnKeys: ["id", "description", "timestamp", "createdAt"],
    allColumns: false,
  });
};

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
        action={
          exportEnabled ? (
            <Box display="flex" alignItems="center" gap={1} sx={{ mt: 1, mr: 1 }}>

              {/* Export Current Page (AG-Grid) */}
              <Button
                variant="contained"
                color="primary"
                size="small"
                sx={{ backgroundColor: "#233044", whiteSpace: "nowrap", "&:hover": { backgroundColor: "#233044" } }}
                onClick={handleExportCurrentPage}
              >
                Export Page
              </Button>

              {/* Export All (Backend) */}
              <Button
                variant="contained"
                color="primary"
                size="small"
                sx={{ backgroundColor: "#233044", whiteSpace: "nowrap", "&:hover": { backgroundColor: "#233044" } }}
                onClick={handleExportAll}
              >
                Export All
              </Button>

            </Box>
          ) : null
        }
      />



      <CardContent
        sx={{ p: 0, height: "600px", display: "flex", flexDirection: "column" }}
      >
        <div style={{ flex: 1, position: "relative" }}>
          <div className="ag-theme-material custom-ag-grid" style={{ height: "100%", width: "100%" }}>
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
              components={frameworkComponents}
              context={context}
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
                console.log("Filter Model:", model);
                const filterString: string = filterType
                  ? FilterQueryBuilderV2(model)
                  : buildFilterQuery(model);
                onFilterChange?.(filterString);
              }}
              onSortChanged={(params: SortChangedEvent) => {
                const colState: ColumnState[] = params.api.getColumnState();
                const model = colState.filter((col) => col.sort) as Array<{
                  colId: string;
                  sort: "asc" | "desc";
                }>;
                const sortString = buildSortQuery(model);
                onSortChange?.(sortString);
              }}
              enableRangeSelection
              enableCellTextSelection
              suppressCopyRowsToClipboard={false}
              copyHeadersToClipboard
              allowContextMenuWithControlKey
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
