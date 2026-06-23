import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SmartTableComponent } from '@/app/shared/components/smart-table/smart-table.component';
import { ColumnDef, defaultPaginationMeta, PaginationMeta, TableRequestEvent } from '@/app/shared/components/smart-table/smart-table.types';
import { ClientsService } from '../clients.service';

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
  imports: [CommonModule, SmartTableComponent, MatIconModule],

})
export class ClientsListComponent implements OnInit {

  private clientsService = inject(ClientsService);

  paginationMeta = signal<PaginationMeta>(defaultPaginationMeta);
  data = signal([]);
  loading = signal<boolean>(false);

  columns: ColumnDef[] = [
    { key: 'createdAt', label: 'Created At', sortable: true, filterable: false, hideColumn: false, filterType: 'date', dateFormat: 'short' ,nullPlaceholder: 'N/A' },
    { key: 'name', label: 'Name', sortable: true, filterable: false },
    { key: 'subdomain', label: 'Subdomain', sortable: true, filterable: false },

    { key: 'adminEmail', label: 'Email', sortable: true, filterable: false },
    { key: 'phone', label: 'Phone', sortable: true, filterable: false },
    {
      key: 'country', label: 'country', sortable: true, filterable: true, filterType: 'select', filterOptions: [
        { label: 'Bahrain', value: 'Bahrain' },
        { label: 'Saudi Arabia', value: 'Saudi Arabia' },
        { label: 'United Arab Emirates', value: 'United Arab Emirates' },
        { label: 'Kuwait', value: 'Kuwait' },
        { label: 'Oman', value: 'Oman' },
        { label: 'Qatar', value: 'Qatar' },
      ]
    },
    {
      key: 'plan', label: 'Plan', sortable: true, filterable: true, filterType: 'select', filterOptions: [
        { label: 'Free', value: 'free' },
        { label: 'Starter', value: 'starter' },
        { label: 'Pro', value: 'pro' },
        { label: 'Enterprise', value: 'enterprise' },
      ]
    },
    { key: 'trialEndsAt', label: 'Trial Ends At', sortable: true, filterable: false, filterType: 'dateRange' },
    { key: 'suspendedAt', label: 'Suspended At', sortable: true, filterable: false, filterType: 'dateRange' },

    {
      key: 'status', label: 'Status', sortable: true, filterable: true,statusMap: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Active', value: 'active' },
        { label: 'Trial', value: 'trial' },
        { label: 'Suspended', value: 'suspended' },
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
      Object.entries(columnFilters ?? {}).flatMap(([key, value]) => {
        if (value === '' || value == null) {
          return [];
        }

        if (
          typeof value === 'object' &&
          !Array.isArray(value) &&
          value !== null
        ) {
          return Object.entries(value)
            .filter(([_, nestedValue]) => nestedValue !== '' && nestedValue != null)
            .map(([nestedKey, nestedValue]) => [
              `${key}${nestedKey.charAt(0).toUpperCase()}${nestedKey.slice(1)}`,
              nestedValue,
            ]);
        }

        return [[key, value]];
      })
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

  onDelete(row: any) {
    const id = row?.id;
    if (!id) return;
    this.clientsService.deleteClient(id).subscribe(() => {
      // refresh list after deletion
      this.onTableStateChange();
    });
  }

}