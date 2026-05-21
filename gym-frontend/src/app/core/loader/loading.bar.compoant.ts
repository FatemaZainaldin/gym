import { Component, inject } from '@angular/core';
import { LoadingService }    from './loading.service';

@Component({
  standalone: true,
  selector: 'app-loading-bar',
  template: `
    @if (loading.show()) {
      <div class="lb-track">
        <div class="lb-bar"></div>
        <div class="lb-glow"></div>
      </div>
    }
  `,
  styles: [`
    .lb-track {
      position: fixed;
      top: 0; left: 0;
      width: 100%;
      height: 3px;
      z-index: 9999;
      background: rgba(5, 150, 105, 0.15);
      overflow: hidden;
    }

    .lb-bar {
      position: absolute;
      top: 0; left: 0;
      height: 100%;
      width: 40%;
      background: linear-gradient(
        90deg,
        transparent 0%,
        #059669 40%,
        #34d399 70%,
        #6ee7b7 100%
      );
      border-radius: 0 4px 4px 0;
      animation: slide 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }

    .lb-glow {
      position: absolute;
      top: -2px; left: 0;
      height: 7px;
      width: 40%;
      background: radial-gradient(
        ellipse at center,
        rgba(52, 211, 153, 0.6) 0%,
        transparent 70%
      );
      animation: slide 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      filter: blur(2px);
    }

    @keyframes slide {
      0%   { left: -45%; }
      100% { left: 105%; }
    }
  `],
})
export class LoadingBarComponent {
  loading = inject(LoadingService);
}