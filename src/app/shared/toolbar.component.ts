import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CartService } from '../services/cart.service';
import { IS_MEDIUM, IS_SMALL } from '../constants';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatBadgeModule,
    MatButtonModule,
    MatMenuModule,
    CommonModule,
    RouterLink,
    RouterModule,
    MatTooltipModule,
  ],
  template: `
    <div class="toolbar">
      <mat-toolbar>
        <div class="left-container">
          <div class="mobile-menu">
            <button
              mat-icon-button
              matTooltip="Menu"
              [matMenuTriggerFor]="menu"
            >
              <mat-icon>menu</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              @if (user && !isAdmin) {
              <button mat-menu-item routerLink="/acceuil">Acceuil</button>
              <button mat-menu-item routerLink="/chaises">Chaises</button>
              <button mat-menu-item routerLink="/canapes">Canapés</button>
              <button mat-menu-item routerLink="/tables">Tables</button>
              <button mat-menu-item routerLink="/armoires">Armoires</button>
              } @if (user && isAdmin){
              <button mat-menu-item routerLink="/acceuil">Acceuil</button>
              <button mat-menu-item routerLink="/chaises">Chaises</button>
              <button mat-menu-item routerLink="/canapes">Canapés</button>
              <button mat-menu-item routerLink="/tables">Tables</button>
              <button mat-menu-item routerLink="/armoires">Armoires</button>
              <button mat-menu-item routerLink="/commandes">Commandes</button>
              }
            </mat-menu>
          </div>
          <h2 [ngStyle]="{ 'font-size': isMedium ? '1.5rem' : '2rem' }">
            <b style="color: #2c3e50">
              <span style="color: #e74c3c">S</span>amani<span
                style="color: #e74c3c"
                >.</span
              >
            </b>
          </h2>
        </div>

        <div class="desktop-links">
          @if (user && isAdmin) {
          <a
            routerLink="/acceuil"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            >Acceuil</a
          >
          <a routerLink="/chaises" routerLinkActive="active">Chaises</a>
          <a routerLink="/canapes" routerLinkActive="active">Canapés</a>
          <a routerLink="/tables" routerLinkActive="active">Tables</a>
          <a routerLink="/armoires" routerLinkActive="active">Armoires</a>
          <a routerLink="/commandes" routerLinkActive="active">Commandes</a>
          } @else {
          <a
            routerLink="/acceuil"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            >Acceuil</a
          >
          <a routerLink="/chaises" routerLinkActive="active">Chaises</a>
          <a routerLink="/canapes" routerLinkActive="active">Canapés</a>
          <a routerLink="/tables" routerLinkActive="active">Tables</a>
          <a routerLink="/armoires" routerLinkActive="active">Armoires</a>
          }
        </div>
        <div
          style="display: flex; gap: 1rem; justify-content: space-between; align-items: center;"
        >
          @if (user && !isAdmin) {
          <a
            routerLink="panier"
            matTooltip="Voir le panier"
            routerLinkActive="active"
          >
            <mat-icon>shopping_cart</mat-icon>
            <span>{{ cartCount }}</span>
          </a>
          } @if (user && isAdmin) {
          <a routerLink="/admin" routerLinkActive="active" class="admin-link">
            <mat-icon>admin_panel_settings</mat-icon>
            <span>Administration</span>
          </a>
          <a
            routerLink="/admin"
            matTooltip="Administration"
            routerLinkActive="active"
            class="connexion-mobile"
          >
            <mat-icon>admin_panel_settings</mat-icon>
          </a>
          } @if (user) {
          <a (click)="logout()" class="btn"> Déconnexion </a>
          <a
            (click)="logout()"
            matTooltip="Déconnexion"
            class="connexion-mobile"
          >
            <mat-icon>logout</mat-icon>
          </a>
          } @else {
          <a routerLink="login" class="btn"> Connexion </a>
          <a routerLink="login" matTooltip="Connexion" class="connexion-mobile">
            <mat-icon>login</mat-icon>
          </a>
          }
        </div>
      </mat-toolbar>
    </div>
  `,
  styles: `
  mat-toolbar{
    padding: 3rem;
    gap: 3rem;
    background-color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
    .left-container {
      display: flex;
      gap:1rem;
      align-items: center;
    }
  }
   
  .desktop-links {
    display: flex;
    gap: 1rem;
  }
  .mobile-menu {
    display: none;
  }
  .connexion-mobile {
    display: none;
  }
   a.active {
        color: #ff6347;
        font-weight: bold;
      }
  
  @media (max-width: 768px) {
    .left-container {
      gap:0.5rem;
    }
    mat-toolbar{
      padding: 2rem;
      gap: 1rem;
    }
    .desktop-links {
      display: none;
    }
    .mobile-menu {
      display: flex;
    }
    .connexion-mobile {
      display: inline-flex;
      align-items: center;
      margin-left: 0.5rem;
    }
    .btn {
      display: none;
    }
    .admin-link {
      display: none;
    }
  }
  `,
})
export class ToolbarComponent {
  isMedium = window.innerWidth <= 768;
  user: User | null = null;
  userNom: string | null = null;
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
        // Récupérer le nom
        const docRef = (await import('firebase/firestore')).doc;
        const getDoc = (await import('firebase/firestore')).getDoc;
        const userDoc = await getDoc(docRef(db, 'user', user.uid));
        this.userNom = userDoc.exists() ? userDoc.data()['nom'] : null;

        // Vérifier si admin (champ admin-list, tableau de dictionnaires)
        const adminDoc = await getDoc(doc(db, 'admin_ids', 'admin_ids'));
        const adminList: { email: string }[] = adminDoc.exists()
          ? adminDoc.data()['admin-list'] || []
          : [];
        this.isAdmin = adminList.some((admin) => admin.email === user.email);
      } else {
        this.userNom = null;
        this.isAdmin = false;
      }
    });

    // Abonnement au changement du cartCount
    this.cartService.cartCountChanged.subscribe((count) => {
      this.cartCount = count;
    });

    // Initialisation du cartCount au chargement
    this.cartService.getCartItems().then((items) => {
      // Si le panier est vide, items = []
      this.cartCount =
        items && items.length > 0
          ? items.reduce((sum, item) => sum + (item.quantite || 1), 0)
          : 0;
    });

    window.addEventListener('resize', () => {
      this.isMedium = window.innerWidth <= 768;
    });
  }

  async updateCartCount() {
    // Utilise le CartService pour récupérer le nombre d'articles
    const { CartService } = await import('../services/cart.service');
    const cartService = new CartService();
    this.cartCount = await cartService
      .getCartItems()
      .then((items) =>
        items.reduce((sum, item) => sum + (item.quantite || 1), 0)
      );
  }

  logout() {
    const auth = getAuth();
    signOut(auth);
  }

  showNotification(message: string) {
    this.snackBar.open(message, 'Fermer', { duration: 3000 });
  }
}
