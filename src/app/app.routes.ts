import { Routes } from '@angular/router';
import { APP_NAME } from './constants';

export const routes: Routes = [
  {
    path: 'login',
    title: `Login - ${APP_NAME}`,
    loadComponent: () => import('./home/login/login.component'),
  },
  {
    path: 'admin',
    title: `Admin - ${APP_NAME}`,
    loadComponent: () => import('./home/admin/admin.component'),
  },

  {
    path: '',
    loadComponent: () => import('./home/home.component'),
    children: [
      {
        path: 'acceuil',
        title: `Acceuil - ${APP_NAME}`,
        loadComponent: () => import('./home/acceuil/acceuil.component'),
      },
      {
        path: 'collection',
        title: `Collection - ${APP_NAME}`,
        loadComponent: () => import('./home/collection/collection.component'),
      },
      {
        path: 'chaises',
        title: `Chaises - ${APP_NAME}`,
        loadComponent: () => import('./home/chaises/chaises.component'),
      },
      {
        path: 'canapes',
        title: `Canapés - ${APP_NAME}`,
        loadComponent: () => import('./home/canapes/canapes.component'),
      },
      {
        path: 'tables',
        title: `Tables - ${APP_NAME}`,
        loadComponent: () => import('./home/tables/tables.component'),
      },
      {
        path: 'armoires',
        title: `Armoires - ${APP_NAME}`,
        loadComponent: () => import('./home/armoire/armoire.component'),
      },
      {
        path: 'commandes',
        title: `Commandes - ${APP_NAME}`,
        loadComponent: () => import('./home/commandes/commandes.component'),
      },
      {
        path: 'panier',
        title: `Panier - ${APP_NAME}`,
        loadComponent: () => import('./home/panier/panier.component'),
      },
      {
        path: 'promotion',
        title: `Promotion - ${APP_NAME}`,
        loadComponent: () => import('./home/promotion.component'),
      },
      {
        path: '',
        redirectTo: 'acceuil',
        pathMatch: 'full',
      },
    ],
  },
];
