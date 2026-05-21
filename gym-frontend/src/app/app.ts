import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingBarComponent } from './core/loader/loading.bar.compoant';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingBarComponent],
  host: {
    // Ensure root component fills the entire viewport
    class: 'flex min-h-full w-full flex-auto flex-col',
  },
  template: `
<app-loading-bar />
<router-outlet />
`,
})
export class App { }
