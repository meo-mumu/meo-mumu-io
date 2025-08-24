# Architecture Clean Code

Cette architecture suit les principes du clean code avec une structure plate et des noms explicites :

## 📁 Structure Clean

```
src/
├── sketches/              # Sketches p5.js
│   ├── particles.js       # Système de particules interactif
│   └── terrain.js         # Terrain génératif Perlin noise
└── ui/                    # Interface utilisateur (flat structure)
    ├── animation-cv.js    # Animation progressive du CV
    ├── bullet-colorizer.js# Colorisation automatique des bullets
    ├── email.js           # Désobfuscation des emails
    ├── expandable.js      # Accordéons et panels extensibles
    ├── mobile-nav.js      # Navigation responsive mobile
    ├── navigation.js      # Navigation principale + smooth scroll
    └── utils.js           # Utilitaires globaux et palette de couleurs
```

## ✨ Principes Clean Code appliqués

- **Noms explicites** : `bullet-colorizer.js` au lieu de `colors/index.js`
- **Structure plate** : Pas de nesting inutile, maximum 2 niveaux
- **Un fichier = Une responsabilité** : Chaque fichier a un rôle précis
- **Imports clairs** : Chemins courts et explicites

## 🚀 Point d'entrée

Le fichier `/public/assets/js/main.js` importe tous les modules avec des chemins simples.