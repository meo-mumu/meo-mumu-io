// Middleware de logging
module.exports = function logger(req, res, next) {
  if (!req.url.includes('.well-known') && !req.url.includes('//ws')) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  }
  next();
};
