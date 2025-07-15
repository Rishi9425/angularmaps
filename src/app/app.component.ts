import { Component } from '@angular/core';
import { GoogleMapsComponent } from './google-maps/google-maps.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GoogleMapsComponent],
  template: `
    <div class="app-container">
      <app-google-maps></app-google-maps>
    </div>
  `,
  styles: [`
    .app-container {
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    h1 {
      color: #333;
      text-align: center;
      margin-bottom: 20px;
    }
  `]
})
export class AppComponent {
  title = 'angularmaps';
}