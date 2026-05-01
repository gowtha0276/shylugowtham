import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WeddingInviteComponent } from './wedding-invite/wedding-invite.component';

@Component({
  selector: 'app-root',
  imports: [WeddingInviteComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ShyluWedsGowtham';
}
