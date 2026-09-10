import { Component, inject, signal, ChangeDetectionStrategy, OnInit, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ApiErrorPresenter } from '../../core/api/api-error-presenter';
import { IconComponent } from '../../shared/icon/icon.component';
import { ImgAttrsDirective } from '../../core/ui/img-attrs.directive';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Seeded demo accounts (backend data.sql) — password: Password1! */
const DEMO = [
  { label: 'Mohamed · Tenant', email: 'tenant@example.com', password: 'Password1!', initials: 'AM' },
  { label: 'Jean · Owner', email: 'owner@example.com', password: 'Password1!', initials: 'JD' }
];

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, IconComponent, ImgAttrsDirective],
  template: `
    <div class="auth-shell">
      <section class="auth-side" aria-hidden="true">
        <div class="auth-side__bg">
          <img [appImg]="'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=1200&auto=format&fit=crop'" alt="" />
        </div>
        <div class="auth-side__content">
          <span class="auth-side__brand">
            <svg viewBox="0 0 28 28" aria-hidden="true"><rect width="28" height="28" rx="7" fill="#2b3fdc"/><path d="M7 16.5 14 9l7 7.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 20h8" stroke="#7fd3e6" stroke-width="2.4" stroke-linecap="round"/></svg>
            Sakane
          </span>
          <h2>Places worth coming back to.</h2>
          <p>Real availability, owner-confirmed bookings, and reviews written only after completed stays.</p>
          <ul class="auth-side__facts">
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6Z"/><path d="m9 12 2 2 4-4"/></svg>
              No charge until the owner confirms
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4m8-4v4M3 10h18"/></svg>
              Live availability on every place
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3 6.6 7 .7-5.3 4.7 1.6 6.9L12 17.3 5.7 20.9l1.6-6.9L2 9.3l7-.7Z"/></svg>
              Reviews from completed stays only
            </li>
          </ul>
        </div>
      </section>
      <div class="auth-main">
        <div class="auth-card">
          <h1>Log in</h1>
          <p>Welcome back. Use your Sakane account credentials.</p>
          <div id="login-alert" aria-live="assertive">
            @if (reason() === 'expired') {
              <div class="alert alert--warning" role="alert">
                <strong>Session expired</strong>Please sign in again to continue.
              </div>
            } @else if (reason() === 'auth') {
              <div class="alert alert--warning" role="alert">
                <strong>Sign in required</strong>You need to sign in to access that page.
              </div>
            } @else if (reason() === 'registered') {
              <div class="alert alert--success" role="alert">
                <strong>Account created</strong>Sign in with your new credentials.
              </div>
            }
          </div>
          <form id="login-form" class="form" novalidate [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-field">
              <label class="form-label" for="li-email">Email</label>
              <input id="li-email" class="input" type="email" formControlName="email" autocomplete="email" inputmode="email" />
              @if (fieldError('email')) {
                <p class="field-error">{{ fieldError('email') }}</p>
              }
            </div>
            <div class="form-field">
              <label class="form-label" for="li-pass">Password</label>
              <div class="input-affix">
                <input id="li-pass" class="input" [type]="showPassword() ? 'text' : 'password'" formControlName="password" autocomplete="current-password" />
                <button
                  class="input-affix__toggle"
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
                  [attr.aria-pressed]="showPassword()"
                >
                  <app-icon [name]="showPassword() ? 'eye-off' : 'eye'" />
                </button>
              </div>
              @if (fieldError('password')) {
                <p class="field-error">{{ fieldError('password') }}</p>
              }
            </div>
            <div class="form-field">
              <label class="checkbox">
                <input type="checkbox" formControlName="remember" />
                <span>Keep me logged in on this device</span>
              </label>
            </div>
            <button class="btn btn--primary btn--block btn--lg" type="submit" [class.is-loading]="loading()">
              <span class="spinner" aria-hidden="true"></span><span>Log in</span>
            </button>
          </form>
          <p class="auth-card__alt">New to Sakane? <a routerLink="/register">Create an account</a></p>
          <div class="demo-accounts" aria-labelledby="demo-h">
            <p class="demo-accounts__label" id="demo-h"><span>Demo accounts</span><span>password <code>Password1!</code></span></p>
            <div class="demo-accounts__row">
              @for (d of demos; track d.email) {
                <button class="demo-chip" type="button" (click)="fillDemo(d)">
                  <span class="avatar" aria-hidden="true">{{ d.initials }}</span>
                  <span><strong>{{ d.label }}</strong><span>{{ d.email }}</span></span>
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private errPresenter = inject(ApiErrorPresenter);

  readonly loading = signal(false);
  readonly fieldErrors = signal<Record<string, string>>({});
  readonly showPassword = signal(false);
  readonly reason = computed(() => this.route.snapshot.queryParamMap.get('reason'));
  readonly demos = DEMO;

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(EMAIL_RE)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [false]
  });

  ngOnInit(): void {
    const registered = this.route.snapshot.queryParamMap.get('registered');
    const email = this.route.snapshot.queryParamMap.get('email');
    if (email) {
      this.form.patchValue({ email });
    }
  }

  fieldError(field: string): string | undefined {
    return this.fieldErrors()[field] ?? (this.form.get(field)?.errors?.['required'] && this.form.get(field)?.touched)
      ? 'This field is required.'
      : undefined;
  }

  fillDemo(d: typeof DEMO[number]): void {
    this.form.patchValue({ email: d.email, password: d.password });
  }

  onSubmit(): void {
    this.fieldErrors.set({});
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const v = this.form.value;
    this.auth.login({ email: v.email!, password: v.password! }).subscribe({
      next: (jwt) => {
        this.loading.set(false);
        this.auth.store(jwt, v.remember ?? false);
        const redirect = this.route.snapshot.queryParamMap.get('redirect') ?? this.auth.homeFor(this.auth.role());
        this.router.navigateByUrl(redirect);
      },
      error: (e) => {
        this.loading.set(false);
        const msg = this.errPresenter.apiErrorMessage(e);
        this.fieldErrors.set({ password: msg });
      }
    });
  }
}
