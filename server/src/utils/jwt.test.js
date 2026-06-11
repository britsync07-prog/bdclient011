// Set environment variable BEFORE requiring modules that use it
process.env.JWT_SECRET = 'test-secret';

const jwt = require('jsonwebtoken');
const { signToken, verifyToken } = require('./jwt');
const config = require('../config');

describe('JWT Utility', () => {
  const userId = 'user123';
  let token;

  beforeAll(() => {
    token = signToken(userId);
  });

  describe('verifyToken', () => {
    test('should verify a valid token and return payload', () => {
      const decoded = verifyToken(token);
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(userId);
    });

    test('should throw JsonWebTokenError for an invalid token', () => {
      const invalidToken = 'invalid.token.here';
      expect(() => {
        verifyToken(invalidToken);
      }).toThrow(jwt.JsonWebTokenError);
    });

    test('should throw TokenExpiredError for an expired token', () => {
      // Create an already expired token
      const expiredToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '-1s',
      });

      expect(() => {
        verifyToken(expiredToken);
      }).toThrow(jwt.TokenExpiredError);
    });

    test('should throw error for null or undefined token', () => {
      // jsonwebtoken.verify throws if token is not a string
      expect(() => {
        verifyToken(null);
      }).toThrow();
      expect(() => {
        verifyToken(undefined);
      }).toThrow();
    });

    test('should throw JsonWebTokenError for a malformed token structure', () => {
      const malformedToken = 'not-even-a-jwt';
      expect(() => {
        verifyToken(malformedToken);
      }).toThrow(jwt.JsonWebTokenError);
    });
  });

  describe('signToken', () => {
    test('should sign a token with the provided user id', () => {
      const newToken = signToken('anotherUser');
      const decoded = jwt.verify(newToken, process.env.JWT_SECRET);
      expect(decoded.id).toBe('anotherUser');
    });
  });
});
