import React, {
  useEffect,
  useImperativeHandle,
  useState,
  forwardRef,
} from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import TextField from "@mui/material/TextField";
import moment from "moment";

interface DateTimeFilterModel {
  filterType: "datetime";
  type: "equals" | "greaterThan" | "lessThan" | "inRange";
  dateFrom: string;
  dateTo?: string;
}

const DateTimeFilter = forwardRef((props: any, ref) => {
  const [type, setType] = useState<"equals" | "greaterThan" | "lessThan" | "inRange">(
    "greaterThan"
  );
  const [from, setFrom] = useState<any>(null);
  const [to, setTo] = useState<any>(null);

  // AG Grid callback – support multiple versions
  const safeFilterChanged = () => {
    if (props.filterChangedCallback) props.filterChangedCallback();
    else if (props.onFilterChanged) props.onFilterChanged();
    else if (props.filterChanged) props.filterChanged();
  };

  useImperativeHandle(ref, () => ({
    isFilterActive() {
      return !!from;
    },

    doesFilterPass() {
      // server-side filtering
      return true;
    },

    getModel(): DateTimeFilterModel | null {
      if (!from) return null;

      const model: DateTimeFilterModel = {
        filterType: "datetime",
        type,
        dateFrom: moment(from).toISOString(),
      };

      if (type === "inRange" && to) {
        model.dateTo = moment(to).toISOString();
      }

      return model;
    },

    setModel(model: DateTimeFilterModel | null) {
      if (!model) {
        setFrom(null);
        setTo(null);
        setType("greaterThan");
        return;
      }

      setType(model.type);
      setFrom(moment(model.dateFrom));
      if (model.dateTo) setTo(moment(model.dateTo));
    },
  }));

  useEffect(() => {
    safeFilterChanged();
  }, [type, from, to]);

return (
  <LocalizationProvider dateAdapter={AdapterMoment}>
    <div
      style={{
        width: "100%",          // take full popup width
        maxWidth: 420,          // looks good on desktop
        minWidth: 260,          // don’t shrink too much
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxSizing: "border-box",
      }}
    >
      {/* Filter type */}
      <select
        style={{
          padding: 8,
          fontSize: 14,
        }}
        value={type}
        onChange={(e) =>
          setType(
            e.target.value as "equals" | "greaterThan" | "lessThan" | "inRange"
          )
        }
      >
        <option value="equals">Equals</option>
        <option value="greaterThan">Greater Than</option>
        <option value="lessThan">Less Than</option>
        <option value="inRange">Between</option>
      </select>

      {/* FROM datetime */}
      <DateTimePicker
        label="From Datetime"
        value={from}
        onChange={(val) => setFrom(val)}
        inputFormat="dd.MM.yyyy HH:mm"
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth                // ⭐ responsive field
            size="small"
          />
        )}
        PopperProps={{
          disablePortal: true,        // keep it stable inside popup
        }}
      />

      {/* TO datetime */}
      {type === "inRange" && (
        <DateTimePicker
          label="To Datetime"
          value={to}
          onChange={(val) => setTo(val)}
          inputFormat="dd.MM.yyyy HH:mm"
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth              // ⭐ responsive field
              size="small"
            />
          )}
          PopperProps={{
            disablePortal: true,
          }}
        />
      )}
    </div>
  </LocalizationProvider>
);

});

export default DateTimeFilter;
