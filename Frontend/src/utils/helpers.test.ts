import { describe, it, expect } from 'vitest';
import {
  matchesSearchTerm,
  normalizeSearchTerm,
  getCategoryIcon,
  getCategoryColor,
  getCategoryLabel,
  formatRating,
  createPlayMessage,
  createFavoriteMessage,
  createAriaLabel,
  formatMessage
} from './helpers';

describe('helpers.ts', () => {
  describe('normalizeSearchTerm', () => {
    it('should lowercase and trim the term', () => {
      expect(normalizeSearchTerm('  Test  ')).toBe('test');
      expect(normalizeSearchTerm('UPPERCASE')).toBe('uppercase');
    });

    it('should handle null, undefined, and empty string', () => {
      expect(normalizeSearchTerm(null)).toBe('');
      expect(normalizeSearchTerm(undefined)).toBe('');
      expect(normalizeSearchTerm('')).toBe('');
    });
  });

  describe('matchesSearchTerm', () => {
    it('should return true if searchTerm is empty or only whitespace', () => {
      expect(matchesSearchTerm('', 'Game Name', 'Provider')).toBe(true);
      expect(matchesSearchTerm('   ', 'Game Name', 'Provider')).toBe(true);
      expect(matchesSearchTerm(null, 'Game Name', 'Provider')).toBe(true);
      expect(matchesSearchTerm(undefined, 'Game Name', 'Provider')).toBe(true);
    });

    it('should return true if name contains searchTerm (case insensitive)', () => {
      expect(matchesSearchTerm('star', 'Starburst', 'NetEnt')).toBe(true);
      expect(matchesSearchTerm('STAR', 'starburst', 'NetEnt')).toBe(true);
    });

    it('should return true if provider contains searchTerm (case insensitive)', () => {
      expect(matchesSearchTerm('ent', 'Starburst', 'NetEnt')).toBe(true);
      expect(matchesSearchTerm('NET', 'Starburst', 'netent')).toBe(true);
    });

    it('should return false if neither name nor provider contains searchTerm', () => {
      expect(matchesSearchTerm('book', 'Starburst', 'NetEnt')).toBe(false);
    });

    it('should handle missing name or provider', () => {
      expect(matchesSearchTerm('star', 'Starburst', null)).toBe(true);
      expect(matchesSearchTerm('net', null, 'NetEnt')).toBe(true);
      expect(matchesSearchTerm('star', null, null)).toBe(false);
    });

    it('should handle special characters in search term', () => {
        expect(matchesSearchTerm('$', 'Money $hot', 'Provider')).toBe(true);
        expect(matchesSearchTerm('!', 'Game!', 'Provider')).toBe(true);
    });
  });

  describe('Category Helpers', () => {
    it('getCategoryIcon returns correct icon or default', () => {
      expect(getCategoryIcon('slots')).toBe('🎰');
      expect(getCategoryIcon('unknown')).toBe('🎮');
    });

    it('getCategoryColor returns correct color or default', () => {
      expect(getCategoryColor('table')).toContain('bg-emerald-500/20');
      expect(getCategoryColor('unknown')).toContain('bg-gray-500/20');
    });

    it('getCategoryLabel returns correct label or Unknown', () => {
      expect(getCategoryLabel('live')).toBe('Live Games');
      // @ts-expect-error - testing invalid category
      expect(getCategoryLabel('invalid')).toBe('Unknown');
    });
  });

  describe('formatRating', () => {
    it('should format rating to 1 decimal place', () => {
      expect(formatRating(4)).toBe('4.0');
      expect(formatRating(4.56)).toBe('4.6');
    });
  });

  describe('Message Creation Helpers', () => {
    it('createPlayMessage should replace {gameName}', () => {
      expect(createPlayMessage('Gonzo')).toContain('Gonzo');
    });

    it('createFavoriteMessage should handle added/removed', () => {
      expect(createFavoriteMessage('Gonzo', true)).toContain('added');
      expect(createFavoriteMessage('Gonzo', false)).toContain('removed');
    });

    it('createAriaLabel should replace {gameName} if present', () => {
      expect(createAriaLabel('Play {gameName}', 'Gonzo')).toBe('Play Gonzo');
      expect(createAriaLabel('Just text', 'Gonzo')).toBe('Just text');
    });

    it('formatMessage should replace multiple variables', () => {
      const template = 'Hello {name}, welcome to {place}!';
      const variables = { name: 'Alice', place: 'Wonderland' };
      expect(formatMessage(template, variables)).toBe('Hello Alice, welcome to Wonderland!');
    });

    it('formatMessage should return match if variable is missing', () => {
        expect(formatMessage('Hello {name}', {})).toBe('Hello {name}');
    });
  });
});
