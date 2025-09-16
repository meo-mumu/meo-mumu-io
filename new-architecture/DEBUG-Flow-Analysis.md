# ANALYSE DU FLOW - CONFLIT DE SHADERS

## 🔥 PROBLÈME IDENTIFIÉ
- **Erreur**: `WebGL: INVALID_OPERATION: drawElements: no valid shader program in use`
- **Symptôme**: Clignotement bleu turquoise
- **Cause probable**: Conflit entre shader Conway (ShaderLand) et shader Shockwave (Brain)

## 🎯 RÉSUMÉ EXÉCUTIF

Le problème survient lors de la séquence suivante **dans la même frame** :
1. **ShaderLand** applique son Conway shader → État WebGL modifié
2. **Brain** essaie d'appliquer son Shockwave shader → Échec car état corrompu

## 📊 FLOW D'APPEL DÉTAILLÉ

### 1. INITIALISATION
```
Brain.init()
├── new p5(coreP5Logic, 'p5-container')
├── registerPage('shaderland', new ShaderLand())
└── switchTo('mainPage')

ShaderLand.preload(p)
├── loadShader('claudeConway.vert', 'claudeConway.frag')
└── console.log('Shader loaded')

ShaderLand.init(p)
├── createGraphics(width, height, WEBGL) × 2 (ping-pong)
└── background(244, 243, 241)
```

### 2. ACTIVATION SHADERLAND
```
MainPage.handleTextClick("shaderland")
├── shockwave.triggerBigShockwaveAnimation()
├── setTimeout(() => brain.switchTo('shaderland'), 1000)
└── ShaderLand.show() → isActive = true
```

### 3. RENDU (CHAQUE FRAME) - ⚠️ ZONE DE CONFLIT
```
Brain.draw()
├── p.translate(-width/2, -height/2)
├──
├── if (shockwave.isInitialized)
│   ├── shockwave.beginRender()
│   │   ├── handleMouseSpeed()
│   │   ├── graphics.background(244, 243, 241)  ← Graphics 2D
│   │   └── p.clear()
│   │
│   ├── activePage.renderToGraphics(shockwave.graphics)  ← ShaderLand ICI
│   │   ├── if (frameCount % 15 === 0)
│   │   │   └── ShaderLand.updateConwayWithShader()  ⚠️ PROBLÈME
│   │   │       ├── [currentTexture, previousTexture] = [previous, current]
│   │   │       ├── currentTexture.clear()
│   │   │       ├── currentTexture.shader(conwayShader)  ← WebGL shader
│   │   │       ├── setUniform('previousGeneration', previousTexture)
│   │   │       ├── setUniform('resolution', [w, h])
│   │   │       ├── currentTexture.rect()  ← Rendu avec Conway shader
│   │   │       └── currentTexture.resetShader()
│   │   └── graphics.image(currentTexture, 0, 0)  ← Copy vers Graphics 2D
│   │
│   └── shockwave.endRender()  ⚠️ CONFLIT ICI
│       ├── p.resetShader()  ← Tentative de nettoyage
│       ├── p.shader(shockwaveShader)  ← Shockwave shader
│       ├── setUniform("centres", ...)
│       ├── setUniform("image", graphics)  ← Graphics avec Conway inside
│       ├── p.rect()  ← ⚠️ ERREUR ICI: "no valid shader program"
│       └── p.resetShader()
│
└── else: fallback sans shader
```

## 🐛 HYPOTHÈSES SUR LA CAUSE

### Hypothèse 1: État WebGL corrompu
```
Conway shader sur texture WebGL
→ Laisse un état WebGL invalide malgré resetShader()
→ Shockwave shader ne peut pas s'initialiser correctement
→ drawElements() échoue
```

### Hypothèse 2: Conflit de contexte
```
currentTexture (WebGL) avec Conway shader
→ Copié sur graphics (2D)
→ graphics passé à Shockwave shader (WebGL)
→ Mélange de contextes 2D/WebGL cause le problème
```

### Hypothèse 3: Timing de resetShader()
```
currentTexture.resetShader() appelé
→ Mais p5.js global garde un état de shader actif
→ Quand Shockwave fait p.shader(), conflit d'état
```

## 🔧 ZONES À INVESTIGUER

1. **ShaderLand.updateConwayWithShader()**
   - Vérifier si `currentTexture.resetShader()` nettoie vraiment tout
   - Tester sans shader Conway (rendu normal)

2. **Shockwave.endRender()**
   - Ajouter plus de `p.resetShader()` avant `p.shader()`
   - Vérifier l'état WebGL avant d'appliquer Shockwave

3. **Graphics buffer**
   - Le graphics de Shockwave est 2D, pas WebGL
   - Vérifier si `graphics.image(webglTexture)` cause des problèmes

## 🧪 TESTS SUGGÉRÉS POUR ISOLER LE PROBLÈME

### Test 1: Isolation Conway
```javascript
// Dans Brain.draw(), commenter temporairement :
// shockwave.endRender()  ← Désactiver Shockwave
// Résultat attendu: Conway fonctionne sans erreur
```

### Test 2: Isolation Shockwave
```javascript
// Dans ShaderLand.renderToGraphics(), commenter :
// this.updateConwayWithShader()  ← Désactiver Conway
// Résultat attendu: Shockwave fonctionne sans erreur
```

### Test 3: Décalage temporel
```javascript
// Décaler Conway sur frames paires, Shockwave sur impaires
if (this.p.frameCount % 2 === 0) {
  this.updateConwayWithShader();
} else {
  // Pas de Conway cette frame
}
```

### Test 4: État WebGL logging
```javascript
// Avant et après chaque shader, logger :
console.log('WebGL errors:', p._renderer.GL.getError());
console.log('Current program:', p._renderer.GL.getParameter(p._renderer.GL.CURRENT_PROGRAM));
```

## 📝 NOTES IMPORTANTES

- Le clignotement turquoise suggère qu'un shader s'applique partiellement
- L'erreur "no valid shader program" indique un problème de compilation/linkage shader
- Le problème apparaît seulement quand Conway ET Shockwave sont actifs ensemble