import { describe, expect, test } from '@jest/globals';
import { citySchema, step1Schema, step2Schema, configSchema } from '../../../src/lib/validations/config';

describe('Configuration Validation Schemas', () => {
  describe('citySchema', () => {
    test('validates correct city data', () => {
      const validCity = { name: 'New York', radius_miles: 25, weight: 50 };
      expect(citySchema.safeParse(validCity).success).toBe(true);
    });

    test('rejects invalid radius (< 5)', () => {
      const invalidCity = { name: 'New York', radius_miles: 4, weight: 50 };
      expect(citySchema.safeParse(invalidCity).success).toBe(false);
    });

    test('rejects invalid weight (< 0 or > 100)', () => {
      expect(citySchema.safeParse({ name: 'NY', radius_miles: 10, weight: -1 }).success).toBe(false);
      expect(citySchema.safeParse({ name: 'NY', radius_miles: 10, weight: 101 }).success).toBe(false);
    });
  });

  describe('step1Schema', () => {
    test('requires at least one city', () => {
      expect(step1Schema.safeParse({ cities: [] }).success).toBe(false);
      expect(step1Schema.safeParse({ cities: [{ name: 'NY', radius_miles: 10, weight: 100 }] }).success).toBe(true);
    });
  });

  describe('step2Schema', () => {
    test('requires at least one category', () => {
      expect(step2Schema.safeParse({ categories: [] }).success).toBe(false);
      expect(step2Schema.safeParse({ categories: ['Engineer'] }).success).toBe(true);
    });
  });
  
  describe('configSchema', () => {
    test('validates complete config', () => {
        const validConfig = {
            cities: [{ name: 'San Francisco', radius_miles: 25, weight: 100 }],
            categories: ['Software Engineer'],
            include_keywords: ['React'],
            exclude_keywords: ['Java'],
            salary_usd: { min: 100000, max: 200000 },
            posted_within_hours: 24
        };
        expect(configSchema.safeParse(validConfig).success).toBe(true);
    });
  });
});
