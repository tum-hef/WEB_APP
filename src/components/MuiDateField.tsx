import { Box, TextField } from "@mui/material";
import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";

const MuiDateRangeFilter = forwardRef((props: any, ref) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Expose AG Grid filter API
  useImperativeHandle(ref, () => ({
    isFilterActive() {
      return !!startDate || !!endDate;
    },

    doesFilterPass(params: any) {
      if (!startDate && !endDate) return true;
      const cellValue = params.data[props.colDef.field];
      if (!cellValue) return false;

      const cellDate = new Date(cellValue).getTime();
      const start = startDate ? new Date(startDate).getTime() : -Infinity;
      const end = endDate ? new Date(endDate).getTime() : Infinity;

      return cellDate >= start && cellDate <= end;
    },

    getModel() {
      if (!startDate && !endDate) return null;
      return { type: "inRange", dateFrom: startDate, dateTo: endDate };
    },

    setModel(model: any) {
      if (model) {
        setStartDate(model.dateFrom || "");
        setEndDate(model.dateTo || "");
      } else {
        setStartDate("");
        setEndDate("");
      }
    },
  }));

  return (
    <Box display="flex" flexDirection="column" gap={1} p={1}>
      <TextField
        label="Start date"
        type="date"
        size="small"
        value={startDate}
        onChange={(e) => {
          setStartDate(e.target.value);
          props.filterChangedCallback();
        }}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="End date"
        type="date"
        size="small"
        value={endDate}
        onChange={(e) => {
          setEndDate(e.target.value);
          props.filterChangedCallback();
        }}
        InputLabelProps={{ shrink: true }}
      />
    </Box>
  );
});

export default MuiDateRangeFilter;
