// Point d'entrée du serveur Express
const express = require('express');
const path = require('path');
const mainRoutes = require('./routes/main');
const logger = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 3001;
const isDevelopment = process.env.NODE_ENV !== 'production';

if (isDevelopment) {
  app.use(logger);
}

app.use('/assets', express.static(path.join(__dirname, '../public/assets'), {
  maxAge: isDevelopment ? 0 : '1d'
}));

// Servir les modules src/ pour les imports ES6
app.use('/src', express.static(path.join(__dirname, '../src'), {
  maxAge: isDevelopment ? 0 : '1d'
}));

app.use('/', mainRoutes);

app.get('*', (req, res) => {
  res.status(404).json({
    error: 'Page non trouvée',
    url: req.url,
    message: 'Cette page n\'existe pas encore.',
    redirect: '/'
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur Express démarré sur http://localhost:${PORT}`);
});
