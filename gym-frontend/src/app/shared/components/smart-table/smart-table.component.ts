import { CommonModule } from '@angular/common';
import {
  Component, Input, Output, EventEmitter,
  OnChanges, SimpleChanges, computed, signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  ColumnDef, PaginationMeta, TableState, TableRequestEvent, SortDirection
} from './smart-table.types';

@Component({
  selector: 'app-smart-table',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './smart-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmartTableComponent<T extends Record<string, any>> implements OnChanges {

  // --- Inputs ---
  @Input() columns: ColumnDef<T>[] = [];
  @Input() data: T[] = [];

  /** Pass this when server controls pagination. Omit for client-side. */
  @Input() paginationMeta?: PaginationMeta;

  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];
  @Input() defaultPageSize = 10;
  @Input() loading = false;
  @Input() emptyMessage = 'No records found.';
  @Input() showGlobalSearch = true;
  @Input() globalSearchPlaceholder = 'Search…';

  // --- Outputs ---
  /** Emitted on every state change when server-side mode is active */
  @Output() stateChange = new EventEmitter<TableRequestEvent>();

  // --- Internal reactive state ---
  protected page = signal(1);
  protected pageSize = signal(this.defaultPageSize);
  protected sortColumn = signal('');
  protected sortDirection = signal<SortDirection>('');
  protected globalSearch = signal('');
  protected columnFilters = signal<Record<string, any>>({});
  protected showColumnFilters = signal(false);

  // True when consumer provided paginationMeta (server-side)
  protected get isServerSide(): boolean {
    return !!this.paginationMeta;
  }

  // --- Derived: processed rows (client-side only) ---
  protected processedRows = computed(() => {
    if (this.isServerSide) return this.data; // server already filtered/sorted

    let rows = [...this.data];

    // Global search
    const q = this.globalSearch().toLowerCase().trim();
    if (q) {
      rows = rows.filter(row =>
        this.columns.some(col => {
          const v = row[col.key];
          return v != null && String(v).toLowerCase().includes(q);
        })
      );
    }

    // Column filters
    const filters = this.columnFilters();
    for (const [key, val] of Object.entries(filters)) {
      if (val === '' || val == null) continue;
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
        return dir === 'asc' ? cmp : -cmp;
      });
    }

    return rows;
  });

  protected paginatedRows = computed(() => {
    if (this.isServerSide) return this.data;
    const all = this.processedRows();
    const start = (this.page() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  protected total = computed(() =>
    this.isServerSide
      ? (this.paginationMeta?.total ?? 0)
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
    // When server data arrives, keep page as-is
    if (changes['paginationMeta'] && this.paginationMeta) {
      this.page.set(this.paginationMeta.currentPage);
      this.pageSize.set(this.paginationMeta.pageSize);
    }
  }

  // --- Sorting ---
  onSort(col: ColumnDef<T>) {
    if (!col.sortable) return;
    const current = this.sortColumn();
    const dir = this.sortDirection();
    if (current !== col.key) {
      this.sortColumn.set(col.key);
      this.sortDirection.set('asc');
    } else {
      this.sortDirection.set(dir === 'asc' ? 'desc' : dir === 'desc' ? '' : 'asc');
      if (this.sortDirection() === '') this.sortColumn.set('');
    }
    this.page.set(1);
    this.emitState();
  }

  sortIcon(colKey: string): string {
    if (this.sortColumn() !== colKey) return '↕';
    return this.sortDirection() === 'asc' ? '↑' : '↓';
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

  clearColumnFilter(colKey: string) {
    this.columnFilters.update(f => { const c = { ...f }; delete c[colKey]; return c; });
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
    return !!this.globalSearch() || Object.values(cf).some(v => v !== '' && v != null);
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
    return col.valueFormatter ? col.valueFormatter(raw, row) : (raw ?? '');
  }

  getColumnFilter(key: string): any {
    return this.columnFilters()[key] ?? '';
  }

  // --- Emit state for server-side ---
  private emitState() {
    if (!this.isServerSide) return;
    const state: TableState = {
      page: this.page(),
      pageSize: this.pageSize(),
      sortColumn: this.sortColumn(),
      sortDirection: this.sortDirection(),
      globalSearch: this.globalSearch(),
      columnFilters: this.columnFilters(),
    };
    this.stateChange.emit({ state });
  }

  protected minOf(a: number, b: number): number {
    return Math.min(a, b);
  }
}