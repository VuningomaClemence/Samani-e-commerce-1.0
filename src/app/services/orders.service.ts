import { Injectable } from '@angular/core';
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit as limitFn,
  startAfter,
  getDocs,
  doc,
  getDoc,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';

export interface OrderRow {
  id: string;
  numero?: string;
  clientId?: string;
  clientName?: string;
  localisation?: string;
  total?: number;
  createdAt?: any;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private db = getFirestore();

  // simple in-memory cache for clients: clientId -> { data, fetchedAt }
  private clientCache = new Map<string, { data: any; fetchedAt: number }>();
  private CLIENT_CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

  constructor() {}

  // List orders with optional date filter, server-side pagination (limit + cursor)
  // dateFilter: a Date object to match orders created on that day (UTC)
  async listOrders(options?: {
    dateFilter?: Date | null;
    limit?: number;
    cursor?: QueryDocumentSnapshot | null;
    searchText?: string | null; // search by order number or client name (client name applied client-side using cache)
  }): Promise<{ rows: OrderRow[]; nextCursor: QueryDocumentSnapshot | null }> {
    const limit = options?.limit || 20;
    const ordersCol = collection(this.db, 'commandes');

    let q: any = query(
      ordersCol,
      orderBy('createdAt', 'desc'),
      limitFn(limit + 1)
    );

    if (options?.dateFilter) {
      // Build start/end timestamps for the given date (UTC)
      const d = options.dateFilter;
      const start = new Date(
        Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0)
      );
      const end = new Date(
        Date.UTC(
          d.getUTCFullYear(),
          d.getUTCMonth(),
          d.getUTCDate(),
          23,
          59,
          59,
          999
        )
      );
      q = query(
        ordersCol,
        where('createdAt', '>=', start),
        where('createdAt', '<=', end),
        orderBy('createdAt', 'desc'),
        limitFn(limit + 1)
      );
    }

    if (options?.cursor) {
      q = query(q, startAfter(options.cursor));
    }

    const snap = await getDocs(q);
    const docs = snap.docs as QueryDocumentSnapshot<DocumentData>[];

    let nextCursor: QueryDocumentSnapshot | null = null;
    let sliced = docs;
    if (docs.length > limit) {
      sliced = docs.slice(0, limit);
      nextCursor = docs[limit];
    }

    const rows: OrderRow[] = [];
    for (const d of sliced) {
      const data = d.data() as DocumentData;
      const row: OrderRow = {
        id: d.id,
        numero: (data['numero'] as any) || d.id,
        clientId: (data['clientId'] as any) || null,
        localisation:
          (data['adresseLivraison'] as any) ||
          (data['localisation'] as any) ||
          null,
        total: (data['total'] as any) || null,
        createdAt: (data['createdAt'] as any) || null,
        ...data,
      };

      // attempt to attach clientName from cache (async) — we will populate later if missing
      const client = await this.getClient(row.clientId);
      if (client) {
        row.clientName = `${client.nom || ''} ${client.prenom || ''}`.trim();
      }

      rows.push(row);
    }

    // apply simple searchText filter client-side (because clientName may be in cache)
    if (options?.searchText) {
      const t = (options.searchText || '').toLowerCase();
      return {
        rows: rows.filter(
          (r) =>
            (r.numero || '').toLowerCase().includes(t) ||
            (r.clientName || '').toLowerCase().includes(t)
        ),
        nextCursor,
      };
    }

    return { rows, nextCursor };
  }

  // Get items for a specific order (on demand)
  async getOrderItems(orderId: string): Promise<any[]> {
    const itemsCol = collection(this.db, 'commandes', orderId, 'items');
    const snap = await getDocs(itemsCol);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  // client fetch with in-memory cache and TTL
  async getClient(clientId?: string | null): Promise<any | null> {
    if (!clientId) return null;
    const now = Date.now();
    const cached = this.clientCache.get(clientId);
    if (cached && now - cached.fetchedAt < this.CLIENT_CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const ref = doc(this.db, 'clients', clientId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        this.clientCache.set(clientId, { data, fetchedAt: now });
        return data;
      }
    } catch (e) {
      console.error('getClient error', e);
    }
    return null;
  }
}
