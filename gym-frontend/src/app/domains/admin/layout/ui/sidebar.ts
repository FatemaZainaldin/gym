import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Navigation } from '@/app/domains/admin/layout/ui/navigation';
import { User } from '@/app/domains/admin/layout/ui/user';

@Component({
  selector: 'admin-sidebar',
  imports: [Navigation, User, MatButton, MatIcon],
  host: {
    class: 'flex w-full flex-auto flex-col',
  },
  template: `
    <!-- Header -->
    <div class="relative flex items-center gap-x-2.5 pt-5 pr-4 pb-0 pl-6">
      <!-- Logo -->
    

<div class="flex items-baseline gap-0.5">
  <span class="font-black text-4xl tracking-tighter text-primary-500"
        style="font-family:'Montserrat',sans-serif">G</span>
  <span class="font-semibold text-2xl tracking-tight text-primary-500"
        style="font-family:'Montserrat',sans-serif">ymly</span>
</div>
    </div>

    <!-- Navigation -->
    <navigation class="mt-8 mb-4 flex-auto" />

    <!-- Spacer -->
    <div class="flex-auto"></div>

    <!-- Sidebar notification -->
    <div
      class="m-4 mb-2 rounded-lg border border-neutral-900/5 bg-neutral-900/5 p-4 dark:border-neutral-50/5 dark:bg-neutral-50/5"
    >
      <div class="font-semibold">Your trial is expiring soon!</div>
      <div class="mt-1 text-sm">
        You have 3 days left in your trial. Upgrade to pro to continue using all
        features.
      </div>
      <button
        matButton="filled"
        class="small mt-4 w-full"
      >
        Upgrade now
        <mat-icon
          svgIcon="move-right"
          iconPositionEnd
        />
      </button>
    </div>

    <!-- Footer -->
    <div class="p-2">
      <user />
    </div>
  `,
})
export class AdminSidebar {}
