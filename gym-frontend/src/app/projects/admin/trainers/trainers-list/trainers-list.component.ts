import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
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

  paginationMeta = signal<PaginationMeta>(defaultPaginationMeta);
  data = signal([]);
  loading = signal<boolean>(false);

  columns: ColumnDef[] = [
    { key: 'firstName', label: 'First Name', sortable: true, filterable: true },
    { key: 'lastName', label: 'Last Name', sortable: true, filterable: true },
    { key: 'email', label: 'Email', sortable: true, filterable: false },
    {
      key: 'status', label: 'Status', sortable: true, filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ]
    },
    {
      key: 'actions', label: 'Actions', width: '220px', align: 'center',
      actions: ['edit', 'delete', 'activate', 'deactivate']
    }
  ];

  ngOnInit() {
    this.onTableStateChange()
  }

  onTableStateChange(event?: TableRequestEvent) {
    const { currentPage = 1, pageSize = 10, sortBy = 'createdAt', sortOrder = 'ASC', search, columnFilters } = event?.state || {};
    this.loading.set(true);

    const cleanFilters = Object.fromEntries(
      Object.entries(columnFilters ?? {}).filter(([_, v]) => v !== '' && v != null)
    );
    const finalParams = {
      sortBy,
      pageSize,
      sortOrder,
      currentPage,
      ...cleanFilters,
      ...search && ({ search }),
    }


    this.trainerService.getAllTrainers(finalParams).subscribe(res => {
      this.data.set(res?.data ?? []);
      this.paginationMeta.set(res.meta);
      this.loading.set(false);
    });
  }


  onDelete(row: any) {
    const id = row?.id ?? row?._id;
    console.log('Trainer delete requested', row);
    if (!id) return;
    this.trainerService.deleteTrainer(id).subscribe(() => {
      this.onTableStateChange();
    });
  }
}