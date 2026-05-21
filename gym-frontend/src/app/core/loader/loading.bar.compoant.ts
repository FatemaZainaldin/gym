// src/app/core/loading/loading-bar.component.ts
import { Component, inject } from '@angular/core';
import { LoadingService }    from './loading.service';

@Component({
  standalone: true,
  selector: 'app-loading-bar',
  template: `
    @if (loading.show()) {
      <div class="loading-bar"></div>
    }
  `,
  styles: [`
    .loading-bar {
      position: fixed;
      top: 0; left: 0;
      height: 3px;
      width: 100%;
      z-index: 9999;
      background: #059669;
      animation: loading 1.5s ease-in-out infinite;
    }
    @keyframes loading {
      0%   { transform: translateX(-100%); }
      50%  { transform: translateX(0%); }
      100% { transform: translateX(100%); }
    }
  `],
})
export class LoadingBarComponent {
  loading = inject(LoadingService);
}