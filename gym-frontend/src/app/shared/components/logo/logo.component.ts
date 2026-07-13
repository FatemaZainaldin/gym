import { AuthState } from '@/app/core/services/auth.state';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  imports: [
    RouterLink,
  ],
})
export class LogoComponent implements OnInit {
   public state = inject(AuthState)

  constructor() { }

  ngOnInit() {
  }

}
