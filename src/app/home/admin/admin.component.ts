import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    MatCardModule,
    MatInputModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    RouterLink,
  ],
  template: `
    <div class="admin-container">
      <mat-card class="admin-card">
        <a
          mat-icon-button
          color="primary"
          routerLink="/acceuil"
          routerLinkActive="active"
        >
          <mat-icon style=" font-weight: 900;">arrow_back</mat-icon>
        </a>
        <mat-card-header>
          <mat-card-title
            style="width: 100%; text-align: center;font-size: 24px; font-weight: bold; margin-bottom: 20px"
          >
            Ajout du produit
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nom</mat-label>
              <input matInput formControlName="nomProduit" required />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea
                matInput
                formControlName="description"
                required
              ></textarea>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Prix</mat-label>
              <input
                type="number"
                matInput
                formControlName="prix"
                required
                (input)="updatePrixPromotionnel()"
              />
            </mat-form-field>
            <mat-form-field
              appearance="outline"
              class="full-width"
              *ngIf="productForm.get('promotion')?.value"
            >
              <mat-label>Prix promotionnel</mat-label>
              <input
                type="number"
                matInput
                [value]="prixPromotionnel"
                readonly
              />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Quantité</mat-label>
              <input
                type="number"
                matInput
                formControlName="quantite"
                required
              />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Catégorie</mat-label>
              <mat-select formControlName="categorie" required>
                <mat-option value="chaises">Chaises</mat-option>
                <mat-option value="canapes">Canapés</mat-option>
                <mat-option value="tables">Tables</mat-option>
                <mat-option value="armoires">Armoires</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Image (URL ou fichier)</mat-label>
              <input
                matInput
                formControlName="image"
                placeholder="Coller une URL ou sélectionner un fichier"
              />
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="fileInput.click()"
                aria-label="Choisir un fichier"
              >
                <mat-icon>attach_file</mat-icon>
              </button>
            </mat-form-field>

            <input
              #fileInput
              type="file"
              accept="image/*"
              style="display:none"
              (change)="onFileSelected($event)"
            />

            <mat-progress-bar
              *ngIf="uploading"
              mode="indeterminate"
              color="primary"
            ></mat-progress-bar>
            <div *ngIf="uploadError" class="error-message">
              {{ uploadError }}
            </div>

            <div *ngIf="previewUrl" style="margin-top:8px; text-align:center;">
              <img
                [src]="previewUrl"
                alt="Preview"
                style="max-width:100%; height:auto; border-radius:4px;"
              />
            </div>
            <mat-checkbox formControlName="promotion"
              >Mettre en promotion</mat-checkbox
            >
            <button
              class="btn btn-primary"
              type="submit"
              [disabled]="productForm.invalid"
            >
              Ajouter le produit
            </button>
            @if (message) {
            <div class="error-message">{{ message }}</div>
            }
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
   .admin-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(var(--vh, 1vh) * 100);
  }

  .admin-card {
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
export default class AdminComponent {
  prixPromotionnel: number = 0;
  productForm: FormGroup;
  message = '';
  uploading = false;
  uploadError: string | null = null;
  previewUrl: string | null = null;
  private db = getFirestore();
  private storage = getStorage();

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.productForm = this.fb.group({
      nomProduit: ['', Validators.required],
      description: ['', Validators.required],
      prix: [null, [Validators.required, Validators.min(0)]],
      quantite: [null, [Validators.required, Validators.min(0)]],
      categorie: ['', Validators.required],
      image: ['', Validators.required],
      promotion: [false],
    });
    this.productForm
      .get('prix')
      ?.valueChanges.subscribe(() => this.updatePrixPromotionnel());
    this.productForm
      .get('promotion')
      ?.valueChanges.subscribe(() => this.updatePrixPromotionnel());
  }

  async onSubmit() {
    this.message = '';
    if (this.productForm.invalid) {
      this.message = 'Veuillez remplir tous les champs correctement.';
      return;
    }
    try {
      const values = this.productForm.value;
      let prix = Number(values.prix);
      let prixPromotion = this.prixPromotionnel;
      await addDoc(collection(this.db, 'produits'), {
        ...values,
        prix: prix,
        prixPromotion: prixPromotion,
        dateAjout: serverTimestamp(),
      });
      this.snackBar.open('Produit ajouté avec succès !', 'Fermer', {
        duration: 2000,
      });
      this.productForm.reset();
      this.prixPromotionnel = 0;
    } catch (error: any) {
      this.message = `Erreur: ${error.message}`;
    }
  }

  updatePrixPromotionnel() {
    const prix = Number(this.productForm.get('prix')?.value);
    const promo = this.productForm.get('promotion')?.value;
    if (promo) {
      if (prix > 500) {
        this.prixPromotionnel = Math.round(prix * 0.9);
      } else if (prix > 250) {
        this.prixPromotionnel = Math.round(prix * 0.95);
      } else {
        this.prixPromotionnel = prix;
      }
    } else {
      this.prixPromotionnel = prix;
    }
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.uploading = true;
    this.uploadError = null;
    try {
      // Preview
      this.previewUrl = URL.createObjectURL(file);

      const storage = this.storage;
      const fileRef = storageRef(
        storage,
        `produits/${Date.now()}_${file.name}`
      );
      const snapshot = await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(fileRef);

      // Set the form control value to the download URL
      this.productForm.patchValue({ image: downloadUrl });
    } catch (err: any) {
      this.uploadError = err?.message || 'Erreur lors du téléversement';
    } finally {
      this.uploading = false;
    }
  }
}
