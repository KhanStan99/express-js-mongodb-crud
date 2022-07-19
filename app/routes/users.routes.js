module.exports = (app) => {
  const users = require('../controllers/app.controller.js');

  var router = require('express').Router();

  // Create
  router.post('/signup', users.signUp);

  // Login
  router.get('/login', users.login);

  // Update a user with id
  router.put('/', users.update);

  app.use('/users', router);
};
