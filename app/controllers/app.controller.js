const db = require('../models');
const bcrypt = require('bcrypt');
const validationUtils = require('../utils/validation-utils');
const Users = db.users;

// #region Signup

const signUp = (req, res) => {
  validationUtils
    .validateOrReject(req.body, {
      name: { type: 'string', required: true },
      password: { type: 'string', required: true },
      email: { type: 'string', required: true },
    })
    .then((bodyClean) => {
      Users.find({ email: bodyClean.email }).then((data) => {
        if (data.length > 0) {
          res.status(500).send({
            message: 'Email Address already used',
          });
        }
      });

      bcrypt.hash(bodyClean.password, 12).then((hash) => {
        bodyClean.password = hash;
        const users = new Users({
          name: bodyClean.name,
          email: bodyClean.email,
          password: bodyClean.password,
        });

        users
          .save(users)
          .then((data) => {
            res.send(data);
          })
          .catch((err) => {
            res.status(500).send({
              message: err.message || 'Some error occurred while creating.',
            });
          });
      });
    })
    .catch((err) => {
      console.log('errrr -> ', err);
      res.status(500).send({
        message: err,
      });
    });
};

// #endregion

// #region Login

const login = (req, res) => {
  const email = req.params.email;

  Users.findById(email)
    .then((data) => {
      if (!data)
        res.status(404).send({ message: 'Not found with id ' + email });
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: 'Error retrieving with id=' + email });
    });
};

// #endregion

// #region Update

const update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: 'Data to update can not be empty!',
    });
  }

  const id = req.params.id;

  Users.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update user with id=${id}. Maybe user was not found!`,
        });
      } else res.send({ message: 'user was updated successfully.' });
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Error updating user with id=' + id,
      });
    });
};

// #endregion

module.exports = {
  signUp,
  login,
  update,
};
