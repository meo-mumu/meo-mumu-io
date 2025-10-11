# meo-mumu.io — Portfolio Interactif Modulaire

Portfolio artistique interactif basé sur **p5.js**, conçu comme une Single Page Application (SPA) modulaire. Il permet de naviguer entre différentes expériences : page principale, CV, et artworks génératifs (Shaderland).

---

## Fonctionnalités principales

- Instance p5.js unique partagée entre toutes les pages/modules
- Navigation modulaire orchestrée par `core/brain.js`
- Pages indépendantes : chaque page possède son propre code et peut utiliser des ressources communes
- Ressources graphiques : animations de texte, effets shader, gestion d’événements

---

## Structure du projet

meo-mumu-io/
├── core/                  # Orchestrateur principal (navigation, gestion globale)
├── pages/
│   ├── main-page/         # Page d’accueil
│   ├── curriculum-vitae/  # Page CV (affichage, animations, export PDF)
│   └── shaderland/        # Artworks génératifs (Pokémon, Particules, contrôles)
├── ressources/
│   ├── fonts/             # Polices utilisées
│   ├── mysterious-text/   # Animation de texte
│   ├── herald/            # Messages contextuels
│   └── shockwave/         # Effet shader d’onde de choc
├── index.html             # Point d’entrée SPA
└── main.css               # Styles globaux


---

## Pages

### Main Page
- Texte animé avec MysteriousText
- Message contextuel via Herald
- Effet Shockwave shader

### Curriculum Vitae
- Affichage du CV avec animations
- Export PDF
- Message contextuel via Herald

### Shaderland
- Génération de créatures (Pokémon, Particules)
- Contrôles interactifs via Tweakpane
- Effets de couleurs et mouvements

---

## Ressources

- MysteriousText : Animation de texte progressive selon la souris
- Herald : Affichage de messages contextuels en bas à gauche
- Shockwave Shader : Effet visuel déclenché par événement

---

## Développement

- Architecture orientée composants/classes
- Optimisations de rendu et micro-frontend
- Utilisation de design patterns pour la modularité

---

## Installation & Lancement

1. Cloner le repo
2. Installer les dépendances (si besoin)
3. Ouvrir `index.html` dans un navigateur compatible

---

## Fichiers principaux

- `core/brain.js` : Orchestrateur principal
- `pages/main-page/mainPage.js` : Page d’accueil
- `pages/curriculum-vitae/cvPageCore.js` : Logique CV
- `pages/shaderland/shaderland.js` : Génératif Shaderland

---

## Auteur

Projet réalisé par **meo-mumu** — portfolio artistique interactif.