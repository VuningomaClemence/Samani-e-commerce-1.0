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
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { getAuth, onAuthStateChanged, User } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-promotion',
  standalone: true,
  imports: [MatCardModule, AsyncPipe, MatIconModule],
  template: `
    <section class="promo-banner">
      <div class="container">
        @if ((produits$ | async)?.length === 0) {
        <div style="color: white; text-align: center; font-size: 1.2rem;">
          <h2>Offres Spéciales</h2>
          <br />
          <p><b>PAS DE PRODUITS EN PROMOTIONS POUR LE MOMENT !!!</b></p>
          <br />
          <p>
            Profitez de réductions sur les meubles de plus de 500 $.<br />
            <strong>Période de promotion : du 20 décembre au 06 janvier</strong>
          </p>
          <br />
        </div>
        } @else {
        <h2 class="section-title" style="margin: 2rem; color: white;">
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
      background-color: white;
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

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private cartService: CartService
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
  }

  async modifierProduit(productId: string, produit: any) {
    const nomProduit = prompt('Nouveau nom du produit ?', produit.nomProduit);
    const prix = prompt('Nouveau prix ?', produit.prix);
    const description = prompt('Nouvelle description ?', produit.description);
    const quantite = prompt('Nouvelle quantité ?', produit.quantite);
    const image = prompt("Nouvelle URL de l'image ?", produit.image);
    const promotion = confirm(
      'Mettre en promotion ? (OK = Oui, Annuler = Non)'
    );

    if (nomProduit && prix && description && quantite && image) {
      const newData = {
        nomProduit,
        prix: Number(prix),
        description,
        quantite: Number(quantite),
        image,
        promotion,
      };
      await this.cartService.updateProduct(productId, newData);
      this.snackBar.open('Produit modifié !', 'Fermer', { duration: 2000 });
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
