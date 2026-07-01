import { CommonModule } from '@angular/common';
import {
  Component, computed, input, output, signal,
  ChangeDetectionStrategy, OnChanges, SimpleChanges,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {
  ColumnDef, PaginationMeta, TableActionType, TableState,
  TableRequestEvent, SortDirection, DateRangeValue
} from './smart-table.types';
import { STATUS_MAP } from '@/app/shared/constants/status-map.constant';
import { Router } from '@angular/router';

@Component({
  selector: 'app-smart-table',
  imports: [CommonModule, FormsModule, MatIconModule, MatMenuModule],
  templateUrl: './smart-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmartTableComponent<T extends Record<string, any>> implements OnChanges {

  private route = inject(Router);

  // --- Signal Inputs ---
  columns = input<ColumnDef<T>[]>([]);
  data = input<T[]>([]);
  paginationMeta = input<PaginationMeta | undefined>(undefined);
  pageSizeOptions = input<number[]>([10, 25, 50, 100]);
  defaultPageSize = input(10);
  loading = input(false);
  emptyMessage = input('No records found.');
  showGlobalSearch = input(true);
  globalSearchPlaceholder = input('Search…');

  // --- Outputs ---
  stateChange = output<TableRequestEvent>();
  rowAction = output<{ action: TableActionType; row: T }>();
  onCopy = output<T>();
  onEdit = output<T>();
  onDelete = output<T>();
  onActivate = output<T>();
  onDeactivate = output<T>();

  // --- Internal reactive state ---
  protected page = signal(1);
  protected pageSize = signal(10);
  protected sortColumn = signal('');
  protected sortDirection = signal<SortDirection>('');
  protected globalSearch = signal('');
  protected columnFilters = signal<Record<string, any>>({});
  protected showColumnFilters = signal(false);

  // True when consumer provided paginationMeta (server-side)
  protected isServerSide = computed(() => !!this.paginationMeta());

  // resolvedColumns — replaces statusMap: true with full STATUS_MAP
  protected resolvedColumns = computed(() =>
    this.columns().map(col => ({
      ...col,
      statusMap: col.statusMap === true
        ? STATUS_MAP
        : col.statusMap ?? undefined,
    }))
  );

  // Visible columns (not hidden) — derived from resolvedColumns
  protected visibleColumns = computed(() =>
    this.resolvedColumns().filter(c => !c.hideColumn)
  );

  protected visibleColumnCount = computed(() =>
    this.visibleColumns().length
  );

  // --- Derived: processed rows (client-side only) ---
  protected processedRows = computed(() => {
    if (this.isServerSide()) return this.data();

    let rows = [...this.data()];

    // Global search
    const q = this.globalSearch().toLowerCase().trim();
    if (q) {
      rows = rows.filter(row =>
        this.columns().some(col => {
          const v = row[col.key];
          return v != null && String(v).toLowerCase().includes(q);
        })
      );
    }

    // Column filters
    const filters = this.columnFilters();
    for (const [key, val] of Object.entries(filters)) {
      if (val === '' || val == null) continue;

      // dateRange — both sides must be present to filter
      if (typeof val === 'object' && ('from' in val || 'to' in val)) {
        const { from, to } = val as DateRangeValue;
        if (!from && !to) continue;
        rows = rows.filter(row => {
          const raw = row[key];
          if (raw == null) return false;
          const rowDate = new Date(raw);
          if (from && rowDate < new Date(from)) return false;
          if (to && rowDate > new Date(to)) return false;
          return true;
        });
        continue;
      }

      // date — exact day match via ISO prefix
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
        rows = rows.filter(row => {
          const raw = row[key];
          if (raw == null) return false;
          return new Date(raw).toISOString().startsWith(val);
        });
        continue;
      }

      // text / select
      rows = rows.filter(row => {
        const v = row[key];
        return v != null && String(v).toLowerCase().includes(String(val).toLowerCase());
      });
    }

    // Sorting
    const col = this.sortColumn();
    const dir = this.sortDirection();
    if (col && dir) {
      rows.sort((a, b) => {
        const av = a[col], bv = b[col];
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return dir === 'ASC' ? cmp : -cmp;
      });
    }

    return rows;
  });

  protected paginatedRows = computed(() => {
    if (this.isServerSide()) return this.data();
    const all = this.processedRows();
    const start = (this.page() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  protected total = computed(() =>
    this.isServerSide()
      ? (this.paginationMeta()?.total ?? 0)
      : this.processedRows().length
  );

  protected totalPages = computed(() =>
    Math.ceil(this.total() / this.pageSize()) || 1
  );

  protected pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const delta = 2;
    const range: (number | '...')[] = [];
    let last = 0;
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        if (last && i - last > 1) range.push('...');
        range.push(i);
        last = i;
      }
    }
    return range;
  });

  // --- Lifecycle ---
  ngOnChanges(changes: SimpleChanges) {
    if (changes['paginationMeta'] && this.paginationMeta()) {
      this.page.set(this.paginationMeta()!.currentPage);
      this.pageSize.set(this.paginationMeta()!.pageSize);
    }
  }

  // --- Sorting ---
  onSort(col: ColumnDef<T>) {
    if (!col.sortable) return;
    const current = this.sortColumn();
    const dir = this.sortDirection();
    if (current !== col.key) {
      this.sortColumn.set(col.key);
      this.sortDirection.set('ASC');
    } else {
      this.sortDirection.set(dir === 'ASC' ? 'DESC' : dir === 'DESC' ? '' : 'ASC');
      if (this.sortDirection() === '') this.sortColumn.set('');
    }
    this.page.set(1);
    this.emitState();
  }

  sortIcon(colKey: string): string {
    if (this.sortColumn() !== colKey) return '↕';
    return this.sortDirection() === 'ASC' ? '↑' : '↓';
  }

  // --- Search & Filters ---
  onGlobalSearch(value: string) {
    this.globalSearch.set(value);
    this.page.set(1);
    this.emitState();
  }

  onColumnFilter(colKey: string, value: any) {
    this.columnFilters.update(f => ({ ...f, [colKey]: value }));
    this.page.set(1);
    this.emitState();
  }

  onDateRangeFilter(colKey: string, side: 'from' | 'to', value: string) {
    this.columnFilters.update(f => {
      const existing: DateRangeValue = f[colKey] ?? { from: '', to: '' };
      const updated: DateRangeValue = { ...existing, [side]: value };
      // if 'from' changed and is now after 'to', clear 'to'
      if (side === 'from' && updated.to && value > updated.to) {
        updated.to = '';
      }
      return { ...f, [colKey]: updated };
    });

    this.page.set(1);

    // Only emit / hit the API once BOTH sides are filled
    const range = this.columnFilters()[colKey] as DateRangeValue;
    if (range?.from && range?.to) {
      this.emitState();
    }
  }

  clearColumnFilter(colKey: string) {
    this.columnFilters.update(f => {
      const c = { ...f };
      delete c[colKey];
      return c;
    });
    this.page.set(1);
    this.emitState();
  }

  clearAllFilters() {
    this.globalSearch.set('');
    this.columnFilters.set({});
    this.page.set(1);
    this.emitState();
  }

  toggleColumnFilters() {
    this.showColumnFilters.update(v => !v);
  }

  get hasActiveFilters(): boolean {
    const cf = this.columnFilters();
    const hasColFilter = Object.values(cf).some(v => {
      if (v == null || v === '') return false;
      if (typeof v === 'object') {
        const range = v as DateRangeValue;
        return !!(range.from || range.to);
      }
      return true;
    });
    return !!this.globalSearch() || hasColFilter;
  }

  // --- Pagination ---
  goToPage(p: number | '...') {
    if (p === '...') return;
    this.page.set(Math.max(1, Math.min(p, this.totalPages())));
    this.emitState();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.page.set(1);
    this.emitState();
  }

  // --- Cell value ---
  getCellValue(row: T, col: ColumnDef<T>): string {
    const raw = row[col.key];
    if (col.valueFormatter) return col.valueFormatter(raw, row);
    if (raw == null || raw === '') return col.nullPlaceholder ?? '—';

    if (col.filterType === 'date' || col.filterType === 'dateRange') {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        const opts: Record<string, Intl.DateTimeFormatOptions> = {
          short: { day: '2-digit', month: 'short', year: 'numeric' },
          long: { day: '2-digit', month: 'long', year: 'numeric' },
          time: { hour: '2-digit', minute: '2-digit' },
          datetime: { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' },
        };
        return d.toLocaleDateString('en-GB', opts[col.dateFormat ?? 'short']);
      }
    }

    return raw;
  }

  onEditRoute(id: string) {
    this.route.navigateByUrl(`${this.getBasePath()}/edit/${id}`);
  }

  onViewRoute(id: string) {
    this.route.navigateByUrl(`${this.getBasePath()}/view/${id}`);
  }

  onCopyRoute(id: string) {
    this.route.navigateByUrl(`${this.getBasePath()}/new/${id}`);
  }

  getBasePath(): string {
    return this.route.url.replace(/^\/+/, '');
  }
   onRowClick(event:any) {
    this.onViewRoute(event?.['id']);
  }
  protected onRowAction(action: TableActionType, row: T) {
    this.rowAction.emit({ action, row });
    switch (action) {
      case 'edit':
        this.onEditRoute(row?.['id']);
        this.onEdit.emit(row);
        break;
      case 'copy':
        this.onCopyRoute(row?.['id']);
        this.onCopy.emit(row);
        break;
      case 'delete':
        this.onDelete.emit(row);
        break;
      case 'activate':
        this.onActivate.emit(row);
        break;
      case 'deactivate':
        this.onDeactivate.emit(row);
        break;
    }
  }

  protected getActionLabel(action: TableActionType): string {
    switch (action) {
      case 'edit': return 'Edit';
      case 'delete': return 'Delete';
      case 'activate': return 'Activate';
      case 'deactivate': return 'Deactivate';
      default: return action;
    }
  }

  protected getActionButtonClasses(action: TableActionType): string {
    switch (action) {
      case 'edit': return 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100';
      case 'delete': return 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100';
      case 'activate': return 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100';
      case 'deactivate': return 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100';
      default: return 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50';
    }
  }

  getVisibleActions(col: ColumnDef<T>, row: T): TableActionType[] {
    if (!col.actions?.length) return [];
    return col.actionCondition ? col.actionCondition(row) : col.actions;
  }

  getColumnFilter(key: string): any {
    return this.columnFilters()[key] ?? '';
  }

  // --- Emit state for server-side ---
  private emitState() {
    if (!this.isServerSide()) return;
    const state: TableState = {
      currentPage: this.page(),
      pageSize: this.pageSize(),
      ...(this.sortColumn() && { sortBy: this.sortColumn() }),
      ...(this.sortDirection() && { sortOrder: this.sortDirection() }),
      search: this.globalSearch(),
      columnFilters: this.columnFilters(),
    };
    this.stateChange.emit({ state });
  }

  protected minOf(a: number, b: number): number {
    return Math.min(a, b);
  }
}