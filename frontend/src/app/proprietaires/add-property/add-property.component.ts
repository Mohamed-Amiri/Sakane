import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { ProprietairesService, Property } from '../services/proprietaires.service';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-add-property',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    DragDropModule
  ],
  templateUrl: './add-property.component.html',
  styleUrls: ['./add-property.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddPropertyComponent implements OnInit {
  currentStep = 0;
  
  propertyForm: FormGroup;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  loading = false;

  // Validation System Properties
  validationScore = 0;
  completenessPercentage = 0;
  stepValidationStatus = {
    basicInfo: { isValid: false, completeness: 0, errors: [] as string[] },
    details: { isValid: false, completeness: 0, errors: [] as string[] },
    amenities: { isValid: false, completeness: 0, errors: [] as string[] },
    photos: { isValid: false, completeness: 0, errors: [] as string[] }
  };

  validationMessages = {
    basicInfo: {
      title: {
        required: 'Le titre est obligatoire',
        minlength: 'Le titre doit contenir au moins 5 caractères',
        suggestion: 'Utilisez un titre accrocheur pour attirer plus de voyageurs'
      },
      description: {
        required: 'La description est obligatoire',
        minlength: 'La description doit contenir au moins 20 caractères',
        suggestion: 'Plus de détails = plus de réservations'
      },
      propertyType: {
        required: 'Le type de propriété est obligatoire',
        suggestion: 'Choisissez le type qui correspond le mieux à votre bien'
      },
      location: {
        required: 'La localisation est obligatoire',
        minlength: 'Soyez plus précis sur la localisation',
        suggestion: 'Une localisation précise facilite les recherches'
      }
    },
    details: {
      maxGuests: {
        required: "Le nombre d'invités est obligatoire",
        min: 'Au moins 1 invité requis',
        suggestion: 'Indiquez la capacité réelle de votre logement'
      },
      bedrooms: {
        required: 'Le nombre de chambres est obligatoire',
        suggestion: 'Comptez toutes les chambres utilisables'
      },
      bathrooms: {
        required: 'Le nombre de salles de bain est obligatoire',
        min: 'Au moins 1 salle de bain requise',
        suggestion: 'Comptez toutes les salles de bain et toilettes'
      },
      price: {
        required: 'Le prix est obligatoire',
        min: 'Le prix minimum est de 10 DH',
        max: 'Le prix maximum est de 10 000 DH',
        suggestion: 'Consultez les prix similaires dans votre région'
      }
    }
  };

  propertyTypes = [
    { value: 'apartment', label: 'Appartement' },
    { value: 'house', label: 'Maison' },
    { value: 'villa', label: 'Villa' },
    { value: 'studio', label: 'Studio' },
    { value: 'loft', label: 'Loft' },
    { value: 'chalet', label: 'Chalet' }
  ];

  availableAmenities = [
    'WiFi', 'Climatisation', 'Chauffage', 'Cuisine équipée', 'Lave-vaisselle',
    'Lave-linge', 'Sèche-linge', 'Télévision', 'Parking', 'Balcon',
    'Terrasse', 'Jardin', 'Piscine', 'Jacuzzi', 'Salle de sport',
    'Ascenseur', 'Animaux acceptés', 'Non-fumeur'
  ];

  isDragOver = false;

  constructor(
    private fb: FormBuilder,
    private proprietairesService: ProprietairesService,
    private router: Router,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.propertyForm = this.createForm();
  }

  ngOnInit(): void {
    this.updateValidationStatus();
    this.setupFormValidationTracking();
  }

  private setupFormValidationTracking(): void {
    this.propertyForm.valueChanges.subscribe(() => {
      this.updateValidationStatus();
    });

    this.propertyForm.get('photos')?.valueChanges.subscribe(() => {
      this.updateValidationStatus();
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      basicInfo: this.fb.group({
        title: ['', [Validators.required, Validators.minLength(5)]],
        description: ['', [Validators.required, Validators.minLength(20)]],
        propertyType: ['', Validators.required],
        location: ['', [Validators.required, Validators.minLength(10)]]
      }),
      details: this.fb.group({
        maxGuests: [1, [Validators.required, Validators.min(1)]],
        bedrooms: [1, [Validators.required, Validators.min(0)]],
        bathrooms: [1, [Validators.required, Validators.min(1)]],
        price: [0, [Validators.required, Validators.min(10), Validators.max(10000)]]
      }),
      amenities: this.fb.array([]),
      photos: this.fb.control([])
    });
  }

  get amenitiesFormArray(): FormArray {
    return this.propertyForm.get('amenities') as FormArray;
  }

  onAmenityChange(amenity: string, checked: boolean): void {
    const amenitiesArray = this.amenitiesFormArray;
    
    if (checked) {
      amenitiesArray.push(this.fb.control(amenity));
    } else {
      const index = amenitiesArray.controls.findIndex(x => x.value === amenity);
      if (index >= 0) {
        amenitiesArray.removeAt(index);
      }
    }
  }

  isAmenitySelected(amenity: string): boolean {
    return this.amenitiesFormArray.controls.some(control => control.value === amenity);
  }

  onFilesSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.processFiles(files);
  }

  removePhoto(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
    this.updateValidationStatus();
  }

  onSubmit(event?: Event): void {
    if (this.currentStep !== 3) {
      event?.preventDefault();
      return;
    }
    
    if (this.propertyForm.valid) {
      this.loading = true;
      
      const formValue = this.propertyForm.value;
      const property: Omit<Property, 'id'> = {
        title: formValue.basicInfo.title,
        description: formValue.basicInfo.description,
        propertyType: formValue.basicInfo.propertyType,
        location: formValue.basicInfo.location,
        maxGuests: formValue.details.maxGuests,
        bedrooms: formValue.details.bedrooms,
        bathrooms: formValue.details.bathrooms,
        price: formValue.details.price,
        amenities: formValue.amenities,
        photos: [],
        isActive: true,
        ownerId: 0
      };

      this.proprietairesService.createProperty(property).subscribe({
        next: (createdProperty) => {
          this.proprietairesService.refreshProperties();
          if (this.selectedFiles.length > 0) {
            this.proprietairesService.uploadPropertyPhotos(createdProperty.id!, this.selectedFiles).subscribe({
              next: () => {
                this.loading = false;
                this.toastService.success('Propriété créée avec succès!');
                this.router.navigate(['/proprietaires/manage-properties']);
              },
              error: (error) => {
                console.error('Error uploading photos:', error);
                this.loading = false;
                this.toastService.error('Propriété créée mais erreur lors du téléchargement des photos');
                this.router.navigate(['/proprietaires/manage-properties']);
              }
            });
          } else {
            this.loading = false;
            this.toastService.success('Propriété créée avec succès!');
            this.router.navigate(['/proprietaires/manage-properties']);
          }
        },
        error: (error) => {
          console.error('Error creating property:', error);
          this.loading = false;
          let errorMessage = 'Erreur lors de la création de la propriété';
          if (error.status === 401) {
            errorMessage = 'Non autorisé - Veuillez vous reconnecter';
          } else if (error.status === 403) {
            errorMessage = 'Accès refusé';
          } else if (error.status === 404) {
            errorMessage = 'Service non trouvé - Vérifiez que le backend est démarré';
          } else if (error.status === 500) {
            errorMessage = 'Erreur serveur - Vérifiez les logs du backend';
          } else if (error.status === 0) {
            errorMessage = 'Impossible de contacter le serveur - Vérifiez que le backend est démarré sur le port 8082';
          }
          this.toastService.error(errorMessage);
        }
      });
    } else {
      this.markFormGroupTouched();
      this.toastService.error('Veuillez remplir tous les champs requis');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.propertyForm.controls).forEach(key => {
      const control = this.propertyForm.get(key);
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(nestedKey => {
          control.get(nestedKey)?.markAsTouched();
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  private updateValidationStatus(): void {
    this.validateBasicInfo();
    this.validateDetails();
    this.validateAmenities();
    this.validatePhotos();
    this.calculateOverallCompleteness();
  }

  private validateBasicInfo(): void {
    const basicInfo = this.propertyForm.get('basicInfo');
    if (!basicInfo) return;

    const errors: string[] = [];
    let completeness = 0;

    const title = basicInfo.get('title');
    if (title?.value && title.value.length >= 5) {
      completeness += 0.25;
    } else if (title?.errors) {
      if (title.errors['required']) errors.push(this.validationMessages.basicInfo.title.required);
      if (title.errors['minlength']) errors.push(this.validationMessages.basicInfo.title.minlength);
    }

    const description = basicInfo.get('description');
    if (description?.value && description.value.length >= 20) {
      completeness += 0.25;
    } else if (description?.errors) {
      if (description.errors['required']) errors.push(this.validationMessages.basicInfo.description.required);
      if (description.errors['minlength']) errors.push(this.validationMessages.basicInfo.description.minlength);
    }

    const propertyType = basicInfo.get('propertyType');
    if (propertyType?.value) {
      completeness += 0.25;
    } else if (propertyType?.errors?.['required']) {
      errors.push(this.validationMessages.basicInfo.propertyType.required);
    }

    const location = basicInfo.get('location');
    if (location?.value && location.value.length >= 10) {
      completeness += 0.25;
    } else if (location?.errors) {
      if (location.errors['required']) errors.push(this.validationMessages.basicInfo.location.required);
      if (location.errors['minlength']) errors.push(this.validationMessages.basicInfo.location.minlength);
    }

    this.stepValidationStatus.basicInfo = {
      isValid: basicInfo.valid,
      completeness: completeness * 100,
      errors
    };
  }

  private validateDetails(): void {
    const details = this.propertyForm.get('details');
    if (!details) return;

    const errors: string[] = [];
    let completeness = 0;

    const maxGuests = details.get('maxGuests');
    if (maxGuests?.value && maxGuests.value >= 1) {
      completeness += 0.25;
    } else if (maxGuests?.errors) {
      if (maxGuests.errors['required']) errors.push(this.validationMessages.details.maxGuests.required);
      if (maxGuests.errors['min']) errors.push(this.validationMessages.details.maxGuests.min);
    }

    const bedrooms = details.get('bedrooms');
    if (bedrooms?.value !== null && bedrooms?.value >= 0) {
      completeness += 0.25;
    } else if (bedrooms?.errors?.['required']) {
      errors.push(this.validationMessages.details.bedrooms.required);
    }

    const bathrooms = details.get('bathrooms');
    if (bathrooms?.value && bathrooms.value >= 1) {
      completeness += 0.25;
    } else if (bathrooms?.errors) {
      if (bathrooms.errors['required']) errors.push(this.validationMessages.details.bathrooms.required);
      if (bathrooms.errors['min']) errors.push(this.validationMessages.details.bathrooms.min);
    }

    const price = details.get('price');
    if (price?.value && price.value >= 10 && price.value <= 10000) {
      completeness += 0.25;
    } else if (price?.errors) {
      if (price.errors['required']) errors.push(this.validationMessages.details.price.required);
      if (price.errors['min']) errors.push(this.validationMessages.details.price.min);
      if (price.errors['max']) errors.push(this.validationMessages.details.price.max);
    }

    this.stepValidationStatus.details = {
      isValid: details.valid,
      completeness: completeness * 100,
      errors
    };
  }

  private validateAmenities(): void {
    const amenitiesArray = this.amenitiesFormArray;
    const amenitiesCount = amenitiesArray.length;
    
    let completeness = 0;
    let isValid = true;
    const errors: string[] = [];

    if (amenitiesCount === 0) {
      completeness = 0;
      errors.push('Ajoutez au moins quelques équipements');
      isValid = false;
    } else if (amenitiesCount < 3) {
      completeness = 30;
    } else if (amenitiesCount < 6) {
      completeness = 70;
    } else {
      completeness = 100;
    }

    this.stepValidationStatus.amenities = {
      isValid: amenitiesCount >= 1,
      completeness,
      errors
    };
  }

  private validatePhotos(): void {
    const photosCount = this.previewUrls.length;
    
    let completeness = 0;
    let isValid = true;
    const errors: string[] = [];

    if (photosCount === 0) {
      completeness = 0;
      errors.push('Ajoutez au moins une photo');
      isValid = false;
    } else if (photosCount < 3) {
      completeness = 40;
    } else if (photosCount < 5) {
      completeness = 70;
    } else {
      completeness = 100;
    }

    this.stepValidationStatus.photos = {
      isValid: photosCount >= 1,
      completeness,
      errors
    };
  }

  private calculateOverallCompleteness(): void {
    const steps = Object.values(this.stepValidationStatus);
    const averageCompleteness = steps.reduce((sum, step) => sum + step.completeness, 0) / steps.length;
    
    this.completenessPercentage = Math.round(averageCompleteness);
    
    this.validationScore = Math.round(
      (this.stepValidationStatus.basicInfo.completeness * 0.3) +
      (this.stepValidationStatus.details.completeness * 0.25) +
      (this.stepValidationStatus.amenities.completeness * 0.2) +
      (this.stepValidationStatus.photos.completeness * 0.25)
    );
  }

  cancel(): void {
    this.router.navigate(['/proprietaires/dashboard']);
  }

  goToStep(index: number): void {
    this.currentStep = index;
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.currentStep !== 3) {
      event.preventDefault();
    }
  }

  getProgressPercentage(): number {
    return ((this.currentStep + 1) / 4) * 100;
  }

  toggleAmenity(amenity: string): void {
    const amenitiesArray = this.amenitiesFormArray;
    const index = amenitiesArray.controls.findIndex(x => x.value === amenity);
    
    if (index >= 0) {
      amenitiesArray.removeAt(index);
    } else {
      amenitiesArray.push(this.fb.control(amenity));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = Array.from(event.dataTransfer?.files || []) as File[];
    this.processFiles(files);
  }

  onPhotoReorder(event: any): void {
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;
    
    const movedFile = this.selectedFiles.splice(previousIndex, 1)[0];
    const movedUrl = this.previewUrls.splice(previousIndex, 1)[0];
    
    this.selectedFiles.splice(currentIndex, 0, movedFile);
    this.previewUrls.splice(currentIndex, 0, movedUrl);
  }

  private processFiles(files: File[]): void {
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024;
      
      if (!isValidType) {
        this.toastService.error('Seuls les fichiers image sont acceptés');
        return false;
      }
      
      if (!isValidSize) {
        this.toastService.error('La taille du fichier ne doit pas dépasser 5MB');
        return false;
      }
      
      return true;
    });

    if (this.selectedFiles.length + validFiles.length > 10) {
      this.toastService.error('Maximum 10 photos autorisées');
      return;
    }

    this.selectedFiles = [...this.selectedFiles, ...validFiles];
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrls.push(e.target?.result as string);
        this.updateValidationStatus();
      };
      reader.readAsDataURL(file);
    });
  }
}