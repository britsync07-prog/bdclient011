const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config');

const signToken = (id) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, jwtSecret);
};

module.exports = {
  signToken,
  verifyToken,
};
