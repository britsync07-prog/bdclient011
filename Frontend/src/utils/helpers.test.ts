import { describe, it, expect } from 'vitest';
import {
  formatMessage,
  getCategoryIcon,
  getCategoryColor,
  getCategoryLabel,
  formatRating,
  normalizeSearchTerm,
  matchesSearchTerm,
  createPlayMessage,
  createFavoriteMessage,
  createAriaLabel
} from './helpers';

describe('formatMessage', () => {
  it('should replace a single string variable', () => {
    const template = 'Hello, {name}!';
    const variables = { name: 'Alice' };
    expect(formatMessage(template, variables)).toBe('Hello, Alice!');
  });

  it('should replace a single number variable', () => {
    const template = 'You have {count} messages.';
    const variables = { count: 5 };
    expect(formatMessage(template, variables)).toBe('You have 5 messages.');
  });

  it('should replace multiple variables', () => {
    const template = '{greeting}, {name}! You have {count} notifications.';
    const variables = {
      greeting: 'Welcome',
      name: 'Bob',
      count: 10
    };
    expect(formatMessage(template, variables)).toBe('Welcome, Bob! You have 10 notifications.');
  });

  it('should handle missing variables by keeping the placeholder', () => {
    const template = 'Hello, {name}! How is {location}?';
    const variables = { name: 'Alice' };
    expect(formatMessage(template, variables)).toBe('Hello, Alice! How is {location}?');
  });

  it('should return the original string if no placeholders are present', () => {
    const template = 'Plain text with no variables.';
    const variables = { name: 'Alice' };
    expect(formatMessage(template, variables)).toBe('Plain text with no variables.');
  });

  it('should handle empty variables object', () => {
    const template = 'Hello, {name}!';
    const variables = {};
    expect(formatMessage(template, variables)).toBe('Hello, {name}!');
  });

  it('should handle 0 as a valid number variable', () => {
    const template = 'Balance: {amount}';
    const variables = { amount: 0 };
    expect(formatMessage(template, variables)).toBe('Balance: 0');
  });

  it('should handle multiple occurrences of the same placeholder', () => {
    const template = '{name} is here. Welcome, {name}!';
    const variables = { name: 'Charlie' };
    expect(formatMessage(template, variables)).toBe('Charlie is here. Welcome, Charlie!');
  });

  it('should not replace placeholders that do not match the alphanumeric pattern', () => {
    const template = 'Example: {user-name} and {user.name}';
    const variables = { 'user-name': 'Alice', 'user.name': 'Bob' };
    expect(formatMessage(template, variables)).toBe('Example: {user-name} and {user.name}');
  });
});

describe('Category Helpers', () => {
  it('getCategoryIcon should return correct icon for valid category', () => {
    expect(getCategoryIcon('slots')).toBe('🎰');
    expect(getCategoryIcon('live')).toBe('🎥');
  });

  it('getCategoryIcon should return default icon for invalid category', () => {
    expect(getCategoryIcon('unknown')).toBe('🎮');
  });

  it('getCategoryColor should return correct color class for valid category', () => {
    expect(getCategoryColor('slots')).toContain('bg-blue-500/20');
  });

  it('getCategoryColor should return default color for invalid category', () => {
    expect(getCategoryColor('unknown')).toContain('bg-gray-500/20');
  });

  it('getCategoryLabel should return correct label', () => {
    expect(getCategoryLabel('slots')).toBe('Slots');
    expect(getCategoryLabel('table')).toBe('Table Games');
  });
});

describe('Other Helpers', () => {
  it('formatRating should format number to one decimal place', () => {
    expect(formatRating(4.567)).toBe('4.6');
    expect(formatRating(5)).toBe('5.0');
  });

  it('normalizeSearchTerm should lowercase and trim', () => {
    expect(normalizeSearchTerm('  Test String  ')).toBe('test string');
  });

  it('matchesSearchTerm should return true for empty search term', () => {
    expect(matchesSearchTerm('', 'Game Name', 'Provider')).toBe(true);
  });

  it('matchesSearchTerm should match name or provider', () => {
    expect(matchesSearchTerm('gonzo', 'Gonzo\'s Quest', 'NetEnt')).toBe(true);
    expect(matchesSearchTerm('netent', 'Gonzo\'s Quest', 'NetEnt')).toBe(true);
    expect(matchesSearchTerm('star', 'Gonzo\'s Quest', 'NetEnt')).toBe(false);
  });
});
