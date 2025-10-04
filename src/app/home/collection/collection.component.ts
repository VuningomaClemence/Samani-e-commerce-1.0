import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [
    DecimalPipe,
    TitleCasePipe,
    MatCardModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
  ],
  template: `
    <div class="category-container">
      <h2 class="section-title">Nos Produits</h2>
      @if (loading) {
      <div class="loader-container"><div class="loader"></div></div>
      } @else if (error) {
      <div class="error-message">{{ error }}</div>
      } @else if (categories.length === 0) {
      <div>Aucun produit disponible.</div>
      } @else { @for (categorie of categories; track categorie) {
      <h3 class="category-title">{{ categorie | titlecase }}</h3>
      <div class="product-grid">
        @for (produit of produitsParCategorie[categorie]; track produit.id) {
        <mat-card class="product-card">
          <mat-card-content>
            <div class="product-image">
              <img [src]="produit.image" alt="{{ produit.nomProduit }}" />
            </div>
            <div class="product-info">
              <h3 class="product-title">{{ produit.nomProduit }}</h3>
              <p>{{ produit.description }}</p>
              <div class="product-price">
                {{ produit.prix | number : '1.2-2' }} $
              </div>
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
      } }
    </div>
  `,
  styles: `
    .section-title { text-align: center; margin-bottom: 24px; }
    .category-title { margin: 0 2rem; font-size: 1.5rem; color: #2c3e50; }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(315px, 1fr));
      gap: 30px;
    }
    .product-card {
      border-radius: 8px;
      margin: 2rem;
      overflow: hidden;
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
    .loader-container { display: flex; justify-content: center; align-items: center; height: 120px; }
    .loader {
      border: 6px solid #f3f3f3;
      border-top: 6px solid #3498db;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
    }
    .admin-actions {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}
    @keyframes spin {
      0% { transform: rotate(0deg);}
      100% { transform: rotate(360deg);}
    }
    .error-message { color: red; text-align: center; margin: 20px 0; }
  `,
})
export default class CollectionComponent implements OnInit {
  produitsParCategorie: { [key: string]: any[] } = {};
  categories: string[] = [];
  db = inject(Firestore);
  user: User | null = null;

  produits$!: Observable<any[]>;
  loading = true;
  error = '';
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
    const produitsRef = collection(this.db, 'produits');
    this.produits$ = collectionData(produitsRef, { idField: 'id' });

    this.produits$.subscribe({
      next: (produitsArray) => {
        this.loading = false;
        this.error = '';
        this.produitsParCategorie = {};
        (produitsArray as any[]).forEach((produit: any) => {
          let cat =
            typeof produit.categorie === 'string' && produit.categorie
              ? produit.categorie.trim().toLowerCase()
              : 'autres';
          if (!this.produitsParCategorie[cat]) {
            this.produitsParCategorie[cat] = [];
          }
          this.produitsParCategorie[cat].push(produit);
        });
        this.categories = Object.keys(this.produitsParCategorie);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Impossible de charger les produits pour le moment.';
      },
    });
  }
}
