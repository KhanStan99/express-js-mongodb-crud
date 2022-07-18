module.exports = app => {
  const users = require("../controllers/app.controller.js");

  var router = require("express").Router();

  // Create
  router.post("/", users.create);

  // Read
  router.get("/", users.findAll);

  // Retrieve a single user with id
  router.get("/:id", users.findOne);

  // Update a user with id
  router.put("/:id", users.update);

  // Delete a user with id
  router.delete("/:id", users.delete);

  // Create a new user
  router.delete("/", users.deleteAll);


  app.use("/users", router);
};
