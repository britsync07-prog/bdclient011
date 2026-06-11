const jwt = require('jsonwebtoken');
const { signToken, verifyToken } = require('../../../src/utils/jwt');
const config = require('../../../src/config');

jest.mock('../../../src/config', () => ({
  jwtSecret: 'test-secret',
}));

describe('JWT Utility', () => {
  const userId = 'user-123';

  describe('signToken', () => {
    it('should return a valid JWT string', () => {
      const token = signToken(userId);
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('should contain the correct user id in the payload', () => {
      const token = signToken(userId);
      const decoded = jwt.verify(token, config.jwtSecret);
      expect(decoded.id).toBe(userId);
    });

    it('should have an expiration of roughly 30 days', () => {
      const token = signToken(userId);
      const decoded = jwt.decode(token);
      // 30 days in seconds = 30 * 24 * 60 * 60 = 2592000
      // Allow for a small difference due to timing
      const duration = decoded.exp - decoded.iat;
      expect(duration).toBeGreaterThanOrEqual(2591999);
      expect(duration).toBeLessThanOrEqual(2592001);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return the payload', () => {
      const token = jwt.sign({ id: userId }, config.jwtSecret);
      const decoded = verifyToken(token);
      expect(decoded.id).toBe(userId);
    });

    it('should throw an error for an invalid token', () => {
      const invalidToken = 'invalid.token.here';
      expect(() => verifyToken(invalidToken)).toThrow();
    });

    it('should throw an error for a token signed with a different secret', () => {
      const token = jwt.sign({ id: userId }, 'wrong-secret');
      expect(() => verifyToken(token)).toThrow();
    });

    it('should throw an error for an expired token', () => {
      const token = jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: '0s' });
      // Wait a tiny bit to ensure it expires if needed, but 0s should be enough
      expect(() => verifyToken(token)).toThrow();
    });
  });
});
