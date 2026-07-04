import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';

// Custom Validator for password matching
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { mismatch: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  submitted = false;
  isLoading = false;
  resetSuccess = false;
  token: string | null = null;
  
  // Password visibility toggles
  passwordVisible = false;
  confirmPasswordVisible = false;
  
  // Input focus states
  passwordFocused = false;
  confirmPasswordFocused = false;
  
  // Password strength properties
  passwordStrengthClass = '';
  passwordStrengthText = '';
  passwordStrengthPercent = 0;
  
  // Password requirement flags
  hasMinLength = false;
  hasUpperCase = false;
  hasNumber = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Get token from URL
    this.token = this.route.snapshot.queryParamMap.get('token');
    
    this.resetPasswordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });
    
    // Update password strength when password changes
    this.resetPasswordForm.get('password')?.valueChanges.subscribe(password => {
      this.updatePasswordStrength(password);
    });
  }

  get f() { return this.resetPasswordForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    if (this.resetPasswordForm.invalid) {
      return;
    }

    this.isLoading = true;
    
    // Simulate API call with timeout
    setTimeout(() => {
      try {
        // In a real app, this would be an actual API call
        // this.authService.resetPassword(this.token, this.resetPasswordForm.value.password)
        
        // Show success message
        this.resetSuccess = true;
      } catch (error) {
        console.error('Reset password error:', error);
      } finally {
        this.isLoading = false;
      }
    }, 1500);
  }
  
  updatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrengthClass = '';
      this.passwordStrengthText = '';
      this.passwordStrengthPercent = 0;
      this.hasMinLength = false;
      this.hasUpperCase = false;
      this.hasNumber = false;
      return;
    }
    
    // Check requirements
    this.hasMinLength = password.length >= 6;
    this.hasUpperCase = /[A-Z]/.test(password);
    this.hasNumber = /[0-9]/.test(password);
    
    // Calculate strength
    let strength = 0;
    if (this.hasMinLength) strength += 1;
    if (this.hasUpperCase) strength += 1;
    if (this.hasNumber) strength += 1;
    
    // Set strength class and text
    if (strength === 0) {
      this.passwordStrengthClass = 'weak';
      this.passwordStrengthText = 'Faible';
      this.passwordStrengthPercent = 20;
    } else if (strength === 1) {
      this.passwordStrengthClass = 'weak';
      this.passwordStrengthText = 'Faible';
      this.passwordStrengthPercent = 33;
    } else if (strength === 2) {
      this.passwordStrengthClass = 'medium';
      this.passwordStrengthText = 'Moyen';
      this.passwordStrengthPercent = 66;
    } else {
      this.passwordStrengthClass = 'strong';
      this.passwordStrengthText = 'Fort';
      this.passwordStrengthPercent = 100;
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }
}