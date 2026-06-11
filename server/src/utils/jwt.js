const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

const signToken = (id, username, role) => {
  return jwt.sign({ id, username, role }, jwtSecret, {
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
