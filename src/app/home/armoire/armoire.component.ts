import { Component, OnInit } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  getFirestore,
  query,
  where,
} from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { getAuth, onAuthStateChanged, User } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-armoire',
  standalone: true,
  imports: [
    AsyncPipe,
    MatCardModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatDialogModule,
  ],
  template: `
    <section class="products">
      <div class="container">
        <h2
          class="section-title"
          style="display: flex; justify-content: center; align-items: center;"
        >
          Nos Armoires
        </h2>
        <div class="product-grid">
          @if ((produits$ | async)?.length === 0) {
          <div>Aucune armoire disponible.</div>
          } @else { @for (produit of produits$ | async; track produit.id) {
          <mat-card class="product-card">
            <mat-card-content>
              <div class="product-image">
                <img [src]="produit.image" alt="{{ produit.nomProduit }}" />
              </div>
              <div class="product-info">
                <h3 class="product-title">{{ produit.nomProduit }}</h3>
                <p>{{ produit.description }}</p>
                <div class="product-price">{{ produit.prix }} $</div>
                @if (isAdmin) {
                <div class="admin-actions">
                  <button
                    matTooltip="Modifier le produit"
                    class="btn btn-warning"
                    (click)="modifierProduit(produit.id, produit)"
                  >
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button
                    matTooltip="Supprimer le produit"
                    class="btn btn-danger"
                    (click)="supprimerProduit(produit.id)"
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
                } @else {
                <button
                  matTooltip="Ajouter au panier"
                  class="btn add-to-cart"
                  (click)="addToCart(produit.id, produit)"
                >
                  <mat-icon>add_shopping_cart</mat-icon>
                </button>
                }
              </div>
            </mat-card-content>
          </mat-card>
          }}
        </div>
      </div>
    </section>
  `,
  styles: `
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(315px, 1fr));
      gap: 30px;
    }

    .product-card {
      border-radius: 8px;
      overflow: hidden;
      margin: 2rem;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s;
    }

    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .product-image {
      height: 200px;
      overflow: hidden;
    }
    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s;
    }

    .product-card:hover .product-image img {
      transform: scale(1.05);
    }

    .product-info {
      padding: 20px;
    }

    .product-title {
      font-size: 18px;
      margin-bottom: 10px;
    }

    .product-price {
      font-weight: bold;
      color: #e74c3c;
      font-size: 20px;
      margin-bottom: 15px;
    }

    .admin-actions {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}
  `,
})
export default class ArmoireComponent implements OnInit {
  isAdmin = false;
  db = inject(Firestore);
  produits$!: Observable<any[]>;
  user: User | null = null;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private cartService: CartService,
    private dialog: MatDialog
  ) {
    // dialog will be injected below
    const auth = getAuth();
    const db = getFirestore();
    onAuthStateChanged(auth, async (user) => {
      this.user = user;
      if (user) {
        const docRef = (await import('firebase/firestore')).doc;
        const getDoc = (await import('firebase/firestore')).getDoc;
        const adminDoc = await getDoc(docRef(db, 'admin_ids', 'admin_ids'));
        const adminList: { email: string }[] = adminDoc.exists()
          ? adminDoc.data()['admin-list'] || []
          : [];
        this.isAdmin = adminList.some((admin) => admin.email === user.email);
      } else {
        this.isAdmin = false;
      }
    });
  }

  ngOnInit() {
    const q = query(
      collection(this.db, 'produits'),
      where('categorie', '==', 'armoires')
    );
    this.produits$ = collectionData(q, { idField: 'id' });
  }

  async modifierProduit(productId: string, produit: any) {
    const mod = await import('../../shared/edit-product-dialog.component');
    // open dialog dynamically
    const ref = this.dialog.open(mod.EditProductDialogComponent, {
      data: produit,
      width: '400px',
    });
    const result = await ref.afterClosed().toPromise();
    if (result) {
      const newData = { ...result, prix: Number(result.prix) };
      const ok = await this.cartService.updateProduct(productId, newData);
      if (ok)
        this.snackBar.open('Produit modifié !', 'Fermer', { duration: 2000 });
      else
        this.snackBar.open(
          'Erreur lors de la modification du produit.',
          'Fermer',
          { duration: 3000 }
        );
    }
  }

  async supprimerProduit(productId: string) {
    await this.cartService.deleteProduct(productId);
    this.snackBar.open('Produit supprimé !', 'Fermer', { duration: 2000 });
  }

  async addToCart(productId: string, productData: any) {
    if (!this.user) {
      this.snackBar.open(
        'Veuillez vous connecter pour ajouter un produit au panier.',
        'Fermer',
        {
          duration: 5000,
        }
      );
      return;
    }
    await this.cartService.addToCart(productId, productData);
    this.snackBar.open('Produit ajouté au panier !', 'Fermer', {
      duration: 2000,
    });
  }
}
