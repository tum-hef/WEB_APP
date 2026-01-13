import axios from "axios";
import type { IGetRowsParams } from "ag-grid-community";
import { buildFilterQuery, buildSortQuery } from "../../utils/frostQueryBuilder";


export const createObservationsDatasource = ({
  token,
  baseUrl,
  onRowCountChange,
}: {
  token: string;
  baseUrl: string;
  onRowCountChange?: (count: number) => void;
}) => ({
  getRows: async (params: IGetRowsParams) => {
    const pageSize = params.endRow - params.startRow;
    const filter = buildFilterQuery(params.filterModel);
    const sort = buildSortQuery(params.sortModel);

    try {
      const res = await axios.get(baseUrl, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          $top: pageSize,
          $skip: params.startRow,
          $count: true,
          ...(filter ? { $filter: filter } : {}),
          ...(sort ? { $orderby: sort } : {}),
        },
      });

      const rows = res.data.value ?? [];
      const total = res.data["@iot.count"] ?? 0;

      params.successCallback(rows, total);
      if (typeof total === "number" && total > 0) {
        onRowCountChange?.(total);
      }
    } catch (e) {
      console.error("FROST fetch failed:", e);
      params.failCallback();
    }
  },
});
