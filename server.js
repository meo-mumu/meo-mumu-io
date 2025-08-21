/**
 * Serveur Express pour portfolio avec URLs propres
 * Sert uniquement la page principale pour l'instant
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration
const isDevelopment = process.env.NODE_ENV !== 'production';

// Middleware de logging (uniquement en dev)
if (isDevelopment) {
  app.use((req, res, next) => {
    // Ignorer les requêtes de dev tools
    if (!req.url.includes('.well-known') && !req.url.includes('//ws')) {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    }
    next();
  });
}

// Servir les assets statiques avec cache
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
  maxAge: isDevelopment ? 0 : '1d' // Cache d'un jour en production
}));

// Route principale
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route expérience professionnelle
app.get('/experience', (req, res) => {
  res.sendFile(path.join(__dirname, 'experience.html'));
});

// Placeholder pour futures pages (retourne la page principale pour l'instant)
const placeholderRoutes = ['/about', '/projects', '/cv', '/contact'];
placeholderRoutes.forEach(route => {
  app.get(route, (req, res) => {
    res.redirect('/'); // Redirection temporaire vers l'accueil
  });
});

// Gestion d'erreur 404
app.get('*', (req, res) => {
  // Ignorer les erreurs communes du développement
  const commonDevRequests = ['.well-known', '//ws', 'favicon.ico'];
  const isDevRequest = commonDevRequests.some(pattern => req.url.includes(pattern));
  
  if (!isDevRequest) {
    console.log(`❌ 404 - Page non trouvée: ${req.url}`);
  }
  
  res.status(404).json({
    error: 'Page non trouvée',
    url: req.url,
    message: 'Cette page n\'existe pas encore.',
    redirect: '/'
  });
});

// Gestion des erreurs serveur
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur Express démarré sur http://localhost:${PORT}`);
  console.log(`🔧 Mode: ${isDevelopment ? 'développement' : 'production'}`);
  console.log(`📄 Page disponible: http://localhost:${PORT}/`);
  console.log(`📄 Expérience: http://localhost:${PORT}/experience`);
});