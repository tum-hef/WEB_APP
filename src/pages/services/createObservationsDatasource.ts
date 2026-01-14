import axios from "axios";
import type { IGetRowsParams } from "ag-grid-community";
import { buildFilterQuery, buildSortQuery } from "../../utils/frostQueryBuilder";

type FrostResponse = {
  value?: any[];
  "@iot.count"?: number;
};

export const createObservationsDatasource = ({
  token,
  baseUrl,
  pageSize,
  currentPage,
  onRowCountChange,
  onLoadingChange,
}: {
  token: string;
  baseUrl: string;
  pageSize: number;
  currentPage: number;
  onRowCountChange?: (count: number) => void;
  onLoadingChange?: (loading: boolean) => void;
}) => {
  // ✅ per-datasource instance dedupe (not global)
  let lastKey: string | null = null;
  let inFlight: Promise<{ rows: any[]; total: number }> | null = null;
  
  return {
    getRows: async (params: IGetRowsParams) => {
      const pageStart = currentPage * pageSize;

      // Infinite RM often asks startRow=0 for our "page view"
      // We serve one page only
       console.log("Datasource getRows called with params:", params)
      if (params.startRow !== 0) {
        params.successCallback([], pageSize);
        return;
      }
      console.log("params.filterModel",params.filterModel)
      const filter = buildFilterQuery(params.filterModel);
      const sort = buildSortQuery(params.sortModel);
      console.log("Built filter:", filter);
      const key = JSON.stringify({
        page: currentPage,
        size: pageSize,
        filter,
        sort,
      });

      try {
        if (key === lastKey && inFlight) {
          const { rows, total } = await inFlight;
          params.successCallback(rows, pageSize);
          if (total > 0) onRowCountChange?.(total);
          return;
        }

        lastKey = key;
        onLoadingChange?.(true); 
        inFlight = (async () => {
          const res = await axios.get<FrostResponse>(baseUrl, {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              $top: pageSize,
              $skip: pageStart,
              $count: true,
              ...(filter && { $filter: filter }),
              ...(sort && { $orderby: sort }),
            },
          });

          return {
            rows: res.data.value ?? [],
            total: res.data["@iot.count"] ?? 0,
          };
        })();

        const { rows, total } = await inFlight;

        params.successCallback(rows, pageSize);
        if (total > 0) onRowCountChange?.(total);
      } catch (err) {
        console.error("FROST fetch failed:", err);
        params.failCallback();
      } finally {
        // ✅ clear inFlight once resolved/rejected so a new key can fetch
        inFlight = null;
         onLoadingChange?.(false);
      }
    },
  };
};
