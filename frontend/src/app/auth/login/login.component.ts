import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { Title } from '@angular/platform-browser';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  standalone: true
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  emailFocused = false;
  passwordFocused = false;

  // Rotating testimonials
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
    private route: ActivatedRoute,
    private titleService: Title
  ) {
    this.titleService.setTitle('Connexion — Sakane');
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
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

  get email() {
    return this.loginForm.get('email')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  get rememberMe() {
    return this.loginForm.get('rememberMe')!;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
        rememberMe: this.loginForm.value.rememberMe
      };

      this.authService.login(credentials).subscribe({
        next: (user) => {
          this.isLoading = false;
          // Navigate based on user role
          switch (user.role) {
            case 'owner':
              this.router.navigate(['/proprietaires/dashboard']);
              break;
            case 'tenant':
            default:
              this.router.navigate(['/locataire/dashboard']);
              break;
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Erreur de connexion. Veuillez réessayer.';
          console.error('Login error:', error);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
