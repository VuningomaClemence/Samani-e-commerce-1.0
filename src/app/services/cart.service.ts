import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
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
  onSnapshot,
} from 'firebase/firestore';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

@Injectable({ providedIn: 'root' })
export class CartService {
  cartCountChanged = new BehaviorSubject<number>(0);
  private db = getFirestore();
  private auth = getAuth();

  private cartUnsubscribe: (() => void) | null = null;

  private storageListener = (e: StorageEvent) => {
    if (e.key === 'panier') {
      this.refreshCount();
    }
  };

  constructor() {
    this.setupAuthCartListener();
    this.refreshCount();
  }

  private setupAuthCartListener() {
    try {
      onAuthStateChanged(this.auth, (user) => {
        // detach previous snapshot listener if any
        if (this.cartUnsubscribe) {
          try {
            this.cartUnsubscribe();
          } catch (e) {
            // ignore
          }
          this.cartUnsubscribe = null;
        }

        if (user) {
          const cartCol = collection(this.db, 'clients', user.uid, 'panier');
          this.cartUnsubscribe = onSnapshot(
            cartCol,
            (snapshot) => {
              const items = snapshot.docs.map((d) => ({
                id: d.id,
                ...(d.data() as any),
              }));
              const count = items.reduce(
                (sum: number, item: any) => sum + (item.quantite || 1),
                0
              );
              this.cartCountChanged.next(count);
            },
            (err) => {
              console.error('Cart onSnapshot error:', err);
              this.refreshCount();
            }
          );
          if (
            typeof window !== 'undefined' &&
            typeof window.removeEventListener === 'function'
          ) {
            try {
              window.removeEventListener('storage', this.storageListener);
            } catch (e) {}
          }
        } else {
          if (
            typeof window !== 'undefined' &&
            typeof window.addEventListener === 'function'
          ) {
            try {
              window.removeEventListener('storage', this.storageListener);
            } catch (e) {}
            window.addEventListener('storage', this.storageListener);
          }
          this.refreshCount();
        }
      });
    } catch (e) {
      this.refreshCount();
    }
  }

  private async refreshCount() {
    try {
      const items = await this.getCartItems();
      const count = items.reduce((sum, item) => sum + (item.quantite || 1), 0);
      this.cartCountChanged.next(count);
    } catch (e) {}
  }

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
    await this.refreshCount();
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
    await this.refreshCount();
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
    await this.refreshCount();
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
    await this.refreshCount();
  }

  // Modifier un produit dans la collection 'produits'
  async updateProduct(productId: string, newData: any): Promise<boolean> {
    try {
      const productRef = doc(this.db, 'produits', productId);
      await updateDoc(productRef, newData);
      return true;
    } catch (err) {
      console.error('updateProduct error:', err);
      return false;
    }
  }

  // Supprimer un produit de la collection 'produits'
  async deleteProduct(productId: string) {
    const productRef = doc(this.db, 'produits', productId);
    await deleteDoc(productRef);
  }
}
