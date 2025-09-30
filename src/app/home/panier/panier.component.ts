import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
  writeBatch,
  getDocs,
} from 'firebase/firestore';

import { DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  imports: [DecimalPipe, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <main class="panier-container">
      <h1 class="page-title">Votre Panier</h1>
      <div class="product-grid">
        @if (loading) {
        <mat-card class="loading-card">
          <mat-card-content>
            <p>Chargement...</p>
          </mat-card-content>
        </mat-card>
        } @else { @if (cartItems.length === 0) {
        <mat-card class="empty-card">
          <mat-card-content>
            <mat-icon color="warn" style="font-size: 48px;"
              >remove_shopping_cart</mat-icon
            >
            <div id="empty-cart-message">Votre panier est vide.</div>
          </mat-card-content>
        </mat-card>
        } @else { @for (item of cartItems; track item.id) {
        <mat-card class="product-card" [attr.data-id]="item.id">
          <div class="product-image">
            <img [src]="item.image" [alt]="item.nomProduit" />
          </div>
          <div class="product-info">
            <h3 class="product-title">{{ item.nomProduit }}</h3>
            <div class="product-price">
              {{ item.prix | number : '1.2-2' }} $
            </div>
            <div class="qty-row">
              <button
                mat-icon-button
                color="primary"
                (click)="updateQty(item, -1)"
                [disabled]="item.quantite <= 1"
              >
                <mat-icon>remove</mat-icon>
              </button>
              <span class="qty-label">Quantité :</span>
              <span class="qty-value">{{ item.quantite }}</span>
              <button
                mat-icon-button
                color="primary"
                (click)="updateQty(item, 1)"
              >
                <mat-icon>add</mat-icon>
              </button>
            </div>
            <mat-card-actions align="end">
              <button class="btn-danger" (click)="removeItem(item)">
                <mat-icon>delete</mat-icon>
              </button>
            </mat-card-actions>
          </div>
        </mat-card>
        }
        <mat-card class="summary-card">
          <mat-card-content>
            <div id="cart-summary">
              <strong
                >Total à payer: {{ getTotal() | number : '1.2-2' }} $</strong
              >
            </div>
          </mat-card-content>
          <button
            class="btn btn-validate"
            (click)="checkout()"
            style="align-items: center; justify-content: center; display: flex; gap: 8px; margin-top: 2rem; background-color: #e74c3c; font-weight: 600;"
          >
            <mat-icon>shopping_bag</mat-icon>
            Valider la commande
          </button>
        </mat-card>
        } }
      </div>
    </main>
  `,
  styles: `
    .panier-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    .page-title {
      text-align: center;
      font-size: 2.2rem;
      margin-bottom: 2rem;
      color: #2c3e50;
      font-weight: bold;
    }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 30px;
    }
    .product-card {
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
    }
    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }
    .product-image {
      height: 200px;
      overflow: hidden;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fafafa;
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
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      flex: 1;
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
    .qty-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    .qty-label {
      font-weight: 500;
      color: #555;
    }
    .qty-value {
      font-size: 1.2rem;
      font-weight: bold;
      color: #e74c3c;
      margin: 0 8px;
    }
    .summary-card {
      width: 100%;
      max-width: 600px;
      margin-top: 2rem;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(44,62,80,0.08);
      border-radius: 12px;
      background: #f4dfdfff;
      text-align: center;
      grid-column: 1 / -1;
    }
    .empty-card, .loading-card {
      width: 320px;
      min-width: 260px;
      margin: 2rem auto;
      text-align: center;
      background: #fff3f3;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(44,62,80,0.08);
      grid-column: 1 / -1;
    }
    .btn-danger {
       color: #e74c3c;
       border: none;
       background: none;
       cursor: pointer;
    }
    
    @media (max-width: 700px) {
      .product-grid {
        grid-template-columns: 1fr;
        gap: 1.2rem;
      }
      .product-card, .summary-card, .empty-card, .loading-card {
        width: 100%;
        min-width: unset;
        max-width: 98vw;
      }
      .product-image {
        height: 160px;
      }
    }
  `,
})
export default class PanierComponent implements OnInit {
  cartItems: any[] = [];
  loading = true;
  user: User | null = null;

  constructor(
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      this.user = user;
      await this.loadCart();
    });
  }

  async loadCart() {
    this.loading = true;
    this.cartItems = await this.cartService.getCartItems();
    this.loading = false;
  }

  getTotal(): number {
    return this.cartItems.reduce(
      (sum, item) => sum + item.prix * item.quantite,
      0
    );
  }

  async updateQty(item: any, change: number) {
    const newQty = item.quantite + change;
    if (newQty < 1) return;
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const db = getFirestore();
      const itemRef = doc(db, 'clients', user.uid, 'panier', item.id);
      await updateDoc(itemRef, { quantite: newQty });
    } else {
      await this.cartService.updateQty(item.id, newQty);
    }
    await this.loadCart();
  }

  async removeItem(item: any) {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const db = getFirestore();
      const itemRef = doc(db, 'clients', user.uid, 'panier', item.id);
      await deleteDoc(itemRef);
    } else {
      await this.cartService.removeFromCart(item.id);
    }
    await this.loadCart();
  }

  async checkout() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      alert('Veuillez vous connecter pour passer une commande.');
      return;
    }
    if (this.cartItems.length === 0) {
      alert('Votre panier est vide.');
      return;
    }
    const db = getFirestore();
    const total = this.getTotal();

    // 1. Créer la commande
    const commandeRef = await addDoc(collection(db, 'commandes'), {
      idClient: user.uid,
      dateCommande: new Date(),
      statutCommande: 'En attente',
      montantTotal: total,
    });

    // 2. Ajouter les articles à la sous-collection 'items' de la commande
    const batch = writeBatch(db);
    this.cartItems.forEach((item) => {
      const itemRef = doc(db, 'commandes', commandeRef.id, 'items', item.id);
      batch.set(itemRef, {
        nomProduit: item.nomProduit,
        prixUnitaire: item.prix,
        quantite: item.quantite,
      });
    });
    await batch.commit();

    // 3. Vider le panier de l'utilisateur
    const cartRef = collection(db, 'clients', user.uid, 'panier');
    const cartSnapshot = await getDocs(cartRef);
    const deleteBatch = writeBatch(db);
    cartSnapshot.docs.forEach((docSnap) => {
      deleteBatch.delete(docSnap.ref);
    });
    await deleteBatch.commit();

    this.snackBar.open(
      `Merci pour votre commande ! Votre numéro de commande est : ${commandeRef.id}`,
      'Fermer',
      { duration: 3000 }
    );
    await this.loadCart();
  }
}
