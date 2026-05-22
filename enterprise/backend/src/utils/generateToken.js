const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_123!';
  return jwt.sign({ id }, secret, {
    expiresIn: '30d'
  });
};

module.exports = generateToken;
