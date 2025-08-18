import React, { useCallback, useMemo, useState } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-community';
import '@inovua/reactdatagrid-community/index.css';

export type FetchParams = {
  skip: number;    // offset
  limit: number;   // page size
  sort?: string;   // "field:asc|desc"
  search?: string; // optional
};

export type FetchResult<Row> = { data: Row[]; count: number };
export type ServerFetcher<Row> = (p: FetchParams) => Promise<FetchResult<Row>>;

export interface GridHOCOptions<Row> {
  title: string;
  columns: any[]; // Inovua column configs
  fetcher: ServerFetcher<Row>;
  idProperty?: keyof Row & string;
  defaultLimit?: number;
  pageSizes?: number[];
  enableSearch?: boolean;
  searchPlaceholder?: string;
  renderToolbarRight?: (reload: () => void) => React.ReactNode;
}

export function withServerDataGrid<Row extends Record<string, any>>(
  opts: GridHOCOptions<Row>
) {
  const {
    title,
    columns,
    fetcher,
    idProperty = 'id' as keyof Row & string,
    defaultLimit = 5,
    pageSizes = [5, 10, 25, 50],
    enableSearch = true,
    searchPlaceholder = 'Search…',
    renderToolbarRight,
  } = opts;

  const GridComponent: React.FC<{ gridKey?: string | number }> = ({ gridKey }) => {
    const [search, setSearch] = useState('');
    const [reloadFlag, setReloadFlag] = useState(0); // 👈 used to force remount
    const reload = () => setReloadFlag((f) => f + 1);

    // keep a lightweight local type for sortInfo
    type LocalSortInfo = { name?: string; dir?: 'asc' | 'desc' | 1 | -1 } | undefined;

    const dataSource = useCallback(
      async ({ skip, limit, sortInfo }: { skip: number; limit: number; sortInfo?: LocalSortInfo }) => {
        let sort: string | undefined;
        const s = sortInfo as LocalSortInfo;
        if (s?.name && s?.dir) {
          const dir = s.dir === 1 ? 'asc' : s.dir === -1 ? 'desc' : s.dir;
          sort = `${String(s.name)}:${dir}`;
        }
        return fetcher({ skip, limit, sort, search: enableSearch ? search : undefined });
      },
      [fetcher, search, enableSearch]
    );

    const pagination = useMemo(
      () => ({
        enabled: true,
        defaultLimit,
        limit: defaultLimit,
        pageSizes,
        pageText: 'Rows per page',
        showInfo: true,
      }),
      [defaultLimit, pageSizes]
    );

    return (
      <div key={gridKey} className="hef-grid-wrapper" style={{ padding: '0 8px' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{title}</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {enableSearch && (
              <input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && reload()}
                style={{ height: 36, border: '1px solid #e5e7eb', borderRadius: 8, padding: '0 10px', outline: 'none' }}
              />
            )}
            {renderToolbarRight?.(reload)}
          </div>
        </div>

        {/* 👇 key={reloadFlag} forces remount => fresh fetch, no ref needed */}
        <ReactDataGrid
          key={reloadFlag}
          idProperty={idProperty as string}
          className="hef-grid"
          style={{
            minHeight: 420,
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            background: '#fff',
            fontSize: 14,
          }}
          columns={columns}
          dataSource={dataSource as any}
          sortable
          pagination={pagination as any}
          theme="default-light"
          rowHeight={44}
          headerHeight={44}
          livePagination
          checkboxColumn={false}
          enableSelection={false}
        />

        <style>{`
          .hef-grid .InovuaReactDataGrid__header { background:#fff; border-bottom:1px solid #e5e7eb; }
          .hef-grid .InovuaReactDataGrid__cell { border-color:#f1f5f9; color:#111827; }
          .hef-btn { height:36px; padding:0 14px; border-radius:8px; border:none; font-weight:600; cursor:pointer; }
          .hef-btn--primary { background:#1976d2; color:#fff; }
          .hef-icon-btn {
            display:inline-flex; align-items:center; height:30px; padding:0 10px;
            border-radius:8px; background:#f3f4f6; border:1px solid #e5e7eb; cursor:pointer;
          }
          .hef-icon-btn:hover { background:#eef2ff; }
          .hef-icon-btn.danger { color:#ef4444; background:#fff; }
        `}</style>
      </div>
    );
  };

  GridComponent.displayName = `WithServerDataGrid(${title})`;
  return GridComponent;
}
export default withServerDataGrid;