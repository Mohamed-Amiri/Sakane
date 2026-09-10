import { Component, inject, signal, ChangeDetectionStrategy, OnInit, OnDestroy, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LieuService } from '../../../core/api/lieu.service';
import { LieuResponse, LieuRequest } from '../../../core/api/models';
import { TYPES, LABEL_TO_CODE } from '../../../core/ui/types';
import { money } from '../../../core/ui/format';
import { IconComponent } from '../../../shared/icon/icon.component';
import { SkeletonRowsComponent } from '../../../shared/skeleton/skeleton-rows.component';
import { StateBlockComponent } from '../../../shared/state-block/state-block.component';
import { ModalService } from '../../../shared/modal/modal.service';
import { OwnerSubnavComponent } from '../../../shared/owner-subnav/owner-subnav.component';
import { ImgAttrsDirective } from '../../../core/ui/img-attrs.directive';
import { photoUrl as resolvePhotoUrl } from '../../../core/ui/photo-url';
import { ApiErrorPresenter } from '../../../core/api/api-error-presenter';

/** A photo file staged in the create form — `preview` is a blob: object URL, revoked on removal/destroy. */
interface StagedPhoto {
  file: File;
  preview: string;
}

@Component({
  selector: 'app-owner-place-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IconComponent,
    SkeletonRowsComponent,
    StateBlockComponent,
    OwnerSubnavComponent,
    ImgAttrsDirective
  ],
  template: `
    <section class="container page-section">
      <app-owner-subnav />

      <div class="container--form mx-auto">
        <div class="page-head">
          <div>
            <h1 id="place-form-title">{{ isEdit() ? 'Edit place' : 'Create a place' }}</h1>
            <p class="page-head__sub" id="place-form-sub">
              @if (isEdit()) { Changes are published immediately. }
              @else { Your place is published immediately after creation — there is no approval step. }
            </p>
          </div>
          <a class="btn btn--secondary" routerLink="/owner/places">Back to my places</a>
        </div>

        <div class="stack-md" id="form-card">
          @if (loadError()) {
            <app-state-block
              kind="error"
              icon="warn"
              [title]="notFound() ? 'Place not found' : 'Could not load this place'"
              [message]="notFound() ? 'This place does not exist (demo data may have been reset).' : 'The place could not be loaded.'"
            >
              <a class="btn btn--primary" routerLink="/owner/places">Back to my places</a>
            </app-state-block>
          } @else {
            <form class="card card--pad" id="place-form" [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
              <div id="place-alert" aria-live="assertive">
                @if (formError()) {
                  <div class="alert alert--error" role="alert">
                    <div><strong>Check the highlighted fields</strong>Some values don't meet the requirements.</div>
                  </div>
                }
              </div>

              <section class="form-section" aria-labelledby="sec-ess">
                <div class="form-section__intro">
                  <h2 id="sec-ess">Essentials</h2>
                  <p>What guests see first in listings and search results.</p>
                </div>
                <div>
                  <div class="form-field">
                    <label class="form-label" for="pl-titre">Title <span class="optional" id="titre-count"></span></label>
                    <input id="pl-titre" class="input" formControlName="titre" minlength="5" maxlength="100" placeholder="e.g. Sunny loft near the medina" />
                    <p class="form-hint">5–100 characters.</p>
                    @if (fieldError('titre')) { <p class="field-error">{{ fieldError('titre') }}</p> }
                  </div>
                  <div class="form-field">
                    <label class="form-label" for="pl-desc">Description <span class="optional" id="desc-count"></span></label>
                    <textarea id="pl-desc" class="textarea" formControlName="description" minlength="20" maxlength="1000" rows="5" placeholder="The space, the neighbourhood, what makes it special…"></textarea>
                    <p class="form-hint">20–1000 characters.</p>
                    @if (fieldError('description')) { <p class="field-error">{{ fieldError('description') }}</p> }
                  </div>
                  <div class="form-grid">
                    <div class="form-field">
                      <label class="form-label" for="pl-type">Type</label>
                      <select id="pl-type" class="select" formControlName="type">
                        @for (t of types; track t[0]) {
                          <option [value]="t[0]">{{ t[1] }}</option>
                        }
                      </select>
                      @if (fieldError('type')) { <p class="field-error">{{ fieldError('type') }}</p> }
                    </div>
                    <div class="form-field">
                      <label class="form-label" for="pl-prix">Price per night ($)</label>
                      <input id="pl-prix" class="input" type="number" formControlName="prix" min="10" max="10000" inputmode="numeric" />
                      <p class="form-hint">Between 10 and 10 000.</p>
                      @if (fieldError('prix')) { <p class="field-error">{{ fieldError('prix') }}</p> }
                    </div>
                  </div>
                </div>
              </section>

              <section class="form-section" aria-labelledby="sec-loc">
                <div class="form-section__intro">
                  <h2 id="sec-loc">Location</h2>
                  <p>Public search matches cities against the address text.</p>
                </div>
                <div>
                  <div class="form-field">
                    <label class="form-label" for="pl-adresse">Address</label>
                    <input id="pl-adresse" class="input" formControlName="adresse" minlength="10" maxlength="200" autocomplete="street-address" />
                    <p class="form-hint">10–200 characters, including the city name.</p>
                    @if (fieldError('adresse')) { <p class="field-error">{{ fieldError('adresse') }}</p> }
                  </div>
                  <div class="form-grid">
                    <div class="form-field">
                      <label class="form-label" for="pl-city">City <span class="optional">(optional)</span></label>
                      <input id="pl-city" class="input" formControlName="city" autocomplete="address-level2" />
                    </div>
                    <div class="form-field">
                      <label class="form-label" for="pl-nb">Neighborhood <span class="optional">(optional)</span></label>
                      <input id="pl-nb" class="input" formControlName="neighborhood" />
                    </div>
                  </div>
                </div>
              </section>

              <section class="form-section" aria-labelledby="sec-det">
                <div class="form-section__intro">
                  <h2 id="sec-det">Details</h2>
                  <p>All optional. Shown as facts on the place page and used to validate bookings.</p>
                </div>
                <div>
                  <div class="form-grid">
                    <div class="form-field">
                      <label class="form-label" for="pl-guests">Max guests</label>
                      <input id="pl-guests" class="input" type="number" formControlName="maxGuests" min="1" inputmode="numeric" />
                    </div>
                    <div class="form-field">
                      <label class="form-label" for="pl-nights">Minimum nights</label>
                      <input id="pl-nights" class="input" type="number" formControlName="minimumNights" min="1" inputmode="numeric" />
                    </div>
                    <div class="form-field">
                      <label class="form-label" for="pl-bed">Bedrooms</label>
                      <input id="pl-bed" class="input" type="number" formControlName="bedrooms" min="0" inputmode="numeric" />
                    </div>
                    <div class="form-field">
                      <label class="form-label" for="pl-bath">Bathrooms</label>
                      <input id="pl-bath" class="input" type="number" formControlName="bathrooms" min="0" inputmode="numeric" />
                    </div>
                    <div class="form-field">
                      <label class="form-label" for="pl-in">Check-in time</label>
                      <input id="pl-in" class="input" type="time" formControlName="checkInTime" />
                    </div>
                    <div class="form-field">
                      <label class="form-label" for="pl-out">Check-out time</label>
                      <input id="pl-out" class="input" type="time" formControlName="checkOutTime" />
                    </div>
                  </div>
                  <div class="form-field">
                    <label class="form-label" for="pl-amen">Amenities <span class="optional">(comma-separated)</span></label>
                    <input id="pl-amen" class="input" formControlName="amenities" placeholder="Wi-Fi, Pool, Parking" />
                  </div>
                  <div class="form-field mb-0">
                    <label class="form-label" for="pl-rules">House rules <span class="optional">(optional)</span></label>
                    <textarea id="pl-rules" class="textarea" formControlName="houseRules" rows="2"></textarea>
                  </div>
                </div>
              </section>

              @if (!isEdit()) {
                <section class="form-section" id="photos-section" aria-labelledby="sec-photos">
                  <div class="form-section__intro">
                    <h2 id="sec-photos">Photos</h2>
                    <p>Up to 10 photos in total — files from your computer or image URLs. The first photo becomes the cover shown in listings.</p>
                  </div>
                  <div>
                    @if (!published()) {
                      <div
                        class="dropzone"
                        id="photo-dropzone"
                        role="button"
                        tabindex="0"
                        aria-label="Add photos from your computer"
                        [class.is-dragover]="dragOver()"
                        (click)="photoFileInput.click()"
                        (keydown.enter)="$event.preventDefault(); photoFileInput.click()"
                        (keydown.space)="$event.preventDefault(); photoFileInput.click()"
                        (dragover)="onDragOver($event)"
                        (dragleave)="onDragLeave()"
                        (drop)="onDrop($event)"
                      >
                        <app-icon name="images" />
                        <div class="dropzone__label"><strong>Click to select photos</strong> or drag &amp; drop them here</div>
                        <p class="dropzone__hint">JPG, PNG, WebP or GIF · max 10 MB each · {{ createPhotoCount() }} / 10 selected</p>
                      </div>
                      <input #photoFileInput type="file" id="photo-file-input" accept="image/*" multiple class="sr-only" (change)="onFilesSelected($event)" />
                    }
                    @if (createPhotoError()) { <p class="field-error" id="create-photo-error" aria-live="polite">{{ createPhotoError() }}</p> }
                    @if (published() && uploadError()) {
                      <div class="alert alert--error mt-3" role="alert" id="upload-failed">
                        <div>
                          <strong>Photos could not be uploaded</strong>
                          Your place was published, but the photo upload failed. Retry below, or continue — you can add photos later from the edit page.
                        </div>
                        <div class="cluster mt-2">
                          <button class="btn btn--secondary" type="button" id="photo-retry" [disabled]="loading()" (click)="retryPhotoUpload()">Retry upload</button>
                          <a class="btn btn--ghost" routerLink="/owner/places">Continue without photos</a>
                        </div>
                      </div>
                    }
                    @if (urlPhotos().length || stagedFiles().length) {
                      <div class="photo-grid mt-3" id="create-photo-list">
                        @for (u of urlPhotos(); track u; let i = $index) {
                          <div class="photo-tile">
                            <img [appImg]="u" [sizes]="'(max-width: 640px) 33vw, 160px'" [widths]="[200, 400]" [alt]="'Photo ' + (i + 1)" />
                            @if (i === 0) { <span class="photo-tile__cover">Cover</span> }
                            <div class="photo-tile__tools">
                              <span></span>
                              <button type="button" [attr.aria-label]="'Remove photo ' + (i + 1)" (click)="removeUrlPhoto(i)">✕</button>
                            </div>
                          </div>
                        }
                        @for (s of stagedFiles(); track s.preview; let i = $index) {
                          <div class="photo-tile">
                            <img [src]="s.preview" [alt]="s.file.name" />
                            @if (i === 0 && !urlPhotos().length) { <span class="photo-tile__cover">Cover</span> }
                            <div class="photo-tile__tools">
                              <span class="photo-tile__name" [title]="s.file.name">{{ s.file.name }}</span>
                              <button type="button" [attr.aria-label]="'Remove file ' + s.file.name" (click)="removeStagedFile(s.preview)">✕</button>
                            </div>
                          </div>
                        }
                      </div>
                    }
                    @if (!published()) {
                      <div class="upload-row mt-3">
                        <span class="text-sm text-muted">or add by URL:</span>
                        <input id="pl-photo-url" class="input" type="url" placeholder="https://…/photo.jpg" aria-label="Photo URL" inputmode="url" [value]="urlInput()" (input)="urlInput.set($any($event).target.value)" (keydown.enter)="addUrlPhoto()" />
                        <button class="btn btn--secondary" type="button" id="pl-photo-add" (click)="addUrlPhoto()">Add</button>
                      </div>
                      @if (urlPhotoError()) { <p class="field-error" id="url-photo-error" aria-live="polite">{{ urlPhotoError() }}</p> }
                    }
                  </div>
                </section>
              }

              <div class="form-actions">
                <a class="btn btn--ghost" routerLink="/owner/places">Cancel</a>
                <button class="btn btn--primary" type="submit" [class.is-loading]="loading()" [disabled]="loading() || published()">
                  <span class="spinner" aria-hidden="true"></span><span>Save &amp; publish</span>
                </button>
              </div>
            </form>

            @if (isEdit()) {
              <section class="card card--pad" id="photo-section" aria-labelledby="photos-h">
                <a id="photos"></a>
                <div class="cluster cluster--between mb-3">
                  <h2 id="photos-h" class="card-title">Photos</h2>
                  <span class="text-secondary text-sm num" id="photo-count">{{ photos().length }} / 10</span>
                </div>
                <div id="published-banner" [hidden]="!created" class="alert alert--success published-banner" role="status">
                  <div><strong>Place published</strong>It's already live. Add photos now so it stands out in the listings.</div>
                </div>
                <p class="text-sm text-secondary">Up to 10 photos, max 10 MB each. Use ‹ › to reorder — the first photo is the cover.</p>
                <div class="photo-grid mb-3" id="photo-grid">
                  @if (!photos().length) {
                    <p class="text-secondary text-sm photo-grid__empty">No photos yet. The first photo becomes the cover shown in listings.</p>
                  }
                  @for (u of photos(); track u; let i = $index) {
                    <div class="photo-tile">
                      <img [appImg]="photoUrl(u)" [sizes]="'(max-width: 640px) 33vw, 160px'" [widths]="[200, 400]" [alt]="'Photo ' + (i + 1)" />
                      @if (i === 0) { <span class="photo-tile__cover">Cover</span> }
                      <div class="photo-tile__tools">
                        <span>
                          <button type="button" [attr.aria-label]="'Move photo ' + (i + 1) + ' earlier'" [disabled]="i === 0" (click)="movePhoto(i, -1)">‹</button>
                          <button type="button" [attr.aria-label]="'Move photo ' + (i + 1) + ' later'" [disabled]="i === photos().length - 1" (click)="movePhoto(i, 1)">›</button>
                        </span>
                        <button type="button" [attr.aria-label]="'Delete photo ' + (i + 1)" (click)="deletePhoto(u)">✕</button>
                      </div>
                    </div>
                  }
                </div>
                @if (photoError()) { <p class="field-error" id="photo-error" aria-live="polite">{{ photoError() }}</p> }
                <div class="upload-row">
                  <label class="btn btn--secondary" id="photo-upload-label">
                    <span class="spinner" aria-hidden="true"></span><span>Upload photo files</span>
                    <input type="file" id="photo-input" accept="image/*" multiple class="sr-only" (change)="onFileUpload($event)" />
                  </label>
                  <span class="text-sm text-muted">or add by URL:</span>
                  <input id="pm-url" class="input" type="url" placeholder="https://…/photo.jpg" aria-label="Photo URL" inputmode="url" [value]="pmUrlInput()" (input)="pmUrlInput.set($any($event).target.value)" (keydown.enter)="addUrlInEdit()" />
                  <button class="btn btn--secondary" type="button" id="pm-url-add" (click)="addUrlInEdit()">Add</button>
                </div>
              </section>
            }
          }
        </div>
      </div>
    </section>
  `
})
export class PlaceFormComponent implements OnInit, OnDestroy {
  private lieuService = inject(LieuService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private errPresenter = inject(ApiErrorPresenter);

  readonly types = TYPES;
  readonly money = money;

  readonly loading = signal(false);
  readonly fieldErrors = signal<Record<string, string>>({});
  readonly formError = signal(false);
  readonly loadError = signal(false);
  readonly notFound = signal(false);
  readonly photos = signal<string[]>([]);
  readonly photoError = signal('');
  readonly urlPhotos = signal<string[]>([]);
  readonly urlPhotoError = signal('');
  readonly urlInput = signal('');
  readonly pmUrlInput = signal('');
  readonly stagedFiles = signal<StagedPhoto[]>([]);
  readonly dragOver = signal(false);
  readonly createPhotoError = signal('');
  readonly uploadError = signal('');
  readonly published = signal(false);

  private createdPlaceId: number | null = null;

  /** Total photos attached in the create form (URLs + staged files), capped at 10 by the backend model. */
  readonly createPhotoCount = computed(() => this.urlPhotos().length + this.stagedFiles().length);

  private id = 0;
  created = false;

  readonly isEdit = computed(() => this.id > 0);

  readonly form: FormGroup = this.fb.group({
    titre: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
    type: ['appartement', Validators.required],
    prix: [null as number | null, [Validators.required, Validators.min(10), Validators.max(10000)]],
    adresse: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
    city: [''],
    neighborhood: [''],
    maxGuests: [null as number | null],
    bedrooms: [null as number | null],
    bathrooms: [null as number | null],
    minimumNights: [null as number | null],
    checkInTime: [''],
    checkOutTime: [''],
    amenities: [''],
    houseRules: ['']
  });

  ngOnInit(): void {
    // The edit route is `owner/places/:id/edit` (path param); accept a query-param id as well for safety.
    const idParam = this.route.snapshot.paramMap.get('id') ?? this.route.snapshot.queryParamMap.get('id');
    this.created = this.route.snapshot.queryParamMap.get('created') === '1';
    if (idParam && Number(idParam) > 0) {
      this.id = Number(idParam);
      this.loadPlace();
    }
  }

  ngOnDestroy(): void {
    for (const staged of this.stagedFiles()) {
      URL.revokeObjectURL(staged.preview);
    }
  }

  photoUrl(url: string): string {
    return resolvePhotoUrl(url);
  }

  fieldError(field: string): string | undefined {
    if (this.fieldErrors()[field]) return this.fieldErrors()[field];
    const ctrl = this.form.get(field);
    if (ctrl?.errors?.['required'] && ctrl.touched) return 'This field is required.';
    if (ctrl?.errors?.['min'] && ctrl.touched) return 'Enter a valid value.';
    if (ctrl?.errors?.['minlength'] && ctrl.touched) return 'Too short.';
    if (ctrl?.errors?.['maxlength'] && ctrl.touched) return 'Too long.';
    return undefined;
  }

  loadPlace(): void {
    this.lieuService.get(this.id).subscribe({
      next: (lieu) => {
        this.form.patchValue({
          titre: lieu.titre,
          description: lieu.description,
          type: LABEL_TO_CODE[lieu.type] || 'appartement',
          prix: lieu.prix,
          adresse: lieu.adresse,
          city: lieu.city || '',
          neighborhood: lieu.neighborhood || '',
          maxGuests: lieu.maxGuests ?? null,
          bedrooms: lieu.bedrooms ?? null,
          bathrooms: lieu.bathrooms ?? null,
          minimumNights: lieu.minimumNights ?? null,
          checkInTime: lieu.checkInTime || '',
          checkOutTime: lieu.checkOutTime || '',
          amenities: (lieu.amenities || []).join(', '),
          houseRules: lieu.houseRules || ''
        });
        this.photos.set(lieu.photos || []);
      },
      error: (e) => {
        this.loadError.set(true);
        this.notFound.set(e.status === 404);
      }
    });
  }

  addUrlPhoto(): void {
    this.urlPhotoError.set('');
    const u = this.urlInput().trim();
    if (!u) return;
    if (!/^https?:\/\/\S+/i.test(u)) { this.urlPhotoError.set('Enter a valid http(s) image URL.'); return; }
    if (this.createPhotoCount() >= 10) { this.urlPhotoError.set('A place can have at most 10 photos.'); return; }
    this.urlPhotos.update(list => [...list, u]);
    this.urlInput.set('');
  }

  removeUrlPhoto(i: number): void {
    this.urlPhotos.update(list => list.filter((_, idx) => idx !== i));
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }

  onDragLeave(): void {
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    this.stageFiles(Array.from(event.dataTransfer?.files || []));
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.stageFiles(Array.from(input.files || []));
    input.value = '';
  }

  /** Stage picked/dropped files for upload on publish — validated against the same limits the backend enforces. */
  stageFiles(files: File[]): void {
    this.createPhotoError.set('');
    const next = this.stagedFiles().slice();
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        this.createPhotoError.set(`"${file.name}" is not an image file.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.createPhotoError.set(`"${file.name}" is larger than 10 MB.`);
        continue;
      }
      if (this.urlPhotos().length + next.length >= 10) {
        this.createPhotoError.set('A place can have at most 10 photos.');
        break;
      }
      next.push({ file, preview: URL.createObjectURL(file) });
    }
    this.stagedFiles.set(next);
  }

  removeStagedFile(preview: string): void {
    const target = this.stagedFiles().find(s => s.preview === preview);
    if (target) URL.revokeObjectURL(target.preview);
    this.stagedFiles.update(list => list.filter(s => s.preview !== preview));
  }

  retryPhotoUpload(): void {
    this.uploadError.set('');
    this.uploadStagedFiles();
  }

  addUrlInEdit(): void {
    this.photoError.set('');
    const u = this.pmUrlInput().trim();
    if (!u || !/^https?:\/\/\S+/i.test(u)) { this.photoError.set('Enter a valid http(s) image URL.'); return; }
    if (this.photos().length >= 10) { this.photoError.set('A place can have at most 10 photos.'); return; }
    const payload = this.buildPayload();
    payload.photos = this.photos().concat(u);
    this.loading.set(true);
    this.lieuService.update(this.id, payload).subscribe({
      next: (updated) => {
        this.photos.set(updated.photos || payload.photos);
        this.pmUrlInput.set('');
        this.loading.set(false);
      },
      error: (e) => {
        this.photoError.set(this.errPresenter.apiErrorMessage(e) || 'Could not add that photo URL.');
        this.loading.set(false);
      }
    });
  }

  deletePhoto(url: string): void {
    this.lieuService.deletePhoto(this.id, url).subscribe({
      next: () => this.photos.update(list => list.filter(u => u !== url)),
      error: () => {}
    });
  }

  movePhoto(i: number, dir: number): void {
    const next = this.photos().slice();
    const [item] = next.splice(i, 1);
    next.splice(i + dir, 0, item);
    this.photos.set(next);
    this.lieuService.reorderPhotos(this.id, next).subscribe({
      error: () => this.photos.set(this.photos())
    });
  }

  onFileUpload(event: Event): void {
    this.photoError.set('');
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (!files.length) return;
    this.loading.set(true);
    this.lieuService.uploadPhotos(this.id, files).subscribe({
      next: (urls) => {
        this.photos.update(list => [...list, ...urls]);
        this.loading.set(false);
        input.value = '';
      },
      error: (e) => {
        this.photoError.set(this.errPresenter.apiErrorMessage(e) || 'Upload failed.');
        this.loading.set(false);
      }
    });
  }

  buildPayload(): LieuRequest {
    const v = this.form.value;
    return {
      titre: v.titre,
      description: v.description,
      type: v.type,
      prix: Number(v.prix),
      adresse: v.adresse,
      city: (v.city || '').trim() || null,
      neighborhood: (v.neighborhood || '').trim() || null,
      maxGuests: Number(v.maxGuests) || null,
      bedrooms: Number(v.bedrooms) || null,
      bathrooms: Number(v.bathrooms) || null,
      minimumNights: Number(v.minimumNights) || null,
      checkInTime: v.checkInTime || null,
      checkOutTime: v.checkOutTime || null,
      amenities: (v.amenities || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      houseRules: (v.houseRules || '').trim() || null
    };
  }

  onSubmit(): void {
    if (this.published()) return; // the place is already live — only the photo upload may still be pending
    this.fieldErrors.set({});
    this.formError.set(false);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.formError.set(true);
      return;
    }
    this.loading.set(true);
    const payload = this.buildPayload();
    // The backend replaces the whole photo list on update, so the current photos must be sent along.
    if (this.isEdit()) {
      payload.photos = this.photos().slice();
      this.lieuService.update(this.id, payload).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/owner', 'places']);
        },
        error: (e) => {
          this.loading.set(false);
          const validationErrors = this.errPresenter.validationErrorsFrom(e);
          if (validationErrors) {
            this.fieldErrors.set(validationErrors);
          }
          this.formError.set(true);
        }
      });
    } else {
      // URL photos travel with the create payload; staged files need the created place's id,
      // so they are uploaded right after via POST /api/lieux/{id}/photos (multipart field `photos`).
      if (this.urlPhotos().length) payload.photos = this.urlPhotos().slice();
      this.lieuService.create(payload).subscribe({
        next: (result) => this.afterCreate(result),
        error: (e) => {
          this.loading.set(false);
          const validationErrors = this.errPresenter.validationErrorsFrom(e);
          if (validationErrors) {
            this.fieldErrors.set(validationErrors);
          }
          this.formError.set(true);
        }
      });
    }
  }

  /** After the place exists: upload staged files, then finish. On upload failure stay here with a retry. */
  private afterCreate(result: LieuResponse): void {
    this.createdPlaceId = result.id;
    this.published.set(true);
    if (!this.stagedFiles().length) {
      this.finishCreate();
      return;
    }
    this.uploadStagedFiles();
  }

  private uploadStagedFiles(): void {
    const id = this.createdPlaceId;
    if (!id || !this.stagedFiles().length) {
      this.finishCreate();
      return;
    }
    this.loading.set(true);
    this.lieuService.uploadPhotos(id, this.stagedFiles().map(s => s.file)).subscribe({
      next: () => this.finishCreate(),
      error: (e) => {
        this.loading.set(false);
        this.uploadError.set(this.errPresenter.apiErrorMessage(e) || 'The photo upload failed.');
      }
    });
  }

  private finishCreate(): void {
    this.loading.set(false);
    this.router.navigate(['/owner', 'places']);
  }
}
