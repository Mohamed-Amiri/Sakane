import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container">
      <div class="notfound">
        <div class="notfound__code">404</div>
        <h1>This page doesn't exist</h1>
        <p class="text-secondary">The link may be broken, or the place you're looking for may have been removed. Demo data also resets, just like the backend's in-memory database.</p>
        <div class="cluster">
          <a class="btn btn--primary" routerLink="/">Back to explore</a>
          <a class="btn btn--secondary" routerLink="/search">Search places</a>
        </div>
      </div>
    </div>
  `
})
export class NotFoundComponent {}
