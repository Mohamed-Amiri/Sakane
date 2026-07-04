import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { Title } from '@angular/platform-browser';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  standalone: true
})
export class RegisterComponent implements OnInit, OnDestroy {

  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  // Password strength
  passwordStrengthPercent = 0;
  passwordStrengthLabel = '';
  passwordStrengthClass = '';

  // Testimonials (shared with login)
  testimonials: Testimonial[] = [
    {
      quote: "Grâce à Sakane, j'ai trouvé le lieu parfait pour mon événement en quelques clics. Service au top !",
      name: 'Amina Karzazi',
      role: 'Organisatrice d\'événements',
      initials: 'AK'
    },
    {
      quote: "La plateforme est intuitive et la variété des espaces proposés est incroyable. Je recommande vivement.",
      name: 'Youssef Lahmidi',
      role: 'Entrepreneur',
      initials: 'YL'
    },
    {
      quote: "Louer mon bureau inoccupé sur Sakane a été une excellente source de revenus. Simple et efficace.",
      name: 'Fatima Zahra',
      role: 'Propriétaire',
      initials: 'FZ'
    }
  ];
  currentTestimonialIndex = 0;
  private testimonialInterval: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService,
    private titleService: Title
  ) {
    this.titleService.setTitle('Inscription — Sakane');
  }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/)
      ]],
      confirmPassword: ['', Validators.required],
      role: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    // Watch password changes for strength indicator
    this.registerForm.get('password')?.valueChanges.subscribe(value => {
      this.calculatePasswordStrength(value || '');
    });

    // Start testimonial rotation
    this.testimonialInterval = setInterval(() => {
      this.currentTestimonialIndex = (this.currentTestimonialIndex + 1) % this.testimonials.length;
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.testimonialInterval) {
      clearInterval(this.testimonialInterval);
    }
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      const errors = group.get('confirmPassword')?.errors;
      if (errors) {
        delete errors['mismatch'];
        if (Object.keys(errors).length === 0) {
          group.get('confirmPassword')?.setErrors(null);
        }
      }
      return null;
    }
  }

  calculatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrengthPercent = 0;
      this.passwordStrengthLabel = '';
      this.passwordStrengthClass = '';
      return;
    }

    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 25;
    if (/\d/.test(password)) score += 25;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 25;

    this.passwordStrengthPercent = score;

    if (score <= 25) {
      this.passwordStrengthLabel = 'Faible';
      this.passwordStrengthClass = 'weak';
    } else if (score <= 50) {
      this.passwordStrengthLabel = 'Moyen';
      this.passwordStrengthClass = 'medium';
    } else if (score <= 75) {
      this.passwordStrengthLabel = 'Bon';
      this.passwordStrengthClass = 'good';
    } else {
      this.passwordStrengthLabel = 'Fort';
      this.passwordStrengthClass = 'strong';
    }
  }

  get firstName() {
    return this.registerForm.get('firstName')!;
  }

  get lastName() {
    return this.registerForm.get('lastName')!;
  }

  get email() {
    return this.registerForm.get('email')!;
  }

  get password() {
    return this.registerForm.get('password')!;
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword')!;
  }

  get role() {
    return this.registerForm.get('role')!;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.registerForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const formValue = this.registerForm.value;

      const registerData = {
        firstName: formValue.firstName.trim(),
        lastName: formValue.lastName.trim(),
        email: formValue.email,
        password: formValue.password,
        role: formValue.role
      };

      this.authService.register(registerData).subscribe({
        next: () => {
          this.isLoading = false;
          this.toast.success('Compte créé avec succès ! Connectez-vous pour continuer.');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Erreur lors de la création du compte. Veuillez réessayer.';
          console.error('Registration error:', error);
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
