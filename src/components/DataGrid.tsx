import React from "react";
import { Card, CardHeader, CardContent, Typography, Tooltip, Box } from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface DataTableCardProps {
  title: string;
  description?: string;
  columnDefs: any[];
  rowData: any[];
}

const DataTableCard: React.FC<DataTableCardProps> = ({ title, description,columnDefs, rowData }) => {
  return (
    <Card elevation={1} style={{ borderRadius: "8px" }}>
      {/* Card Header with title */}
      <CardHeader
        title={
        <Box display="flex" alignItems="center">
    <Typography variant="h3" sx={{ fontWeight: 400 }}>
      {title}
    </Typography>

    <Tooltip title={description || ""} placement="top" arrow>
      <InfoOutlinedIcon
        sx={{ ml: 1, fontSize: 22, color: "gray", cursor: "pointer", mt: 2 }}
      />
    </Tooltip>
  </Box>
          
        }
      />

      {/* AG Grid inside Card */}
      <CardContent style={{ padding: 0 }}>
        <div className="ag-theme-material custom-ag-grid" style={{ height: 500, width: "100%" }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            pagination
            paginationPageSize={5}
            rowHeight={65}
            headerHeight={42}
            suppressRowTransform={true}
            defaultColDef={{
              filter: true,
              floatingFilter: true,
              sortable: true,
              resizable: true,
              wrapText: false,   // 👈 default OFF
              autoHeight: false, // 👈 default OFF
              cellStyle: { textAlign: "left", whiteSpace: "nowrap" },
            }}
          />

        </div>
      </CardContent>
    </Card>
  );
};

export default DataTableCard;
