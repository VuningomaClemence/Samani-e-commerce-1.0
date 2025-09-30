import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { User, getAuth, onAuthStateChanged } from 'firebase/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service'; // <-- Ajout
import { CommonModule } from '@angular/common';
import { getFirestore } from 'firebase/firestore';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLinkActive } from '../../../../node_modules/@angular/router';

@Component({
  selector: 'app-acceuil',
  imports: [
    MatCardModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    MatTooltipModule,
    MatIconModule,
    RouterLinkActive,
  ],
  template: `
    <section class="hero">
      <div class="hero-content">
        <h1>Meubles d'exception pour votre intérieur</h1>
        @if (userNom && userPrenom) {
        <span
          style="margin-right: 1rem; font-size: 2rem; font-weight: bold; color: #e74c3c"
        >
          Bienvenue, {{ userNom }} {{ userPrenom }} !
        </span>
        }
        <p id="hero-user-message">
          Découvrez notre collection exclusive de chaises et meubles design,
          fabriqués avec des matériaux de qualité supérieure.
        </p>
        <a class="btn add-to-cart" routerLink="/collection">
          Découvrez notre collection
        </a>
      </div>
    </section>

    <section class="categories">
      <div class="container">
        <h2 class="section-title">Nos Catégories</h2>
        <div class="category-grid">
          <a routerLink="/chaises" class="category-card">
            <img
              src="https://i.pinimg.com/736x/dd/94/c4/dd94c40798cf188f927c088886d025a8.jpg"
              alt="Chaises"
            />
            <div class="category-overlay">
              <h3>Chaises</h3>
            </div>
          </a>
          <a routerLink="/canapes" class="category-card">
            <img
              src="https://tse2.mm.bing.net/th/id/OIP.vSyD-Eqn7QNxJRZWUAlawgHaHa?w=1000&h=1000&rs=1&pid=ImgDetMain"
              alt="Canapés"
            />
            <div class="category-overlay">
              <h3>Canapés</h3>
            </div>
          </a>
          <a routerLink="/tables" class="category-card">
            <img
              src="https://www.inside75.com/contents/refim/-c/console-extensible-stef-blanche-pietement-verre_4.jpg"
              alt="Tables"
            />
            <div class="category-overlay">
              <h3>Tables</h3>
            </div>
          </a>
          <a routerLink="/armoires" class="category-card">
            <img
              src="https://tse2.mm.bing.net/th/id/OIP.jpUCVJu4i6o_Lee4kz4HewHaIl?r=0&rs=1&pid=ImgDetMain"
              alt="Armoires"
            />
            <div class="category-overlay">
              <h3>Armoires</h3>
            </div>
          </a>
        </div>
      </div>
    </section>

    <section class="promo-banner">
      <div class="container">
        <h2>Soldes de fête - Jusqu'à 15% de réduction</h2>
        <p>
          Profitez de nos meilleures offres sur une sélection de meubles. Offre
          valable du 20 décembre au 06 janvier.
        </p>
        <a routerLink="/promotion" routerLinkActive="active" class="btn"
          >Voir les promotions</a
        >
      </div>
    </section>

    <section class="products">
      <div class="container">
        <h2 class="section-title">Nos Produits Phares</h2>
        <div class="product-grid">
          <mat-card>
            <mat-card-content>
              <div class="product-image">
                <img
                  src="https://tse4.mm.bing.net/th/id/OIP.iIx3kS1uGeQAzFepGHbjJQHaFj?r=0&w=735&h=551&rs=1&pid=ImgDetMain"
                  alt="Canapé cuir"
                />
              </div>
              <div class="product-info">
                <h3 class="product-title">Canapé d'angle scandinave</h3>
                <div class="product-price">950$</div>
                @if (!isAdmin){
                <button
                  class="btn"
                  (click)="
                    addToCart('canape1', {
                      nomProduit: 'Canapé d_angle scandinave',
                      prix: 950,
                      image:
                        'https://tse4.mm.bing.net/th/id/OIP.iIx3kS1uGeQAzFepGHbjJQHaFj?r=0&w=735&h=551&rs=1&pid=ImgDetMain'
                    })
                  "
                >
                  Ajouter au panier
                </button>
                }
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-content>
              <div class="product-image">
                <img
                  src="https://tse4.mm.bing.net/th/id/OIP.Rw7sFaIOY5O0-C6yQ46lCQHaHa?r=0&w=1920&h=1920&rs=1&pid=ImgDetMain"
                  alt="Table d'appoint scandinave"
                />
              </div>
              <div class="product-info">
                <h3 class="product-title">Table d'appoint scandinave</h3>
                <div class="product-price">200$</div>
                @if (!isAdmin) {
                <button
                  class="btn"
                  (click)="
                    addToCart('table1', {
                      nomProduit: 'Table d_appoint scandinave',
                      prix: 200,
                      image:
                        'https://tse4.mm.bing.net/th/id/OIP.Rw7sFaIOY5O0-C6yQ46lCQHaHa?r=0&w=1920&h=1920&rs=1&pid=ImgDetMain'
                    })
                  "
                >
                  Ajouter au panier
                </button>
                }
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-content>
              <div class="product-image">
                <img
                  src="https://i.pinimg.com/originals/5c/95/95/5c959539106dd00938347a51f7da6399.jpg"
                  alt="Armoire vintage"
                />
              </div>
              <div class="product-info">
                <h3 class="product-title">Armoire vintage</h3>
                <div class="product-price">200$</div>
                @if (!isAdmin) {
                <button
                  class="btn"
                  (click)="
                    addToCart('armoire1', {
                      nomProduit: 'Armoire vintage',
                      prix: 200,
                      image:
                        'https://i.pinimg.com/originals/5c/95/95/5c959539106dd00938347a51f7da6399.jpg'
                    })
                  "
                >
                  Ajouter au panier
                </button>
                }
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-content>
              <div class="product-image">
                <img
                  src="https://media.but.fr/images_produits/produit-zoom/3662970113042_AMB1.jpg"
                  alt="Chaise scandinave bleu pétrole"
                />
              </div>
              <div class="product-info">
                <h3 class="product-title">Chaise scandinave bleu pétrole</h3>
                <div class="product-price">120$</div>
                @if (!isAdmin) {
                <button
                  class="btn"
                  (click)="
                    addToCart('chaise1', {
                      nomProduit: 'Chaise scandinave bleu pétrole',
                      prix: 120,
                      image:
                        'https://media.but.fr/images_produits/produit-zoom/3662970113042_AMB1.jpg'
                    })
                  "
                >
                  Ajouter au panier
                </button>
                }
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </section>
    <section class="stats">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item">
            <h3>250+</h3>
            <p>Clients satisfaits</p>
          </div>
          <div class="stat-item">
            <h3>10+</h3>
            <p>Années d'expérience</p>
          </div>
          <div class="stat-item">
            <h3>100+</h3>
            <p>Produits disponibles</p>
          </div>
          <div class="stat-item">
            <h3>24/7</h3>
            <p>Service client</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
  .hero {
  background: linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.5)),
    url("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")
      no-repeat center center/cover;
  height: 80vh;
  min-height: 500px;
  display: flex;
  align-items: center;
  color: white;
  text-align: center;
  position: relative;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 48px;
  margin-bottom: 20px;
}

.hero p {
  font-size: 20px;
  margin-bottom: 30px;
}
/* Catégories */
.categories {
  padding: 25px 0;
  margin: 0 2rem;
}

.section-title {
  text-align: center;
  margin-bottom: 40px;
  font-size: 32px;
  color: #2c3e50;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 20px;
}

.category-card {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.category-card:hover {
  transform: translateY(-5px);
}

.category-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-overlay {
  display: flex;
  justify-content: space-between;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 20px;
  color: white;
}

/* Promotions */
.promo-banner {
  background-color: #e74c3c;
  color: white;
  padding: 30px 0;
  text-align: center;
}

.promo-banner h2 {
  font-size: 28px;
  margin-bottom: 10px;
}

.promo-banner p {
  font-size: 18px;
  margin-bottom: 20px;
}
/* Produits */
.products {
  padding: 60px 2rem;
  background-color: #f9f9f9;
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

.product-price .old-price {
  text-decoration: line-through;
  color: #777;
  font-size: 16px;
  margin-left: 10px;
}

.product-rating {
  color: #f39c12;
  margin-bottom: 15px;
}

/* Statistiques */
.stats {
  padding: 60px 0;
  background-color: #2c3e50;
  color: white;
  margin-bottom: 3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  text-align: center;
}

.stat-item h3 {
  font-size: 40px;
  margin-bottom: 10px;
  color: #e74c3c;
}

/* Newsletter */
.newsletter {
  padding: 60px 0;
  text-align: center;
}

.newsletter-form {
  max-width: 500px;
  margin: 0 auto;
  display: flex;
}

.newsletter-form input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 16px;
}

.newsletter-form button {
  border-radius: 0 4px 4px 0;
}

`,
})
export default class AcceuilComponent {
  user: User | null = null;
  userNom: string | null = null;
  userPrenom: string | null = null;
  cartCount = 0;
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
        const { nom, prenom } = await this.authService.getUserNomPrenom();
        this.userNom = nom;
        this.userPrenom = prenom;

        const docRef = (await import('firebase/firestore')).doc;
        const getDoc = (await import('firebase/firestore')).getDoc;
        const adminDoc = await getDoc(docRef(db, 'admin_ids', 'admin_ids'));
        const adminList: { email: string }[] = adminDoc.exists()
          ? adminDoc.data()['admin-list'] || []
          : [];
        this.isAdmin = adminList.some((admin) => admin.email === user.email);
      } else {
        this.userNom = null;
        this.userPrenom = null;
        this.isAdmin = false;
      }
    });
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

  async modifierProduit(productId: string, newData?: any) {
    const productData = await this.cartService.updateProduct(
      productId,
      newData
    );
    this.snackBar.open('Produit modifié !', 'Fermer', {
      duration: 2000,
    });
  }

  async supprimerProduit(productId: string) {
    await this.cartService.deleteProduct(productId);
    this.snackBar.open('Produit supprimé !', 'Fermer', { duration: 2000 });
  }
}
