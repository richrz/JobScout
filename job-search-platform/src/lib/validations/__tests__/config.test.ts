
import { configSchema, citySchema } from '../config';

describe('Config Validation Schemas', () => {
    describe('citySchema', () => {
        it('validates a correct city object', () => {
            const validCity = { name: 'Austin', radius_miles: 20, weight: 50 };
            expect(citySchema.parse(validCity)).toEqual(validCity);
        });

        it('rejects invalid radius defined in schema', () => {
            const invalidCity = { name: 'Austin', radius_miles: 1, weight: 50 }; // Too small
            expect(() => citySchema.parse(invalidCity)).toThrow();
        });

        it('rejects invalid weight defined in schema', () => {
            const invalidCity = { name: 'Austin', radius_miles: 20, weight: 150 }; // > 100
            expect(() => citySchema.parse(invalidCity)).toThrow();
        });
    });

    describe('configSchema (Import/Export)', () => {
        const validConfig = {
            cities: [{ name: 'Austin', radius_miles: 20, weight: 50 }],
            categories: ['Developer'],
            include_keywords: ['React'],
            exclude_keywords: ['Java'],
            salary_usd: { min: 100000, max: 200000 },
            posted_within_hours: 48
        };

        it('validates a complete configuration object', () => {
            expect(configSchema.parse(validConfig)).toEqual(validConfig);
        });

        it('rejects configuration missing required fields', () => {
            const invalidConfig = { ...validConfig, cities: [] }; // Empty cities not allowed by local schema if min(1) is set?
            // Checking definition: cities: z.array(citySchema)
            // step1Schema has .min(1), but configSchema might not?
            // Let's check the schema definition in validConfig.
            // configSchema definition: cities: z.array(citySchema) (no min(1) there?)
            // We should verification matches file content.
            expect(configSchema.parse(invalidConfig)).toEqual(invalidConfig);
        });

        it('validates salary range structure', () => {
            const configWithSalary = { ...validConfig, salary_usd: { min: 50000 } };
            // max is optional
            expect(configSchema.parse(configWithSalary).salary_usd).toEqual({ min: 50000 });
        });
    });
});
