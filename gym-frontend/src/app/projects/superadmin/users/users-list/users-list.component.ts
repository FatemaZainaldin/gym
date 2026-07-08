import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AuthUser } from '@/app/core/services/auth.state';
import { ToastService } from '@/app/core/toast/toast.service';
import { ConfirmDialogComponent } from '@/app/shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogData, ConfirmDialogResult } from '@/app/shared/components/confirm-dialog/confirm-dialog.model.ts';
import { SmartTableComponent } from '@/app/shared/components/smart-table/smart-table.component';
import { ColumnDef, defaultPaginationMeta, PaginationMeta, TableActionType, TableRequestEvent } from '@/app/shared/components/smart-table/smart-table.types';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  imports: [CommonModule, SmartTableComponent, MatIconModule],

})
export class UsersListComponent implements OnInit {

  private usersService = inject(UsersService);
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
      { key: 'firstName', label: 'First Name', sortable: true, filterable: false },
      { key: 'lastName', label: 'Last Name', sortable: true, filterable: false },
      { key: 'email', label: 'Email', sortable: true, filterable: false },
      {
        key: 'role', label: 'Role', sortable: true, filterable: true, filterType: 'select', filterOptions: [
          { label: 'Super Admin', value: 'super_admin' },
          { label: 'Admin', value: 'admin' },
          { label: 'Trainer', value: 'trainer' },
          { label: 'Customer', value: 'customer' },
        ]
      },
      { key: 'phone', label: 'Phone', sortable: true, filterable: false },
      { key: 'tenant.subdomain', label: 'Domain Name', sortable: true, filterable: true, filterType: 'text' },
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
          const actions: TableActionType[] = [ 'copy', 'delete'];
          if (!['pending'].includes(row.status)) {
            actions.push('edit');
          }
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
    this.getUsersList()
  }

  getUsersList(event?: TableRequestEvent) {

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
        const finalKey = key.split('.').pop();
        return [[finalKey, value]];
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
    this.usersService.getAllUsers(finalParams).subscribe({
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

  onDelete(row: AuthUser) {
    this.openConfirm(
      {
        action: 'delete',
        itemName: row.firstName + ' ' + row.lastName,
        requireAcknowledge: true,
      },
      () => {
        const id = row?.id;
        if (!id) return;
        this.loading.set(true);
        this.usersService.deleteUser(id).subscribe({
          next: (res) => {
            this.loading.set(false);
            this.toast.showMessage(res?.message, 'success');
            this.getUsersList();
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


  onDeactivate(row: AuthUser) {
    this.openConfirm(
      {
        action: 'deactivate',
        itemName: row.firstName + ' ' + row.lastName,
        requireAcknowledge: true,
      },
      () => {
        const id = row?.id;
        if (!id) return;
        this.loading.set(true);
        this.usersService.deactivateUser(id).subscribe({
          next: (res) => {
            this.loading.set(false);
            this.toast.showMessage(res?.message, 'success');
            this.getUsersList();
          },
          error: (err) => {
            this.toast.showMessage(err?.error?.message, 'error');
            this.loading.set(false);
          }
        });
      }
    );

  }


  onResend(row: AuthUser) {
    if (!row?.id) return;
    this.loading.set(true);
    this.usersService.resendUserCredentials(row?.id).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.showMessage(res?.message, 'success');
        this.getUsersList();
      },
      error: (err) => {
        this.toast.showMessage(err?.error?.message, 'error');
        this.loading.set(false);
      }
    });
  }



  onActivate(row: AuthUser) {
    this.openConfirm(
      {
        action: 'activate',
        itemName: row.firstName + ' ' + row.lastName,
        requireAcknowledge: true,
      },
      () => {
        const id = row?.id;
        if (!id) return;
        this.loading.set(true);
        this.usersService.activateUser(id).subscribe({
          next: (res) => {
            this.loading.set(false);
            this.toast.showMessage(res?.message, 'success');
            this.getUsersList();
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