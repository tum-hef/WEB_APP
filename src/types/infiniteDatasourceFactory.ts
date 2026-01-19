import type { IGetRowsParams } from "ag-grid-community";

export type InfiniteDatasourceFactory = (
  context: {
    pageSize: number;
    currentPage: number;
    onRowCountChange?: (count: number) => void;
  }
) => {
  getRows: (params: IGetRowsParams) => void;
};