import { Component, Inject } from '@angular/core';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-edit-product-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCheckboxModule
],
  template: `
    <h2 mat-dialog-title>Modifier le produit</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <div mat-dialog-content class="grid gap-4 py-4">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nom</mat-label>
          <input matInput formControlName="nomProduit" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Prix</mat-label>
          <input matInput type="number" formControlName="prix" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Image (URL)</mat-label>
          <input matInput formControlName="image" />
        </mat-form-field>

        <mat-checkbox formControlName="promotion"
          >Mettre en promotion</mat-checkbox
        >

        <div
          style="display:flex; justify-content:flex-end; gap:12px; margin-top:12px;"
        >
          <button class="btn" (click)="close()" matTooltip="Annuler">
            <mat-icon style=" font-weight: 900;">arrow_back</mat-icon>
          </button>
          <button
            class="btn"
            type="submit"
            matTooltip="Enregistrer"
            [disabled]="form.invalid"
          >
            <mat-icon style=" font-weight: 900;">arrow_forward</mat-icon>
          </button>
        </div>
      </div>
    </form>
  `,
  styles: [
    `
      .dialog-card {
        padding: 1rem;
        min-width: 500px;
        max-width: 570px;
      }
      .full-width {
        width: 100%;
        margin-bottom: 1rem;
      }
      .grid {
        display: grid;
        grid-template-columns: 1fr;
      }
      .py-4 {
        padding-top: 1rem;
        padding-bottom: 0.5rem;
      }
      .gap-4 {
        gap: 0.5rem;
      }
    `,
  ],
})
export class EditProductDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      nomProduit: [data?.nomProduit || '', Validators.required],
      prix: [data?.prix || 0, [Validators.required, Validators.min(0)]],
      description: [data?.description || '', Validators.required],
      image: [data?.image || '', Validators.required],
      promotion: [data?.promotion || false],
    });
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  close() {
    this.dialogRef.close(null);
  }
}
