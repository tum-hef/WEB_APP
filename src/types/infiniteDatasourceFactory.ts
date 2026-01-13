import type { IGetRowsParams } from "ag-grid-community";

export type InfiniteDatasourceFactory = (
  context: {
    filterQuery?: string;
    sortQuery?: string;
    onRowCountChange?: (count: number) => void;
  }
) => {
  getRows: (params: IGetRowsParams) => void;
};
