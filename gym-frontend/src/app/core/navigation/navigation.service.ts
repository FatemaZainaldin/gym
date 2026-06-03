import { Injectable, signal } from '@angular/core';
import { NavigationItem } from './navigation.component';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  readonly activeItem = signal<NavigationItem | null>(null);

  setActiveItem(item: NavigationItem | null): void {
    this.activeItem.set(item);
  }
}