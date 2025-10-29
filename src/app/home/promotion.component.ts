import { Component, OnInit, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  getFirestore,
  query,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { AsyncPipe, NgStyle } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { getAuth, onAuthStateChanged, User } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-promotion',
  standalone: true,
  imports: [MatCardModule, AsyncPipe, MatIconModule, NgStyle, MatDialogModule],
  template: `
    <section class="promo-banner">
      <div class="container">
        @if ((produits$ | async)?.length === 0) {
        <div
          style="color: white; text-align: center;"
          [ngStyle]="{ 'font-size': isMedium ? '1rem' : '1.2rem' }"
        >
          <h2 [ngStyle]="{ 'font-size': isMedium ? '1.2rem' : '2rem' }">
            Offres Spéciales
          </h2>
          <br />
          <p [ngStyle]="{ 'font-size': isMedium ? '1rem' : '1.2rem' }">
            <b>PAS DE PRODUITS EN PROMOTIONS POUR LE MOMENT !!!</b>
          </p>
          <br />
          <p [ngStyle]="{ 'font-size': isMedium ? '1rem' : '1.2rem' }">
            Profitez de réductions sur les meubles de plus de 250 $.<br />
            <strong>Période de promotion : du 20 décembre au 06 janvier</strong>
          </p>
          <br />
        </div>
        } @else {
        <h2
          class="section-title"
          style="margin: 2rem; color: white;"
          [ngStyle]="{ 'font-size': isMedium ? '1.2rem' : '2rem' }"
        >
          Produits en Promotion
        </h2>
        <div class="product-grid">
          @for (produit of produits$ | async; track produit.id) {
          <mat-card class="product-card">
            <mat-card-content>
              <div class="product-image">
                <img [src]="produit.image" alt="{{ produit.nomProduit }}" />
              </div>
              <div class="product-info">
                <h3
                  class="product-title"
                  [ngStyle]="{ 'font-size': isMedium ? '1rem' : '1.2rem' }"
                >
                  {{ produit.nomProduit }}
                </h3>
                <p [ngStyle]="{ 'font-size': isMedium ? '0.9rem' : '1.1rem' }">
                  {{ produit.description }}
                </p>
                <div
                  class="product-price"
                  [ngStyle]="{ 'font-size': isMedium ? '1rem' : '1.2rem' }"
                >
                  @if (produit.promotion && produit.prixPromotion !==
                  produit.prix) {
                  <span
                    style="color: #888; text-decoration: line-through; margin-right: 8px;"
                  >
                    {{ getOldPrice(produit.prix) }} $
                  </span>
                  <span style="color: #e74c3c; font-weight: bold;">
                    {{ getNewPrice(produit.prix) }} $
                  </span>
                  } @else {
                  <span style="color: #e74c3c; font-weight: bold;">
                    {{ getOldPrice(produit.prix) }} $
                  </span>
                  }
                </div>
                @if (isAdmin) {
                <div class="admin-actions">
                  <button
                    matTooltip="Modifier le produit"
                    class="btn btn-warning"
                    (click)="modifierProduit(produit.id, produit)"
                    [ngStyle]="{ 'font-size': isMedium ? '0.9rem' : '1rem' }"
                  >
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button
                    matTooltip="Supprimer le produit"
                    class="btn btn-danger"
                    (click)="supprimerProduit(produit.id)"
                    [ngStyle]="{ 'font-size': isMedium ? '0.9rem' : '1rem' }"
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
                } @else {
                <button
                  matTooltip="Ajouter au panier"
                  class="btn add-to-cart"
                  (click)="addToCart(produit.id, produit)"
                  [ngStyle]="{ 'font-size': isMedium ? '0.9rem' : '1rem' }"
                >
                  <mat-icon>add_shopping_cart</mat-icon>
                </button>
                }
              </div>
            </mat-card-content>
          </mat-card>
          }
        </div>
        }
      </div>
    </section>
  `,
  styles: `
    .promo-banner {
    background: #e74c3c;
    padding: 30px 0;
    text-align: center;
    padding-bottom: 6.5rem;
    }
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
export default class PromotionComponent implements OnInit {
  produits$!: Observable<any[]>;
  db = inject(Firestore);
  user: User | null = null;
  isAdmin = false;
  isMedium = window.innerWidth <= 768;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private cartService: CartService,
    private dialog: MatDialog
  ) {
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
    window.addEventListener('resize', () => {
      this.isMedium = window.innerWidth <= 768;
    });
  }
  getOldPrice(prix: number): number {
    return prix;
  }

  getNewPrice(prix: number): number {
    if (prix > 500) {
      return Math.round(prix * 0.9);
    } else if (prix > 250) {
      return Math.round(prix * 0.95);
    }
    return prix;
  }

  async modifierProduit(productId: string, produit: any) {
    const mod = await import('../shared/edit-product-dialog.component');
    const ref = this.dialog.open(mod.EditProductDialogComponent, {
      data: produit,
      width: '400px',
    });

    const result = await ref.afterClosed().toPromise();
    if (result) {
      // compute prixPromotion similar to previous logic
      let prixNum = Number(result.prix);
      let prixPromotion = prixNum;
      if (result.promotion) {
        if (prixNum > 500) prixPromotion = Math.round(prixNum * 0.9);
        else if (prixNum > 250) prixPromotion = Math.round(prixNum * 0.95);
      }
      const newData = {
        ...result,
        prix: prixNum,
        prixPromotion,
      };
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
  ngOnInit() {
    const q = query(
      collection(this.db, 'produits'),
      where('promotion', '==', true)
    );
    this.produits$ = collectionData(q, { idField: 'id' });
  }
}
