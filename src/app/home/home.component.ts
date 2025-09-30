import { Component } from '@angular/core';
import { ToolbarComponent } from '../shared/toolbar.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../shared/footer.component';

@Component({
  selector: 'app-home',
  imports: [ToolbarComponent, RouterOutlet, FooterComponent],
  template: `
    <app-toolbar />
    <div class="content"><router-outlet></router-outlet></div>
    <app-footer />
  `,
  styles: `
  .content{
    flex: 1;
  }
  `,
})
export default class HomeComponent {}
