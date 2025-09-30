import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  increment,
  collection,
  getDocs,
  writeBatch,
} from 'firebase/firestore';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

@Injectable({ providedIn: 'root' })
export class CartService {
  cartCountChanged = new Subject<number>();
  private db = getFirestore();
  private auth = getAuth();

  // Ajouter un produit au panier
  async addToCart(productId: string, productData: any) {
    const user = this.auth.currentUser;
    if (user) {
      const cartRef = doc(this.db, 'clients', user.uid, 'panier', productId);
      const docSnap = await getDoc(cartRef);
      if (docSnap.exists()) {
        await updateDoc(cartRef, { quantite: increment(1) });
      } else {
        await setDoc(cartRef, {
          ...productData,
          quantite: 1,
          addedAt: new Date(),
        });
      }
    } else if (isBrowser()) {
      let localCart = JSON.parse(localStorage.getItem('panier') || '{}');
      if (localCart[productId]) {
        localCart[productId].quantite++;
      } else {
        localCart[productId] = { ...productData, quantite: 1 };
      }
      localStorage.setItem('panier', JSON.stringify(localCart));
    }
    // Après ajout, notifie le changement
    const items = await this.getCartItems();
    const count = items.reduce((sum, item) => sum + (item.quantite || 1), 0);
    this.cartCountChanged.next(count);
  }

  // Supprimer un produit du panier
  async removeFromCart(productId: string) {
    const user = this.auth.currentUser;
    if (user) {
      const itemRef = doc(this.db, 'clients', user.uid, 'panier', productId);
      await deleteDoc(itemRef);
    } else if (isBrowser()) {
      let localCart = JSON.parse(localStorage.getItem('panier') || '{}');
      delete localCart[productId];
      localStorage.setItem('panier', JSON.stringify(localCart));
    }
  }

  // Récupérer les produits du panier
  async getCartItems(): Promise<any[]> {
    const user = this.auth.currentUser;
    if (user) {
      const snapshot = await getDocs(
        collection(this.db, 'clients', user.uid, 'panier')
      );
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } else if (isBrowser()) {
      const localCart = JSON.parse(localStorage.getItem('panier') || '{}');
      return Object.entries(localCart).map(([id, data]: any) => ({
        id,
        ...data,
      }));
    }
    return [];
  }

  // Vider le panier
  async clearCart() {
    const user = this.auth.currentUser;
    if (user) {
      const cartRef = collection(this.db, 'clients', user.uid, 'panier');
      const cartSnapshot = await getDocs(cartRef);
      const batch = writeBatch(this.db);
      cartSnapshot.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
    } else if (isBrowser()) {
      localStorage.removeItem('panier');
    }
  }

  // Mettre à jour la quantité d'un produit
  async updateQty(productId: string, newQty: number) {
    const user = this.auth.currentUser;
    if (user) {
      const itemRef = doc(this.db, 'clients', user.uid, 'panier', productId);
      await updateDoc(itemRef, { quantite: newQty });
    } else if (isBrowser()) {
      let localCart = JSON.parse(localStorage.getItem('panier') || '{}');
      if (localCart[productId]) {
        localCart[productId].quantite = newQty;
        localStorage.setItem('panier', JSON.stringify(localCart));
      }
    }
    // Optionnel : notifier le changement du nombre d'articles
    const items = await this.getCartItems();
    const count = items.reduce((sum, item) => sum + (item.quantite || 1), 0);
    this.cartCountChanged.next(count);
  }

  // Modifier un produit dans la collection 'produits'
  async updateProduct(productId: string, newData: any) {
    const productRef = doc(this.db, 'produits', productId);
    await updateDoc(productRef, newData);
  }

  // Supprimer un produit de la collection 'produits'
  async deleteProduct(productId: string) {
    const productRef = doc(this.db, 'produits', productId);
    await deleteDoc(productRef);
  }
}
