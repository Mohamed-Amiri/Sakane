import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton" [class]="'skeleton-' + type" [style.width]="width" [style.height]="height">
      <div class="skeleton-shimmer"></div>
    </div>
  `,
  styles: [`
    .skeleton {
      position: relative;
      overflow: hidden;
      background: #EDE9DF;
      border-radius: 12px;
    }

    .skeleton-text {
      height: 1rem;
      width: 100%;
      border-radius: 6px;
    }

    .skeleton-title {
      height: 1.5rem;
      width: 75%;
      border-radius: 6px;
    }

    .skeleton-avatar {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
    }

    .skeleton-rectangle {
      width: 100%;
      height: 8rem;
    }

    .skeleton-card {
      width: 100%;
      height: 240px;
      border-radius: 16px;
    }

    .skeleton-circle {
      border-radius: 50%;
    }

    .skeleton-shimmer {
      position: absolute;
      top: 0;
      left: -150%;
      width: 150%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.55) 40%,
        rgba(255, 255, 255, 0.8) 50%,
        rgba(255, 255, 255, 0.55) 60%,
        transparent 100%
      );
      animation: shimmer 1.6s ease-in-out infinite;
    }

    @keyframes shimmer {
      0%   { left: -150%; }
      100% { left: 150%; }
    }
  `]
})
export class SkeletonComponent {
  @Input() type: 'text' | 'title' | 'avatar' | 'rectangle' | 'circle' | 'card' = 'text';
  @Input() width?: string;
  @Input() height?: string;
}
