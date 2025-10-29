/**
 * Tests for config.js
 * Simple tests to verify configuration structure
 */

const config = require('../src/services/config');

describe('Config', () => {
  test('should have genreTagMapping defined', () => {
    expect(config.genreTagMapping).toBeDefined();
    expect(typeof config.genreTagMapping).toBe('object');
  });

  test('should have valid genre mappings', () => {
    // Test a few known genre IDs
    expect(config.genreTagMapping[28]).toBe('Action');
    expect(config.genreTagMapping[35]).toBe('Comedy');
    expect(config.genreTagMapping[18]).toBe('Drama');
  });

  test('should have ratingEmojis array', () => {
    expect(config.ratingEmojis).toBeDefined();
    expect(Array.isArray(config.ratingEmojis)).toBe(true);
    expect(config.ratingEmojis).toHaveLength(5);
  });

  test('should have trackingEmojis defined', () => {
    expect(config.trackingEmojis).toBeDefined();
    expect(config.trackingEmojis.watched).toBe('✅');
    expect(config.trackingEmojis.wantToWatch).toBe('📌');
  });

  test('should have watchParty settings defined', () => {
    expect(config.watchParty).toBeDefined();
    expect(typeof config.watchParty.threshold).toBe('number');
    expect(config.watchParty.placeholderEventHours).toBe(168); // 7 days
    expect(config.watchParty.eventDurationHours).toBe(3);
    expect(config.watchParty.dynamicCount).toBe(true);
    expect(config.watchParty.preventDuplicates).toBe(true);
  });
});
