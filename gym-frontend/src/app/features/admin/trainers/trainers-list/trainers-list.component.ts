import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectorRef, Signal, signal, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { User } from '@/app/core/models/user.model';
import { SmartTableComponent } from '@/app/shared/components/smart-table/smart-table.component';
import { ColumnDef, defaultPaginationMeta, PaginationMeta, TableRequestEvent } from '@/app/shared/components/smart-table/smart-table.types';
import { TrainersService } from '../trainers.service';

@Component({
  selector: 'app-trainers-list',
  imports: [CommonModule, SmartTableComponent, MatIconModule],
  templateUrl: './trainers-list.component.html',

})
export class TrainersListComponent implements OnInit {

  private trainerService = inject(TrainersService);
  private cdr = inject(ChangeDetectorRef);

  paginationMeta = signal<PaginationMeta>(defaultPaginationMeta);
  data = signal([]);
  loading = signal<boolean>(false);

  columns: ColumnDef[] = [
    { key: 'firstName', label: 'First Name', sortable: true, filterable: true },
    { key: 'lastName', label: 'Last Name', sortable: true, filterable: true },
    { key: 'email', label: 'Email', sortable: true, filterable: true },
    {
      key: 'status', label: 'Status', sortable: true, filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ]
    },
  ];

  ngOnInit() {
     this.onTableStateChange()
  }

  onTableStateChange(event?: TableRequestEvent) {
    const { page, pageSize, sortColumn, sortDirection, globalSearch, columnFilters } = event?.state || {};
    this.loading.set(true);

    this.trainerService.getAllTrainers({ page, pageSize, sort: sortColumn, dir: sortDirection, q: globalSearch, ...columnFilters })
      .subscribe(res => {
        this.data.set(res?.data ?? [])
        this.paginationMeta.set(res.meta);
        this.loading.set(false);
        this.cdr.detectChanges();
      });
  }
}