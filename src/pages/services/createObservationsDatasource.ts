import axios from "axios";
import type { IGetRowsParams } from "ag-grid-community";
import { buildFilterQuery, buildSortQuery } from "../../utils/frostQueryBuilder";

export const createObservationsDatasource = ({
  token,
  baseUrl,
  pageSize,
  currentPage,
  onRowCountChange,
}: {
  token: string;
  baseUrl: string;
  pageSize: number;
  currentPage: number;
  onRowCountChange?: (count: number) => void;
}) => ({
  getRows: async (params: IGetRowsParams) => {
  const pageStart = currentPage * pageSize;

  console.log(
    "getRows called:",
    params.startRow,
    params.endRow,
    "page:",
    currentPage,
    "backend skip:",
    pageStart
  );

  if (params.startRow !== 0) {
    params.successCallback([], pageSize);
    return;
  }

  const filter = buildFilterQuery(params.filterModel);
  const sort = buildSortQuery(params.sortModel);

  try {
    const res = await axios.get(baseUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        $top: pageSize,
        $skip: pageStart, 
        $count: true,
        ...(filter && { $filter: filter }),
        ...(sort && { $orderby: sort }),
      },
    });

    const rows = res.data.value ?? [];
    const total = res.data["@iot.count"] ?? 0;

    params.successCallback(rows, pageSize);

    if (total > 0) {
      onRowCountChange?.(total);
    }
  } catch (err) {
    console.error("FROST fetch failed", err);
    params.failCallback();
  }
}
});
