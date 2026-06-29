export type SortDirection = 'ASC' | 'DESC' | '';
export type TableActionType = 'edit' | 'delete' | 'copy' | 'activate' | 'deactivate';

export interface ColumnDef<T = any> {
  key: string;              // maps to property in data
  label: string;            // column header label
  sortable?: boolean;
  filterable?: boolean;     // show per-column filter input
  filterType?: FilterType;
  filterOptions?: { label: string; value: any }[];  // for select filters
  width?: string;           // e.g. '200px'
  cellTemplate?: any;       // TemplateRef for custom cell rendering
  actions?: TableActionType[];
  sticky?: boolean;
  align?: 'left' | 'center' | 'right';
  hideColumn?: boolean;
  dateFormat?: 'short' | 'long' | 'time' | 'datetime';
  nullPlaceholder?: string; // defaults to '—' if omitted
  statusMap?: Record<string, StatusConfig> | true;
  actionCondition?: (row: T) => TableActionType[];
  valueFormatter?: (value: any, row: T) => string;
}

export interface DateRangeValue {
  from: string;
  to: string;
}
export const defaultPaginationMeta = {
  currentPage: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
};

export type FilterType = 'text' | 'select' | 'date' | 'dateRange';


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

export interface StatusConfig {
  label: string;
  classes: string; // tailwind classes for bg + text
}