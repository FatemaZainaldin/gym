export type SortDirection = 'ASC' | 'DESC' | '';

export interface ColumnDef<T = any> {
  key: string;              // maps to property in data
  label: string;            // column header label
  sortable?: boolean;
  filterable?: boolean;     // show per-column filter input
  filterType?: 'text' | 'select' | 'date';
  filterOptions?: { label: string; value: any }[];  // for select filters
  width?: string;           // e.g. '200px'
  cellTemplate?: any;       // TemplateRef for custom cell rendering
  sticky?: boolean;
  align?: 'left' | 'center' | 'right';
  valueFormatter?: (value: any, row: T) => string;
}
export const defaultPaginationMeta = {
  currentPage: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
};

export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface TableState {
  currentPage: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: SortDirection;
  search?: string;
  columnFilters: Record<string, any>;
}

export interface TableRequestEvent {
  state: TableState;
}