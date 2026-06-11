import { describe, it, expect } from 'vitest';
import {
  getCategoryLabel,
  getCategoryIcon,
  getCategoryColor,
  formatRating,
  normalizeSearchTerm,
  matchesSearchTerm,
  createPlayMessage,
  createFavoriteMessage,
  createAriaLabel,
  formatMessage
} from './helpers';
import { Category } from '@/types/game';

describe('helpers.ts', () => {
  describe('getCategoryLabel', () => {
    it('should return correct label for valid categories', () => {
      const categories: Category[] = ['slots', 'table', 'live', 'all', 'fishing', 'crash'];
      const expected = ['Slots', 'Table Games', 'Live Games', 'All Games', 'Fishing', 'Crash Games'];

      categories.forEach((cat, i) => {
        expect(getCategoryLabel(cat)).toBe(expected[i]);
      });
    });

    it('should return "Unknown" for invalid categories', () => {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      expect(getCategoryLabel('non-existent' as any)).toBe('Unknown');
      expect(getCategoryLabel(null as any)).toBe('Unknown');
      expect(getCategoryLabel(undefined as any)).toBe('Unknown');
      /* eslint-enable @typescript-eslint/no-explicit-any */
    });
  });

  describe('getCategoryIcon', () => {
    it('should return correct icon for valid categories', () => {
      expect(getCategoryIcon('slots')).toBe('🎰');
      expect(getCategoryIcon('table')).toBe('🃏');
    });

    it('should return default icon for invalid categories', () => {
      expect(getCategoryIcon('non-existent')).toBe('🎮');
    });
  });

  describe('getCategoryColor', () => {
    it('should return correct color classes for valid categories', () => {
      expect(getCategoryColor('slots')).toContain('bg-indigo-500/20');
      expect(getCategoryColor('live')).toContain('bg-red-500/20');
    });

    it('should return default color classes for invalid categories', () => {
      expect(getCategoryColor('non-existent')).toContain('bg-gray-500/20');
    });
  });

  describe('formatRating', () => {
    it('should format rating to one decimal place', () => {
      expect(formatRating(4)).toBe('4.0');
      expect(formatRating(4.56)).toBe('4.6');
      expect(formatRating(0)).toBe('0.0');
    });
  });

  describe('normalizeSearchTerm', () => {
    it('should lowercase and trim the term', () => {
      expect(normalizeSearchTerm('  SEARCH  ')).toBe('search');
      expect(normalizeSearchTerm('Mixed Case')).toBe('mixed case');
    });
  });

  describe('matchesSearchTerm', () => {
    it('should return true if name matches', () => {
      expect(matchesSearchTerm('star', 'Starburst', 'NetEnt')).toBe(true);
    });

    it('should return true if provider matches', () => {
      expect(matchesSearchTerm('net', 'Starburst', 'NetEnt')).toBe(true);
    });

    it('should return false if neither matches', () => {
      expect(matchesSearchTerm('gonzo', 'Starburst', 'NetEnt')).toBe(false);
    });

    it('should return true if searchTerm is empty', () => {
      expect(matchesSearchTerm('', 'Starburst', 'NetEnt')).toBe(true);
    });
  });

  describe('createPlayMessage', () => {
    it('should replace {gameName} in play success message', () => {
      const message = createPlayMessage('Starburst');
      expect(message).toContain('Starburst');
    });
  });

  describe('createFavoriteMessage', () => {
    it('should return correct message when added', () => {
      const message = createFavoriteMessage('Starburst', true);
      expect(message).toContain('Starburst');
      expect(message.toLowerCase()).toContain('added');
    });

    it('should return correct message when removed', () => {
      const message = createFavoriteMessage('Starburst', false);
      expect(message).toContain('Starburst');
      expect(message.toLowerCase()).toContain('removed');
    });
  });

  describe('createAriaLabel', () => {
    it('should replace {gameName} in template', () => {
      expect(createAriaLabel('Play {gameName}', 'Starburst')).toBe('Play Starburst');
    });

    it('should return template as is if gameName not provided or not in template', () => {
      expect(createAriaLabel('Close')).toBe('Close');
      expect(createAriaLabel('Close', 'Starburst')).toBe('Close');
    });
  });

  describe('formatMessage', () => {
    it('should replace variables in template', () => {
      const template = 'Hello {name}, welcome to {place}!';
      const variables = { name: 'John', place: 'Casino' };
      expect(formatMessage(template, variables)).toBe('Hello John, welcome to Casino!');
    });

    it('should return original placeholder if variable missing', () => {
      const template = 'Hello {name}';
      expect(formatMessage(template, {})).toBe('Hello {name}');
    });
  });
});
