import { Component, inject, signal, ChangeDetectionStrategy, OnInit, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ApiErrorPresenter } from '../../core/api/api-error-presenter';
import { IconComponent } from '../../shared/icon/icon.component';
import { ImgAttrsDirective } from '../../core/ui/img-attrs.directive';
import { Role } from '../../core/api/models';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, IconComponent, RouterLink, ImgAttrsDirective],
  template: `
    <div class="auth-shell">
      <section class="auth-side" aria-hidden="true">
        <div class="auth-side__bg">
          <img [appImg]="'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?q=80&w=1200&auto=format&fit=crop'" alt="" />
        </div>
        <div class="auth-side__content">
          <span class="auth-side__brand">
            <svg viewBox="0 0 28 28" aria-hidden="true"><rect width="28" height="28" rx="7" fill="#2b3fdc"/><path d="M7 16.5 14 9l7 7.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 20h8" stroke="#7fd3e6" stroke-width="2.4" stroke-linecap="round"/></svg>
            Sakane
          </span>
          <h2>Join as a guest or an owner.</h2>
          <p>Guests book and review stays. Owners publish places that go live immediately — no approval queue. Roles are fixed after registration.</p>
        </div>
      </section>
      <div class="auth-main">
        <div class="auth-card">
          <h1>Create your account</h1>
          <p>It takes less than a minute.</p>
          <div id="register-alert" aria-live="assertive"></div>
          <form id="register-form" class="form" novalidate [formGroup]="form" (ngSubmit)="onSubmit()">
            <fieldset>
              <legend>I want to…</legend>
              <div class="choice-cards">
                <div class="choice-card">
                  <input type="radio" id="role-tenant" formControlName="role" value="LOCATAIRE" />
                  <label for="role-tenant"><strong>Book places</strong><span>Tenant account</span></label>
                </div>
                <div class="choice-card">
                  <input type="radio" id="role-owner" formControlName="role" value="PROPRIETAIRE" />
                  <label for="role-owner"><strong>Rent out places</strong><span>Owner account</span></label>
                </div>
              </div>
            </fieldset>
            <div class="form-grid">
              <div class="form-field">
                <label class="form-label" for="rg-fn">First name</label>
                <input id="rg-fn" class="input" formControlName="firstName" autocomplete="given-name" />
                @if (fieldError('firstName')) {
                  <p class="field-error">{{ fieldError('firstName') }}</p>
                }
              </div>
              <div class="form-field">
                <label class="form-label" for="rg-ln">Last name</label>
                <input id="rg-ln" class="input" formControlName="lastName" autocomplete="family-name" />
                @if (fieldError('lastName')) {
                  <p class="field-error">{{ fieldError('lastName') }}</p>
                }
              </div>
            </div>
            <div class="form-field">
              <label class="form-label" for="rg-email">Email</label>
              <input id="rg-email" class="input" type="email" formControlName="email" autocomplete="email" inputmode="email" />
              @if (fieldError('email')) {
                <p class="field-error">{{ fieldError('email') }}</p>
              }
            </div>
            <div class="form-field">
              <label class="form-label" for="rg-pass">Password</label>
              <div class="input-affix">
                <input id="rg-pass" class="input" [type]="showPassword() ? 'text' : 'password'" formControlName="password" autocomplete="new-password" aria-describedby="pw-rules" />
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
              <ul class="pw-rules" id="pw-rules" aria-label="Password requirements">
                <li [class.ok]="!form.get('password')?.errors?.['minlength']">8–100 characters</li>
                <li [class.ok]="hasLower()">One lowercase letter</li>
                <li [class.ok]="hasUpper()">One uppercase letter</li>
                <li [class.ok]="hasDigit()">One digit</li>
                <li [class.ok]="hasSpecial()">One special character</li>
              </ul>
            </div>
            <button class="btn btn--primary btn--block btn--lg" type="submit" [class.is-loading]="loading()">
              <span class="spinner" aria-hidden="true"></span><span>Create account</span>
            </button>
          </form>
          <p class="auth-card__alt">Already have an account? <a routerLink="/login">Log in</a></p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent implements OnInit {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private errPresenter = inject(ApiErrorPresenter);

  readonly loading = signal(false);
  readonly fieldErrors = signal<Record<string, string>>({});
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.pattern(EMAIL_RE)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['LOCATAIRE' as Role]
  });

  readonly role = computed(() => this.form.get('role')!.value as Role);

  hasLower(): boolean { return /[a-z]/.test(this.form.get('password')?.value ?? ''); }
  hasUpper(): boolean { return /[A-Z]/.test(this.form.get('password')?.value ?? ''); }
  hasDigit(): boolean { return /\d/.test(this.form.get('password')?.value ?? ''); }
  hasSpecial(): boolean { return /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(this.form.get('password')?.value ?? ''); }

  ngOnInit(): void {
    const roleParam = this.route.snapshot.queryParamMap.get('role');
    if (roleParam === 'owner') {
      this.form.patchValue({ role: 'PROPRIETAIRE' });
    }
  }

  fieldError(field: string): string | undefined {
    const ctrl = this.form.get(field);
    if (this.fieldErrors()[field]) return this.fieldErrors()[field];
    if (ctrl?.errors?.['required'] && ctrl.touched) return 'This field is required.';
    if (ctrl?.errors?.['email']) return 'Enter a valid email address.';
    if (ctrl?.errors?.['pattern']) return 'Enter a valid email address.';
    if (ctrl?.errors?.['minlength']) return 'Password must be at least 8 characters.';
    return undefined;
  }

  onSubmit(): void {
    this.fieldErrors.set({});
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const v = this.form.getRawValue();
    this.auth.register({
      firstName: v.firstName!,
      lastName: v.lastName!,
      email: v.email!,
      password: v.password!,
      role: v.role
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/login'], { queryParams: { registered: '1', email: v.email! } });
      },
      error: (e) => {
        this.loading.set(false);
        const validationErrors = this.errPresenter.validationErrorsFrom(e);
        if (validationErrors) {
          this.fieldErrors.set(validationErrors);
        } else {
          this.fieldErrors.set({ email: this.errPresenter.apiErrorMessage(e) });
        }
      }
    });
  }
}
