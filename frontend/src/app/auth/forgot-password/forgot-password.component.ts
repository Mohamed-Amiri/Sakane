import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  submitted = false;
  isLoading = false;
  emailSent = false;
  emailFocused = false;
  
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() { return this.forgotPasswordForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.isLoading = true;
    
    // Simulate API call with timeout
    setTimeout(() => {
      try {
        // In a real app, this would be an actual API call
        // this.authService.forgotPassword(this.forgotPasswordForm.value.email)
        
        // Show success message
        this.emailSent = true;
      } catch (error) {
        console.error('Forgot password error:', error);
      } finally {
        this.isLoading = false;
      }
    }, 1500);
  }
}