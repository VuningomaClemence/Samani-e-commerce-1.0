import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  template: `
    <div class="auth-page-container" style="gap: 0">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title
            style="width: 100%; text-align: center;font-size: 24px; font-weight: bold; margin-bottom: 20px"
          >
            {{ showLoginForm ? 'Connexion' : 'Inscription' }}
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          @if (showLoginForm) {
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input
                matInput
                type="password"
                formControlName="password"
                required
              />
            </mat-form-field>
            <button
              class="btn btn-primary"
              type="submit"
              [disabled]="loginForm.invalid"
            >
              <span class="btn-text">Se connecter</span>
            </button>
            <br /><br /><br />
            @if (loginError) {
            <p class="error-message">{{ loginError }}</p>
            }
            <p style="text-align: center; margin-top: 18px">
              <span>Si vous n'avez pas de compte, </span>
              <a
                (click)="toggleForm(false)"
                style="color: #3498db; text-decoration: underline; cursor: pointer;"
                >inscrivez-vous</a
              >
            </p>
          </form>
          } @else {
          <form [formGroup]="signupForm" (ngSubmit)="onSignup()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nom</mat-label>
              <input matInput type="text" formControlName="nom" required />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Prénom</mat-label>
              <input matInput type="text" formControlName="prenom" required />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Adresse mail</mat-label>
              <input matInput type="email" formControlName="email" required />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mot de passe</mat-label>
              <input
                matInput
                type="password"
                formControlName="password"
                required
              />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Phone number</mat-label>
              <input matInput type="tel" formControlName="telephone" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Adresse de livraison</mat-label>
              <textarea
                matInput
                formControlName="adresse"
                placeholder="Adresse de livraison"
                rows="3"
              ></textarea>
              <button
                mat-button
                type="button"
                (click)="getLocation()"
                style="margin-top:8px;float:right;"
              >
                Utiliser ma localisation
              </button>
            </mat-form-field>
            <button
              class="btn btn-primary"
              type="submit"
              [disabled]="signupForm.invalid"
            >
              <span class="btn-text">S'inscrire</span>
            </button>
            <br /><br /><br />
            @if (signupError) {
            <p class="error-message">{{ signupError }}</p>
            }
            <p style="text-align: center; margin-top: 18px">
              <span>Déjà un compte ? </span>
              <a
                (click)="toggleForm(true)"
                style="color: #3498db; text-decoration: underline; cursor: pointer;"
                >Connectez-vous</a
              >
            </p>
          </form>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
  .auth-page-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  .auth-card {
    width: 400px;
    padding: 20px;
  }

  .full-width {
    width: 100%;
  }

  button {
    float: right;
  }
  .error-message {
    color: red;
    text-align: center;
  }
  `,
})
export default class LoginComponent {
  // ...existing code...
  getLocation() {
    if (!navigator.geolocation) {
      this.signupError =
        "La géolocalisation n'est pas supportée par votre navigateur.";
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        // Utilisation de l'API Nominatim pour obtenir l'adresse à partir des coordonnées GPS uniquement
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();
          const address = data.display_name || `${lat}, ${lng}`;
          this.signupForm.patchValue({ adresse: address });
        } catch (error) {
          this.signupError =
            "Impossible de récupérer l'adresse depuis la localisation.";
        }
      },
      (error) => {
        this.signupError = "Impossible d'accéder à la localisation.";
      },
      { enableHighAccuracy: true }
    );
  }
  showLoginForm = true;
  loginForm: FormGroup;
  signupForm: FormGroup;
  loginError = '';
  signupError = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router // Ajout ici
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.signupForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      telephone: [''],
      adresse: [''],
    });
  }

  toggleForm(showLogin: boolean) {
    this.showLoginForm = showLogin;
    this.loginError = '';
    this.signupError = '';
    this.loginForm.reset();
    this.signupForm.reset();
  }

  async onLogin() {
    this.loginError = '';
    if (this.loginForm.invalid) return;
    const { email, password } = this.loginForm.value;
    try {
      await this.authService.login(email, password);
      await this.router.navigate(['/acceuil']);
    } catch (err: any) {
      this.loginError = err?.message || 'Erreur lors de la connexion';
    }
  }

  async onSignup() {
    this.signupError = '';
    if (this.signupForm.invalid) return;
    const { nom, prenom, email, password, telephone, adresse } =
      this.signupForm.value;
    try {
      await this.authService.signup(
        nom,
        prenom,
        email,
        password,
        telephone,
        adresse
      );
      await this.router.navigate(['/acceuil']);
    } catch (err: any) {
      this.signupError = err?.message || "Erreur lors de l'inscription";
    }
  }
}
