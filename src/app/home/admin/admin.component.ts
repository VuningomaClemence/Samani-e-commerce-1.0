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

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    MatCardModule,
    MatInputModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  template: `
    <div class="admin-container">
      <mat-card class="admin-card">
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
              <input type="number" matInput formControlName="prix" required />
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
              <mat-label>URL de l'image</mat-label>
              <input type="url" matInput formControlName="image" required />
            </mat-form-field>
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
    height: 100vh;
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
  productForm: FormGroup;
  message = '';
  private db = getFirestore();

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
  }

  async onSubmit() {
    this.message = '';
    if (this.productForm.invalid) {
      this.message = 'Veuillez remplir tous les champs correctement.';
      return;
    }
    try {
      await addDoc(collection(this.db, 'produits'), {
        ...this.productForm.value,
        dateAjout: serverTimestamp(),
      });
      this.snackBar.open('Produit ajouté avec succès !', 'Fermer', {
        duration: 2000,
      });
      this.productForm.reset();
    } catch (error: any) {
      this.message = `Erreur: ${error.message}`;
    }
  }
}
