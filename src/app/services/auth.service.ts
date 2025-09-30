import { Injectable } from '@angular/core';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
  User,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyANWd0Vvfmddzg7CyOXJfa3wbRO5ML789Q',
  authDomain: 'samani-452ad.firebaseapp.com',
  projectId: 'samani-452ad',
  storageBucket: 'samani-452ad.firebasestorage.app',
  messagingSenderId: '9036667315',
  appId: '1:9036667315:web:dbf70c120219594bab53c6',
};

const app = initializeApp(firebaseConfig);

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = getAuth(app);
  private db = getFirestore(app);

  constructor() {}

  async signup(
    nom: string,
    prenom: string,
    email: string,
    password: string,
    telephone: string,
    adresse: string
  ): Promise<UserCredential> {
    const cred = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    );
    await setDoc(doc(this.db, 'clients', cred.user.uid), {
      nom,
      prenom,
      email,
      telephone,
      adresseLivraison: adresse,
    });
    return cred;
  }

  async login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async getUserNomPrenom(): Promise<{
    nom: string | null;
    prenom: string | null;
  }> {
    const user: User | null = this.auth.currentUser;
    if (!user) return { nom: null, prenom: null };
    const userDoc = await getDoc(doc(this.db, 'clients', user.uid));
    if (userDoc.exists()) {
      return {
        nom: userDoc.data()['nom'] || null,
        prenom: userDoc.data()['prenom'] || null,
      };
    }
    return { nom: null, prenom: null };
  }
}
