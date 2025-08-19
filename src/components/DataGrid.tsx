import React from "react";
import { Card, CardHeader, CardContent, Typography } from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";

interface DataTableCardProps {
  title: string;
  columnDefs: any[];
  rowData: any[];
}

const DataTableCard: React.FC<DataTableCardProps> = ({ title, columnDefs, rowData }) => {
  return (
    <Card elevation={1} style={{ borderRadius: "8px" }}>
      {/* Card Header with title */}
      <CardHeader
        title={
          <Typography variant="h3" style={{ fontWeight: 400 }}>
            {title}
          </Typography>
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
              autoHeight: false,
              wrapText: false,
              cellStyle: { textAlign: "left" },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DataTableCard;
