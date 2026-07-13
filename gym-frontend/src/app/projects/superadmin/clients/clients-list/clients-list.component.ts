import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SmartTableComponent } from '@/app/shared/components/smart-table/smart-table.component';
import { ColumnDef, defaultPaginationMeta, PaginationMeta, TableActionType, TableRequestEvent } from '@/app/shared/components/smart-table/smart-table.types';
import { ClientsService } from '../clients.service';
import { ToastService } from '@/app/core/toast/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@/app/shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogData, ConfirmDialogResult } from '@/app/shared/components/confirm-dialog/confirm-dialog.model.ts';
import { Tenant } from '../clients.model';

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
  imports: [CommonModule, SmartTableComponent, MatIconModule],

})
export class ClientsListComponent implements OnInit {

  private clientsService = inject(ClientsService);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);

  paginationMeta = signal<PaginationMeta>(defaultPaginationMeta);
  data = signal([]);
  loading = signal<boolean>(false);

  columns: ColumnDef[] =
    [
      {
        key: 'createdAt', label: 'Created At', sortable: true, filterable: false, hideColumn: false,
        filterType: 'date', dateFormat: 'short', nullPlaceholder: 'N/A'
      },
      { key: 'name', label: 'Name', sortable: true, filterable: false },
      { key: 'subdomain', label: 'Subdomain', sortable: true, filterable: false },

      { key: 'email', label: 'Email', sortable: true, filterable: false },
      { key: 'phone', label: 'Phone', sortable: true, filterable: false },
      {
        key: 'country', label: 'country', sortable: true, filterable: true, filterType: 'select',
        filterOptions: [
          { label: 'Bahrain', value: 'Bahrain' },
          { label: 'Saudi Arabia', value: 'Saudi Arabia' },
          { label: 'United Arab Emirates', value: 'United Arab Emirates' },
          { label: 'Kuwait', value: 'Kuwait' },
          { label: 'Oman', value: 'Oman' },
          { label: 'Qatar', value: 'Qatar' },
        ]
      },
      {
        key: 'plan', label: 'Plan', sortable: true, filterable: true, filterType: 'select',
        filterOptions: [
          { label: 'Free', value: 'free' },
          { label: 'Starter', value: 'starter' },
          { label: 'Pro', value: 'pro' },
          { label: 'Enterprise', value: 'enterprise' },
        ]
      },
      { key: 'trialEndsAt', label: 'Trial Ends At', sortable: true, filterable: false, filterType: 'dateRange' },
      { key: 'suspendedAt', label: 'Suspended At', sortable: true, filterable: false, filterType: 'dateRange' },

      {
        key: 'status', label: 'Status', sortable: true, filterable: true, statusMap: true,
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
        actions: ['edit', 'copy', 'delete', 'resend', 'activate', 'deactivate'],
        actionCondition: (row) => {
          const actions: TableActionType[] = ['edit', 'copy', 'delete'];

          if (['suspended', 'inactive'].includes(row.status)) {
            actions.push('activate');
          }

          if (['active', 'trial'].includes(row.status)) {
            actions.push('deactivate');
          }

          if (row.status === 'inactive') {
            actions.push('resend');
          }

          return actions;
        }
      }
    ];

  ngOnInit() {
    this.getClientsList()
  }

  getClientsList(event?: TableRequestEvent) {

    const { currentPage = defaultPaginationMeta.currentPage, pageSize = defaultPaginationMeta.pageSize,
      sortBy = 'createdAt', sortOrder = 'ASC', search, columnFilters } = event?.state || {};
    this.loading.set(true);

    // moving empty values (e.g., search = '' or search = null will be excluded).
    const cleanFilters = Object.fromEntries(
      Object.entries(columnFilters ?? {}).flatMap(([key, value]) => {
        if (value === '' || value == null) {
          return [];
        }

        // This solution is designed for cases like trialEndAt, 
        // where an object such as { from: 1/1/2026, to: 1/2/2026 } is transformed into trialEndAtFrom and trialEndAtTo        
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
    this.clientsService.getAllClients(finalParams).subscribe({
      next: (res) => {
        this.data.set(res?.data ?? []);
        this.paginationMeta.set(res.meta);
        this.loading.set(false);
      },
      error: (err) => {
        this.toast.showMessage(err?.error?.message, 'error');
        this.loading.set(false);
      }
    });


  }

  onDelete(row: Tenant) {
    this.openConfirm(
      {
        action: 'delete',
        itemName: row.name,
        requireAcknowledge: true,
      },
      () => {
        const id = row?.id;
        if (!id) return;
        this.loading.set(true);
        this.clientsService.deleteClient(id).subscribe({
          next: (res) => {
            this.loading.set(false);
            this.toast.showMessage(res?.message, 'success');
            this.getClientsList();
          },
          error: (err) => {
            this.toast.showMessage(err?.error?.message, 'error');
            this.loading.set(false);
          }
        });
      }
    );

  }

  private openConfirm(data: ConfirmDialogData, onConfirm: (reason?: string) => void) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data,
        width: '440px',
        autoFocus: false,
        disableClose: true,
      })
      .afterClosed()
      .subscribe((result: ConfirmDialogResult) => {
        if (result?.confirmed) onConfirm(result.reason);
      });
  }


  onDeactivate(row: Tenant) {
    this.openConfirm(
      {
        action: 'deactivate',
        itemName: row.name,
        requireAcknowledge: true,
      },
      () => {
        const id = row?.id;
        if (!id) return;
        this.loading.set(true);
        this.clientsService.deactivateClient(id).subscribe({
          next: (res) => {
            this.loading.set(false);
            this.toast.showMessage(res?.message, 'success');
            this.getClientsList();
          },
          error: (err) => {
            this.toast.showMessage(err?.error?.message, 'error');
            this.loading.set(false);
          }
        });
      }
    );

  }


  onResend(row: Tenant) {
    if (!row?.id) return;
    this.loading.set(true);
    this.clientsService.resendClientCredentials(row?.id).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.showMessage(res?.message, 'success');
        this.getClientsList();
      },
      error: (err) => {
        this.toast.showMessage(err?.error?.message, 'error');
        this.loading.set(false);
      }
    });
  }



  onActivate(row: Tenant) {
    this.openConfirm(
      {
        action: 'activate',
        itemName: row.name,
        requireAcknowledge: true,
      },
      () => {
        const id = row?.id;
        if (!id) return;
        this.loading.set(true);
        this.clientsService.activateClient(id).subscribe({
          next: (res) => {
            this.loading.set(false);
            this.toast.showMessage(res?.message, 'success');
            this.getClientsList();
          },
          error: (err) => {
            this.toast.showMessage(err?.error?.message, 'error');
            this.loading.set(false);
          }
        });
      }
    );

  }


}