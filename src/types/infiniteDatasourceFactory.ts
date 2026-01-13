import type { IGetRowsParams } from "ag-grid-community";

export type InfiniteDatasourceFactory = (
  context: {
    filterQuery?: string;
    sortQuery?: string;

    /**
     * Called whenever AG Grid receives total row count
     * (e.g. from FROST @iot.count)
     */
    onRowCountChange?: (count: number) => void;
  }
) => {
  getRows: (params: IGetRowsParams) => void;
};
