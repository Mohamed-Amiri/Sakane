import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../core/api/user.service';
import { AuthService } from '../../../core/auth/auth.service';
import { UserResponse } from '../../../core/api/models';
import { initials } from '../../../core/ui/format';
import { ModalService } from '../../../shared/modal/modal.service';
import { StateBlockComponent } from '../../../shared/state-block/state-block.component';
import { ReservationService } from '../../../core/api/reservation.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, StateBlockComponent],
  template: `
    <section class="container page-section">
      <div class="page-head">
        <div>
          <h1>Profile & account</h1>
          <p class="page-head__sub">Your role is fixed at registration and cannot be changed here.</p>
        </div>
      </div>

      @if (error()) {
        <app-state-block kind="error" icon="warn" title="Could not load profile" message="Your profile could not be loaded." (retry)="load()" />
      } @else if (user()) {
        <div class="profile-layout">
          <div class="card" id="profile-summary">
            <div class="card__body cluster cluster--between">
              <div class="cluster">
                <span class="avatar avatar--lg" aria-hidden="true">{{ initials(user()!.nom) }}</span>
                <div>
                  <strong>{{ user()!.nom }}</strong>
                  <br />
                  <span class="text-secondary">{{ user()!.email }}</span>
                  <br />
                  <span class="badge">{{ roleLabel(user()!.role) }}</span>
                </div>
              </div>
              <div class="text-right">
                <p class="text-secondary text-sm m-0">{{ reservationCount() }} {{ reservationCount() === 1 ? 'reservation' : 'reservations' }}</p>
              </div>
            </div>
          </div>

          <div class="stack-md">
            <form class="card card--pad" id="profile-form" [formGroup]="form" (ngSubmit)="save()" novalidate>
              <h2>Edit profile</h2>
              <div id="profile-alert" aria-live="polite">
                @if (serverError()) {
                  <div class="field-error">{{ serverError() }}</div>
                }
              </div>
              <div class="form-field">
                <label class="form-label" for="pf-nom">Full name</label>
                <input class="input" id="pf-nom" type="text" formControlName="nom" autocomplete="name" />
              </div>
              <div class="form-field">
                <label class="form-label" for="pf-email">Email</label>
                <input class="input" id="pf-email" type="email" formControlName="email" autocomplete="email" />
              </div>
              <div class="form-field">
                <label class="form-label" for="pf-pass">New password <span class="optional">(leave empty to keep current)</span></label>
                <input class="input" id="pf-pass" type="password" formControlName="password" autocomplete="new-password" />
              </div>
              <button class="btn btn--primary" type="submit" [class.is-loading]="saving()" [disabled]="form.invalid || saving()">
                <span class="spinner" aria-hidden="true"></span><span>Save changes</span>
              </button>
            </form>

            <div class="danger-zone">
              <div class="card__body">
                <div>
                  <h3>Delete account</h3>
                  <p class="text-sm text-secondary">Permanently removes your account. This cannot be undone.</p>
                </div>
                <button class="btn btn--danger-outline" id="delete-account" type="button" (click)="confirmDelete()">Delete my account</button>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <app-state-block kind="empty" icon="user" title="Loading…" message="Your profile is loading." />
      }
    </section>
  `
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private reservationService = inject(ReservationService);
  private modal = inject(ModalService);
  private fb = inject(FormBuilder);

  readonly user = signal<UserResponse | null>(null);
  readonly error = signal(false);
  readonly saving = signal(false);
  readonly serverError = signal('');
  readonly reservationCount = signal(0);

  readonly initials = initials;

  form = this.fb.group({
    nom: [''],
    email: [''],
    password: ['']
  });

  ngOnInit(): void {
    this.load();
  }

  roleLabel(role: string): string {
    return role === 'PROPRIETAIRE' ? 'Owner' : 'Tenant';
  }

  load(): void {
    this.error.set(false);
    this.userService.me().subscribe({
      next: (u) => {
        this.user.set(u);
        this.form.patchValue({ nom: u.nom, email: u.email, password: '' });
        this.reservationService.my().subscribe({
          next: (rows) => this.reservationCount.set(rows.length),
          error: () => {}
        });
      },
      error: () => this.error.set(true)
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.serverError.set('');

    const v = this.form.value;
    const payload: Record<string, string> = {};
    if (v.nom) payload['nom'] = v.nom;
    if (v.email) payload['email'] = v.email;
    if (v.password) payload['password'] = v.password;

    this.userService.updateMe(payload).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.user.set(updated);
      },
      error: (e) => {
        this.saving.set(false);
        this.serverError.set('Could not update your profile. Please try again.');
      }
    });
  }

  confirmDelete(): void {
    this.modal.confirm({
      title: 'Delete your account?',
      message: 'This will permanently delete your account, reservations, and all associated data. This action cannot be undone.',
      confirmLabel: 'Delete account',
      danger: true
    }).then(confirmed => {
      if (!confirmed) return;
      this.userService.deleteMe().subscribe({
        next: () => {
          this.authService.clear();
          window.location.href = '/';
        },
        error: () => {}
      });
    });
  }
}
