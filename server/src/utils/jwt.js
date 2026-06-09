const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

const signToken = (id) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: '30d',
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, jwtSecret);
};

module.exports = {
  signToken,
  verifyToken,
};
