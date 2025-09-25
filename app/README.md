# Portfolio Interactif - Architecture Modulaire

> Un portfolio artistique basé sur p5.js avec une architecture modulaire simple et performante.

### Vision du projet

Ce portfolio implémente une **Single Page Application (SPA)** avec un système de modules p5.js, permettant de basculer entre différentes expériences interactives : navigation principale, CV, et artworks génératifs (Shaderland).

### Comment lire ce document
- Quand il y a des "?" c'est que je ne sais pas encore

### Concepts clés
- **Instance p5.js unique** partagée entre tous les **pages** et **ressources**
- Chaque **Page** est constituée de son propre code et peut appeler des **ressources**
- **brain.js** gère la navigation et l'orchestration des **pages**, il peut lui aussi appeler des **ressources**


## Pages

### Main Page
Page principale quand on arrive sur meo-mumu.io

**Contient :**
- Texts affichés avec *MysteriousText*
- *Herald* (géré par brain.js)
- *Shockwave* shader (géré par brain.js)

### Curriculum Vitae
Affichage du curriculum vitae.

**Contient :**
- Chargement cv.html + cv.css
- *Herald* (géré par brain.js)

### Shaderland
Module vide pour l'instant
- *Herald* (géré par brain.js)


## Ressources

### Mysterious Text
Prend en entrée un objet text et gère son affichage avec des animations de police progressive selon la distance de la souris.


### Herald
Prend en entrée instruction (string, event, timming, ... ?) et l'affiche en bas à droite selon des evenements. 
Pour l'instant, il n'y a que l'event "welcome" qui affiche un message de bienvenue sur la **mainPage**.

### Shockwave shader
Shader d'onde de choc qui se déclanche selon un evenement.


## Developpement

- Classes et Interfaces et Heritances
- Design Patterns 
- Render Optimisation
- Component-based Architecture
- Micro-optimisations
- Micro-frontend
