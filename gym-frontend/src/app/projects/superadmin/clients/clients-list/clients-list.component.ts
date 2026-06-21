import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SmartTableComponent } from '@/app/shared/components/smart-table/smart-table.component';
import { ColumnDef, defaultPaginationMeta, PaginationMeta, TableRequestEvent } from '@/app/shared/components/smart-table/smart-table.types';
import { ClientsService } from '../clients.service';

@Component({
  selector: 'app-clients-list',
  imports: [CommonModule, SmartTableComponent, MatIconModule],
  templateUrl: './clients-list.component.html',

})
export class ClientsListComponent implements OnInit {

  private clientsService = inject(ClientsService);

  paginationMeta = signal<PaginationMeta>(defaultPaginationMeta);
  data = signal([]);
  loading = signal<boolean>(false);

  columns: ColumnDef[] = [
    { key: 'name', label: 'Name', sortable: true, filterable: true },
    { key: 'subdomain', label: 'Subdomain', sortable: true, filterable: true },
    { key: 'country', label: 'country', sortable: true, filterable: true },
    { key: 'adminEmail', label: 'Email', sortable: true, filterable: true },
    { key: 'phone', label: 'Phone', sortable: true, filterable: true },
    { key: 'plan', label: 'Plan', sortable: true, filterable: true },
        { key: 'trialEndsAt', label: 'Trial Ends At', sortable: true, filterable: true },
        { key: 'suspendedAt', label: 'Suspended At', sortable: true, filterable: true },

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


    this.clientsService.getAllClients(finalParams).subscribe(res => {
      this.data.set(res?.data ?? []);
      this.paginationMeta.set(res.meta);
      this.loading.set(false);
    });
  }
}