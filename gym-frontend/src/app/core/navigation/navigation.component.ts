import { Tree, TreeItem, TreeItemGroup } from '@angular/aria/tree';
import { CdkMonitorFocus } from '@angular/cdk/a11y';
import { NgClass, NgTemplateOutlet } from '@angular/common';
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
import { AuthState } from '@/app/core/services/auth.state';
import { NavigationService } from './navigation.service';

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
  standalone: true,
  imports: [
    MatIcon,
    NgTemplateOutlet,
    RouterLinkActive,
    Tree,
    NgClass,
    TreeItem,
    TreeItemGroup,
    RouterLink,
    CdkMonitorFocus,
  ],
  templateUrl: './navigation.component.html'
})
export class Navigation {
  // Dependencies
  private router = inject(Router);
  private state = inject(AuthState);
  private navigationService = inject(NavigationService);
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
      const activeItem = this.findActiveItem(this.navigation());
      this.navigationService.setActiveItem(activeItem);
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

  onSectionClick(section: NavigationItem): void {
    if (section.route) {
      this.router.navigateByUrl(section.route);
    }
  }

  private findActiveItem(items: NavigationItem[]): NavigationItem | null {
    for (const item of items) {
      if (this.isRouteActive(item)) {
        return item;
      }

      if (item.children) {
        const activeChild = this.findActiveItem(item.children);
        if (activeChild) {
          return activeChild;
        }
      }
    }

    return null;
  }


}