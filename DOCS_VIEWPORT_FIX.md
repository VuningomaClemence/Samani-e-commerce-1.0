Viewport & Safe-area Fixes

But: corrections appliquées pour résoudre les problèmes d'affichage mobile / WebView (zones non cliquables).

Résumé des changements

- Ajout de `src/viewport-fix.ts` : calcule `--vh` = 1% de `window.innerHeight` et le met à jour sur `resize`/`orientationchange`.
- Import de `viewport-fix` dans `src/main.ts` pour exécution au boot.
- `src/styles.scss` mis à jour : utilise `height: calc(var(--vh, 1vh) * 100)` pour `html`/`body` et applique `env(safe-area-inset-*)` comme padding pour `app-root`.
- Remplacement des `height: 100vh` problématiques par `min-height: calc(var(--vh, 1vh) * 100)` dans les composants:
  - `src/app/home/login/login.component.ts`
  - `src/app/home/admin/admin.component.ts`
- Ajustements dans `src/app/shared/toolbar.component.ts` pour prendre en compte `env(safe-area-inset-top)` et réduire les paddings trop larges.
- `src/index.html` : ajout de `viewport-fit=cover` et `meta theme-color`.
- `capacitor.config.ts` : ajout d'une config basique pour le plugin `StatusBar` (backgroundColor, style).

Pourquoi ça corrige le bug

- `100vh` sur mobile peut correspondre à des valeurs différentes selon que la barre d'adresse est visible ou non. En se basant sur `window.innerHeight` (via `--vh`) on obtient une hauteur réellement visible pour la WebView.
- `viewport-fit=cover` + `env(safe-area-inset-*)` assurent que les zones de notch / gestures ne recouvrent pas les éléments interactifs.

Comment rebuild et tester (PowerShell)

# 1) Rebuild Angular (compte selon ton script)

npm run build

# 2) Mettre à jour la Web app native dans Capacitor (Android)

npx cap copy android;npx cap open android

Ouvre le projet dans Android Studio, build et exécute sur l'appareil ou l'émulateur problématique.

# 3) Déployer sur Firebase Hosting (si tu veux tester la webapp mobile)

# (assure-toi d'être dans le bon dossier build ou que firebase.json pointe vers dist)

npm run build;firebase deploy

Vérifications à faire

- Sur un appareil Android qui posait problème : vérifier que les boutons en haut/bas sont cliquables. Scroller jusqu'en haut/bas plusieurs fois (barre d'URL qui apparaît / disparaît) et vérifier l'UI.
- Vérifier la barre de statut (couleur) — si besoin ajuste `StatusBar` plugin ou styles natifs.
- Tester sur iOS (si PWA) : vérifier contenu sous notch et home indicator.

Récupérer / revenir en arrière

- Si un composant particulier nécessite toujours `100vh` pour une raison UX, remplacer par `min-height: calc(var(--vh, 1vh) * 100)` pour être compatible.

Si tu veux, je peux :

- Rechercher automatiquement d'autres occurrences problématiques (déjà fait : plus d'occurrences `height: 100vh` restantes),
- Ajouter une petite tâche npm `check:vh` qui grep/alerte les usages de 100vh,
- Ou générer un PR/commit avec les changements restants.

---

Fait par les modifications dans le repo. Si tu veux que je lance les commandes de build ici (avec `run_in_terminal`), dis-le et je les exécuterai dans PowerShell et je rapporterai les résultats.
