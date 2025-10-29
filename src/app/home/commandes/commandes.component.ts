import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface OrderView {
  id: string;
  idClient: string | null;
  clientName?: string | null;
  location?: string | null;
  dateCommande?: any;
  statutCommande?: string;
  montantTotal?: number;
  client?: any;
}

@Component({
  standalone: true,
  selector: 'app-commandes',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  template: `
    <mat-card appearance="outlined" style="padding:16px">
      <div>
        <h3
          style="margin:0;display: flex; align-items: center; justify-content: center; font-size: 1.5rem;"
          >
          Liste de toutes les commandes
        </h3>
        <div style="display:flex;align-items:center;gap:8px">
          <mat-form-field appearance="outline">
            <mat-label>Filtrer par date</mat-label>
            <input
              matInput
              [matDatepicker]="picker"
              [(ngModel)]="selectedDate"
              (dateInput)="fetchOrders($event.value)"
              placeholder="Choisir une date"
              />
              <mat-datepicker-toggle
                matSuffix
                [for]="picker"
              ></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
          </div>
        </div>
    
        <div style="margin-top:16px">
          <div class="cards-grid">
            @for (row of dataSource.data; track row) {
              <mat-card
                class="order-card"
                (click)="toggleDetails(row)"
                style="cursor:pointer"
                >
                <mat-card-title
                  style="font-size: 1.2rem;padding-left: 1rem;font-weight: 600;"
                  >Commande {{ row.id }}</mat-card-title
                  >
                  <mat-card-content>
                    <div>
                      <strong>Client:</strong> {{ row.clientName || row.idClient }}
                    </div>
                    <div>
                      <strong>Date:</strong>
                      {{
                      row.dateCommande
                      ? row.dateCommande.toDate
                      ? (row.dateCommande.toDate() | date : 'short')
                      : (row.dateCommande | date : 'short')
                      : '—'
                      }}
                    </div>
                    <div>
                      <strong>Total:</strong>
                      {{ row.montantTotal | number : '1.2-2' }} $
                    </div>
                    <div>
                      <strong>Statut:</strong>
                      <span
                  [ngStyle]="{
                    color:
                      row.statutCommande === 'Livré'
                        ? '#09ae53ff'
                        : row.statutCommande === 'Confirmé'
                        ? '#12bbf3ff'
                        : '#e73c3cff',
                    fontWeight: 'bold'
                  }"
                        >
                        {{ row.statutCommande || '—' }}
                      </span>
                    </div>
                  </mat-card-content>
                  <mat-card-actions>
                    <div
                      style="display:flex;align-items:center;gap:8px;padding:0 1rem;justify-content:space-between;width:100%"
                      >
                      <div style="display:flex;align-items:center;gap:8px">
                        <a
                          mat-button
                          style="color: black; cursor:pointer; font-weight:700"
                          (click)="toggleDetails(row); $event.stopPropagation()"
                          >
                          {{ expandedOrderId === row.id ? 'Fermer' : '+ Détails' }}
                        </a>
                      </div>
                      @if (isAdmin && getNextStatus(row.statutCommande)) {
                        <div
                          style="display:flex;align-items:center"
                          >
                          <button
                            class="btn add-to-cart"
                            (click)="advanceStatus(row, $event)"
                            >
                            {{ getActionLabel(row.statutCommande) }}
                          </button>
                        </div>
                      }
                    </div>
                  </mat-card-actions>
                  @if (expandedOrderId === row.id) {
                    <div class="card-detail">
                      <div style="margin-top:12px">
                        <h4>Client</h4>
                        @if (row.client) {
                          <div>
                            <div>
                              <strong>Nom:</strong> {{ row.client.nom }}
                              {{ row.client.prenom }}
                            </div>
                            <div>
                              <strong>Email:</strong> {{ row.client.email || '—' }}
                            </div>
                            <div>
                              <strong>Téléphone:</strong>
                              {{ row.client.telephone || '—' }}
                            </div>
                            <div>
                              <strong>Adresse:</strong>
                              {{
                              row.client.adresseLivraison || row.client.adresse || '—'
                              }}
                            </div>
                          </div>
                        } @else {
                          <div>Aucun détail client disponible</div>
                        }
                        <h4 style="margin-top:12px">Items</h4>
                        <table class="items-table" style="width:100%">
                          <thead>
                            <tr>
                              <th>Produit</th>
                              <th>Quantité</th>
                              <th>Prix unitaire</th>
                              <th>Sous-total</th>
                            </tr>
                          </thead>
                          <tbody>
                            @for (it of orderItemsMap.get(row.id) || []; track it) {
                              <tr>
                                <td>
                                  {{
                                  it.product?._displayName ||
                                  it.nomProduit ||
                                  it.product?.nom ||
                                  it.product?.name ||
                                  it.nom ||
                                  it.productName ||
                                  '—'
                                  }}
                                </td>
                                <td>{{ it.quantite ?? it.quantity ?? 1 }}</td>
                                <td>
                                  {{
                                  it.product?._displayPrice ??
                                  it.product?.prix ??
                                  it.product?.price ??
                                  it.prixUnitaire ??
                                  it.price ??
                                  it.unitPrice ??
                                  0 | number : '1.2-2'
                                  }}
                                  $
                                </td>
                                <td>
                                  {{
                                  (it.product?._displayPrice ??
                                  it.product?.prix ??
                                  it.product?.price ??
                                  it.prixUnitaire ??
                                  it.price ??
                                  it.unitPrice ??
                                  0) *
                                  (it.quantite ?? it.quantity ?? 1) | number : '1.2-2'
                                  }}
                                  $
                                </td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  }
                </mat-card>
              }
            </div>
    
            <mat-paginator
              [pageSizeOptions]="[5, 10, 25]"
              showFirstLastButtons
            ></mat-paginator>
          </div>
        </mat-card>
    `,
  styles: [
    `
      :host {
        display: block;
      }
      .cards-grid {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: 12px;
      }
      @media (min-width: 1024px) {
        .cards-grid {
          grid-template-columns: repeat(4, 1fr);
        }
      }
      .items-table th,
      .items-table td {
        padding: 8px 6px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      }
    `,
  ],
})
export default class CommandesComponent implements AfterViewInit {
  displayedColumns: string[] = [
    'id',
    'client',
    'location',
    'date',
    'total',
    'status',
  ];
  dataSource = new MatTableDataSource<OrderView>([]);
  loading = false;
  selectedDate: Date | null = null;
  expandedOrderId: string | null = null;
  orderItemsMap = new Map<string, any[]>();
  productCache = new Map<string, any>();
  clientCache = new Map<string, any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private db = getFirestore();
  isAdmin = false;
  private auth = getAuth();

  constructor(private snackBar: MatSnackBar) {
    this.setupAdminListener();
    this.fetchOrders();
  }

  private setupAdminListener() {
    try {
      onAuthStateChanged(this.auth, async (user) => {
        if (!user) {
          this.isAdmin = false;
          return;
        }
        try {
          const adminRef = doc(this.db, 'admin_ids', 'admin_ids');
          const snap = await getDoc(adminRef);
          if (snap && snap.exists()) {
            const list = (snap.data() as any)['admin-list'] || [];
            this.isAdmin = list.some((a: any) => a.email === user.email);
          } else {
            this.isAdmin = false;
          }
        } catch (e) {
          console.warn('Failed to check admin list', e);
          this.isAdmin = false;
        }
      });
    } catch (e) {
      this.isAdmin = false;
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async fetchOrders(date?: Date) {
    this.loading = true;
    try {
      const commandesCol = collection(this.db, 'commandes');
      let q;
      if (date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        q = query(
          commandesCol,
          where('dateCommande', '>=', start),
          where('dateCommande', '<', end),
          orderBy('dateCommande', 'desc')
        );
      } else {
        q = query(commandesCol, orderBy('dateCommande', 'desc'));
      }

      console.debug('fetchOrders: running primary query, date=', date);
      let snap = await getDocs(q);
      console.debug('fetchOrders: primary snap size=', snap.size);

      if (!date && snap.size === 0) {
        try {
          console.debug('fetchOrders: trying fallback orderBy createdAt');
          const q2 = query(commandesCol, orderBy('createdAt', 'desc'));
          const snap2 = await getDocs(q2);
          if (snap2.size > 0) {
            snap = snap2;
            console.debug(
              'fetchOrders: fallback createdAt returned',
              snap.size
            );
          } else {
            console.debug('fetchOrders: trying fallback orderBy created');
            const q3 = query(commandesCol, orderBy('created', 'desc'));
            const snap3 = await getDocs(q3);
            if (snap3.size > 0) {
              snap = snap3;
              console.debug(
                'fetchOrders: fallback created returned',
                snap.size
              );
            } else {
              const all = await getDocs(commandesCol);
              snap = all;
            }
          }
        } catch (e) {
          console.warn('fetchOrders: fallback queries failed', e);
        }
      }

      const snapFinal = snap;
      console.debug('fetchOrders: final snap size=', snapFinal.size);

      const orders: OrderView[] = [];
      for (const d of snapFinal.docs) {
        const data: any = d.data();
        const ov: OrderView = {
          id: d.id,
          idClient: data.idClient || data.clientId || data.client || null,
          dateCommande:
            data.dateCommande ||
            data.createdAt ||
            data.created ||
            data.created_at ||
            null,
          statutCommande: data.statutCommande,
          montantTotal: data.montantTotal,
        };

        if (data.idClient || data.clientId || data.client) {
          const cid = data.idClient || data.clientId || data.client;
          if (this.clientCache.has(cid)) {
            const cdata = this.clientCache.get(cid);
            ov.clientName =
              `${cdata.nom || ''} ${cdata.prenom || ''}`.trim() || null;
            ov.location = cdata.adresseLivraison || cdata.ville || null;
            (ov as any).client = cdata;
          } else {
            try {
              const clientRef = doc(this.db, 'clients', cid);
              const clientSnap = await getDoc(clientRef);
              if (clientSnap.exists()) {
                const cdata: any = clientSnap.data();
                this.clientCache.set(cid, cdata);
                ov.clientName =
                  `${cdata.nom || ''} ${cdata.prenom || ''}`.trim() || null;
                ov.location = cdata.adresseLivraison || cdata.ville || null;
                (ov as any).client = cdata;
              }
            } catch (e) {}
          }
        }

        orders.push(ov);
      }

      this.dataSource.data = orders;
    } finally {
      this.loading = false;
    }
  }

  resetFilter() {
    this.selectedDate = null;
    this.fetchOrders();
  }

  getActionLabel(status?: string | null): string {
    const next = this.getNextStatus(status);
    if (!next) return '';
    if (next === 'Confirmé') return 'Confirmer';
    if (next === 'Livré') return 'Livraison faite';
    return '';
  }

  getNextStatus(status?: string | null): string | null {
    if (!status) return 'Confirmé';
    const s = status.toLowerCase();
    if (s === 'en attente' || s === 'en_attente' || s === 'pending')
      return 'Confirmé';
    if (s === 'confirmé' || s === 'confirme' || s === 'confirmed')
      return 'Livré';
    return null;
  }

  async advanceStatus(row: OrderView, event?: Event) {
    try {
      if (event && typeof event.stopPropagation === 'function') {
        event.stopPropagation();
      }
      const next = this.getNextStatus(row.statutCommande);
      if (!next) {
        this.snackBar.open(
          'Aucune action disponible pour ce statut',
          'Fermer',
          { duration: 2000 }
        );
        return;
      }
      const ref = doc(this.db, 'commandes', row.id);
      await updateDoc(ref, { statutCommande: next });
      // update local state
      row.statutCommande = next;
      const data = this.dataSource.data.slice();
      const idx = data.findIndex((d) => d.id === row.id);
      if (idx > -1) {
        data[idx] = { ...data[idx], statutCommande: next };
        this.dataSource.data = data;
      }
      this.snackBar.open(`Statut mis à jour: ${next}`, 'Fermer', {
        duration: 2000,
      });
    } catch (e) {
      console.error('Failed to advance status', e);
      this.snackBar.open('Erreur lors de la mise à jour du statut', 'Fermer', {
        duration: 2000,
      });
    }
  }

  async toggleDetails(row: OrderView) {
    if (this.expandedOrderId === row.id) {
      this.expandedOrderId = null;
      return;
    }
    this.expandedOrderId = row.id;
    if (!this.orderItemsMap.has(row.id)) {
      try {
        const items = await this.fetchOrderItems(row.id);

        for (const it of items) {
          const pid =
            it.productId ||
            it.produitId ||
            it.idProduit ||
            it.product ||
            it.referenceProduit;
          if (pid) {
            if (this.productCache.has(pid)) {
              let cached = this.productCache.get(pid);
              if (!cached._displayName) {
                cached = normalizeProduct(cached);
                this.productCache.set(pid, cached);
              }
              it.product = cached;
            } else {
              try {
                const pRef = doc(this.db, 'produits', pid);
                const pSnap = await getDoc(pRef);
                if (pSnap.exists()) {
                  const pdata = pSnap.data();
                  const normalized = normalizeProduct(pdata);
                  this.productCache.set(pid, normalized);
                  it.product = normalized;
                }
              } catch (e) {}
            }
          }
        }

        this.orderItemsMap.set(row.id, items);
      } catch (e) {
        console.error('Failed fetching items for order', row.id, e);
        this.orderItemsMap.set(row.id, []);
      }
    }
  }

  async fetchOrderItems(orderId: string): Promise<any[]> {
    const candidates = [
      'items',
      'item',
      'produits',
      'produit',
      'ligne_items',
      'lines',
    ];

    for (const sub of candidates) {
      try {
        const col = collection(this.db, 'commandes', orderId, sub);
        const snap = await getDocs(col);
        if (snap && snap.size > 0) {
          const items: any[] = [];
          for (const d of snap.docs) {
            const it = { id: d.id, ...(d.data() as any) };

            if ((it.nomProduit || it.prixUnitaire) && !it.product) {
              it.product = normalizeProduct({
                nom: it.nomProduit,
                prix: it.prixUnitaire,
              });
            } else if (it.product && !it.product._displayName) {
              it.product = normalizeProduct(it.product);
            }
            items.push(it);
          }
          return items;
        }
      } catch (e) {}
    }
    return [];
  }
}

function normalizeProduct(p: any) {
  const name =
    p?.nom ||
    p?.name ||
    p?.titre ||
    p?.title ||
    p?.label ||
    p?.libelle ||
    p?.designation ||
    p?.productName ||
    null;
  const price =
    p?.prix || p?.price || p?.prixUnitaire || p?.unitPrice || p?.tarif || null;
  return {
    ...p,
    _displayName: name || 'Produit',
    _displayPrice: typeof price === 'number' ? price : parseFloat(price) || 0,
  };
}
