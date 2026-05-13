import { Tree, TreeItem, TreeItemGroup } from '@angular/aria/tree';
import { CdkMonitorFocus } from '@angular/cdk/a11y';
import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import {
  isActive,
  IsActiveMatchOptions,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { filter } from 'rxjs';
import { AuthState } from '@/app/domains/auth/auth.state';

export interface NavigationItem {
  id: string;
  label: string;
  type?: string;
  icon?: string;
  route?: string;
  description?: string;
  badge?: string | { title: string; classes: string };
  disabled?: boolean;
  expanded?: boolean;
  children?: NavigationItem[];
  activeOptions?: { exact: boolean } | IsActiveMatchOptions;
}

@Component({
  selector: 'navigation',
  imports: [
    MatIcon,
    NgTemplateOutlet,
    RouterLinkActive,
    Tree,
    TreeItem,
    TreeItemGroup,
    RouterLink,
    CdkMonitorFocus,
  ],
  template: `
    <div class="flex flex-col gap-y-4">
      @for (section of navigation(); track section.id) {
        <div class="flex flex-col px-4">
          <!-- Section title -->
          <div class="px-2.5 py-1.5 text-sm font-semibold text-blue-400">
            {{ section.label }}

            <!-- Section description -->
            @if (section.description) {
              <div class="text-xs font-medium text-neutral-400">
                {{ section.description }}
              </div>
            }
          </div>

          <!-- Section content -->
          <ul
            ngTree
            class="mt-1 flex flex-col gap-y-1"
            [nav]="true"
            #tree="ngTree"
          >
            <ng-template
              [ngTemplateOutlet]="treeNodes"
              [ngTemplateOutletContext]="{
                nodes: section.children,
                parent: tree,
              }"
            />
          </ul>
        </div>
      }
    </div>

    <!-- Menu item template -->
    <ng-template
      let-nodes="nodes"
      let-parent="parent"
      #treeNodes
    >
      @for (node of nodes; track node.id) {
        <li
          cdkMonitorElementFocus
          ngTreeItem
          [parent]="parent"
          [value]="node.id"
          [label]="node.label"
          [disabled]="node.disabled"
          [selectable]="!node.children"
          [(expanded)]="node.expanded"
          #treeItem="ngTreeItem"
        >
          <a
            [routerLink]="node.route"
            [routerLinkActive]="node.route ? 'bg-neutral-700/10 dark:bg-neutral-300/10' : ''"
            [routerLinkActiveOptions]="node.activeOptions ?? { exact: true }"
            (click)="handleItemClick($event, node)"
            class="navigation-item flex cursor-pointer items-center gap-x-2 rounded-lg px-2.5 py-2 select-none hover:bg-neutral-700/10 dark:hover:bg-neutral-300/10"
            [class.bg-neutral-700/10]="isRouteActive(node)"
            [class.dark:bg-neutral-300/10]="isRouteActive(node)"
          >
            <!-- Icon -->
            @if (node.icon) {
              <mat-icon
                class="pointer-events-none size-4"
                [svgIcon]="node.icon"
              />
            }

            <!-- Label -->
            <div class="flex flex-auto flex-col font-medium">
              {{ node.label }}

              <!-- Description -->
              @if (node.description) {
                <div class="text-xs">
                  {{ node.description }}
                </div>
              }
            </div>

            <!-- Badge -->
            @if (node.badge) {
              <div
                class="rounded bg-pink-400 px-1.5 py-0.5 text-xs font-semibold dark:bg-pink-700"
              >
                {{ typeof node.badge === 'string' ? node.badge : node.badge.title }}
              </div>
            }

            <!-- Expand icon -->
            @if (node.children && node.children.length > 0) {
              <mat-icon
                svgIcon="chevron-right"
                class="pointer-events-none size-4 transition-[rotate]"
                [class.rotate-90]="node.expanded"
              />
            }
          </a>

          <!-- Children -->
          @if (node.children && node.children.length > 0) {
            <ul
              class="flex flex-col gap-y-1 [&_ul>.navigation-item]:pl-14.5 [&>.navigation-item]:pl-8.5"
              [class.hidden]="!node.expanded"
              [class.mt-1]="node.expanded"
              role="group"
            >
              <ng-template
                ngTreeItemGroup
                [ownedBy]="treeItem"
                #group="ngTreeItemGroup"
              >
                <ng-template
                  [ngTemplateOutlet]="treeNodes"
                  [ngTemplateOutletContext]="{
                    nodes: node.children,
                    parent: group,
                  }"
                />
              </ng-template>
            </ul>
          }
        </li>
      }
    </ng-template>
  `,
})
export class Navigation {
  // Dependencies
  private router = inject(Router);
  private state = inject(AuthState);

  // State
  readonly navigation = computed<NavigationItem[]>(() => {
    const navItems = this.mapNavItems(this.state.navigation());
    return this.initializeExpandedState(navItems);
  });

  private navigationEnd = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    )
  );

  constructor() {
    // Expand active route on navigation end
    effect(() => {
      this.navigationEnd();
      this.updateExpandedState();
    });
  }

  private mapNavItems(items: any[]): NavigationItem[] {
    if (!items || !items.length) return [];
    
    return items.map(item => ({
      id: item.id_key || item.id,
      label: item.title || item.label,
      type: item.type,
      icon: item.icon,
      route: item.link || item.route,
      description: item.description,
      badge: item.badge,
      disabled: item.disabled || false,
      expanded: false,
      children: item.children?.length ? this.mapNavItems(item.children) : undefined,
      activeOptions: item.activeOptions ?? { exact: true }
    }));
  }

  private initializeExpandedState(items: NavigationItem[]): NavigationItem[] {
    return items.map(item => ({
      ...item,
      expanded: this.shouldBeExpanded(item),
      children: item.children ? this.initializeExpandedState(item.children) : undefined
    }));
  }

  private shouldBeExpanded(item: NavigationItem): boolean {
    // Check if this item or any child is active
    if (this.isRouteActive(item)) {
      return true;
    }
    
    if (item.children) {
      return item.children.some(child => this.shouldBeExpanded(child));
    }
    
    return false;
  }

  private updateExpandedState(): void {
    const currentNav = this.navigation();
    const updatedNav = this.updateExpandedStateRecursive(currentNav);
    
    // Only update if there are changes
    if (JSON.stringify(currentNav) !== JSON.stringify(updatedNav)) {
      (this.navigation as any).set(updatedNav);
    }
  }

  private updateExpandedStateRecursive(items: NavigationItem[]): NavigationItem[] {
    return items.map(item => {
      const updatedChildren = item.children 
        ? this.updateExpandedStateRecursive(item.children)
        : undefined;
      
      const shouldExpand = this.isRouteActive(item) || 
        (updatedChildren?.some(child => child.expanded) ?? false);
      
      return {
        ...item,
        expanded: shouldExpand,
        children: updatedChildren
      };
    });
  }

  isRouteActive(item: NavigationItem): boolean {
    if (!item.route) return false;
    
    const options = this.isActiveOption(item.activeOptions ?? { exact: true });
    return isActive(item.route, this.router, options)();
  }

  handleItemClick(event: Event, node: NavigationItem): void {
    event.preventDefault();
    
    // Toggle expanded state for items with children
    if (node.children && node.children.length > 0) {
      node.expanded = !node.expanded;
      
      // Force update the signal
      const currentNav = this.navigation();
      (this.navigation as any).set([...currentNav]);
    } else if (node.route) {
      // Navigate to the route
      this.router.navigateByUrl(node.route);
    }
  }

  /**
   * Convert simple exact option to full IsActiveMatchOptions.
   * @param options
   */
  isActiveOption(
    options: { exact: boolean } | IsActiveMatchOptions
  ): IsActiveMatchOptions {
    if ('exact' in options) {
      return options.exact
        ? {
            paths: 'exact',
            queryParams: 'exact',
            fragment: 'ignored',
            matrixParams: 'ignored',
          }
        : {
            paths: 'subset',
            queryParams: 'subset',
            fragment: 'ignored',
            matrixParams: 'ignored',
          };
    }
    return options;
  }
}