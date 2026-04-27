import { resolveVariables, resolveVariablesOrThrow, hasVariables, getNestedValue } from '@/lib/content/resolvers/variable-resolver';
import { VariableContext } from '@/lib/content/resolvers/types';

describe('hasVariables', () => {
  it('should return true for template with variables', () => {
    expect(hasVariables('Welcome to {{hotelName}}')).toBe(true);
    expect(hasVariables('{{hotelName}} in {{location}}')).toBe(true);
  });

  it('should return false for template without variables', () => {
    expect(hasVariables('Static text only')).toBe(false);
    expect(hasVariables('')).toBe(false);
    expect(hasVariables('No {{ here')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(hasVariables('{{}}')).toBe(false); // Empty brackets = not a valid variable
    expect(hasVariables('{{ hotelName }}')).toBe(true); // Match with spaces
  });
});

describe('getNestedValue', () => {
  const testObject = {
    hotel: {
      name: 'Test Hotel',
      address: {
        city: 'New York',
        country: 'USA',
      },
    },
    simple: 'value',
    nullValue: null,
  };

  it('should get simple values', () => {
    expect(getNestedValue(testObject, 'simple')).toBe('value');
  });

  it('should get nested values using dot notation', () => {
    expect(getNestedValue(testObject, 'hotel.name')).toBe('Test Hotel');
    expect(getNestedValue(testObject, 'hotel.address.city')).toBe('New York');
    expect(getNestedValue(testObject, 'hotel.address.country')).toBe('USA');
  });

  it('should return undefined for missing paths', () => {
    expect(getNestedValue(testObject, 'hotel.nonexistent')).toBeUndefined();
    expect(getNestedValue(testObject, 'missing.path')).toBeUndefined();
    expect(getNestedValue(testObject, 'hotel.address.missing')).toBeUndefined();
  });

  it('should handle null values', () => {
    expect(getNestedValue(testObject, 'nullValue')).toBeNull();
    expect(getNestedValue(testObject, 'nullValue.something')).toBeUndefined();
  });

  it('should handle empty path', () => {
    expect(getNestedValue(testObject, '')).toBeUndefined();
  });
});

describe('resolveVariables', () => {
  const createMockContext = (overrides?: Partial<VariableContext>): VariableContext => ({
    hotelParameters: {
      name: 'The Sterling Executive',
      id: 'hotel-123',
      location: 'New York',
      description: 'Luxury hotel',
      currency: 'USD',
      address: {
        city: 'New York',
        country: 'USA',
        street: '123 Main St',
        postalCode: '10001',
      },
      contact: {
        phone: '+1-555-0123',
        email: 'info@sterling.com',
      },
    },
    locale: 'en',
    custom: {},
    ...overrides,
  });

  describe('simple variable resolution', () => {
    it('should resolve simple variable', () => {
      const context = createMockContext();
      const result = resolveVariables('Welcome to {{name}}', context);
      expect(result).toBe('Welcome to The Sterling Executive');
    });

    it('should resolve multiple variables', () => {
      const context = createMockContext();
      const result = resolveVariables('{{name}} in {{location}}', context);
      expect(result).toBe('The Sterling Executive in New York');
    });

    it('should return template unchanged when no variables', () => {
      const context = createMockContext();
      const result = resolveVariables('Static text only', context);
      expect(result).toBe('Static text only');
    });

    it('should handle whitespace in variable names', () => {
      const context = createMockContext();
      const result = resolveVariables('Welcome to {{ name }}', context);
      expect(result).toBe('Welcome to The Sterling Executive');
    });

    it('should resolve the same variable multiple times', () => {
      const context = createMockContext();
      const result = resolveVariables('{{name}} - {{name}}', context);
      expect(result).toBe('The Sterling Executive - The Sterling Executive');
    });
  });

  describe('nested path resolution', () => {
    it('should resolve nested paths', () => {
      const context = createMockContext();
      const result = resolveVariables('{{address.city}}, {{address.country}}', context);
      expect(result).toBe('New York, USA');
    });

    it('should resolve deeply nested paths', () => {
      const context = createMockContext();
      const result = resolveVariables('{{address.postalCode}}', context);
      expect(result).toBe('10001');
    });
  });

  describe('computed variables', () => {
    it('should resolve locale variable', () => {
      const context = createMockContext({ locale: 'es' });
      const result = resolveVariables('Locale: {{locale}}', context);
      expect(result).toBe('Locale: es');
    });

    it('should resolve currentYear variable', () => {
      const context = createMockContext();
      const year = new Date().getFullYear();
      const result = resolveVariables('© {{currentYear}} Hotel', context);
      expect(result).toBe(`© ${year} Hotel`);
    });

    it('should use default locale when not specified', () => {
      const context = createMockContext({ locale: undefined });
      const result = resolveVariables('Locale: {{locale}}', context);
      expect(result).toBe('Locale: en');
    });
  });

  describe('custom variables', () => {
    it('should resolve custom variables', () => {
      const context = createMockContext({
        custom: { promoCode: 'SAVE20' },
      });
      const result = resolveVariables('Use code: {{promoCode}}', context);
      expect(result).toBe('Use code: SAVE20');
    });

    it('should prioritize custom over hotelParameters', () => {
      const context = createMockContext({
        custom: { name: 'Custom Name' },
      });
      const result = resolveVariables('{{name}}', context);
      expect(result).toBe('Custom Name');
    });
  });

  describe('missing variables - default behavior', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      (process.env as any).NODE_ENV = originalEnv;
    });

    it('should show [MISSING: varName] in development', () => {
      (process.env as any).NODE_ENV = 'development';
      const context = createMockContext();
      const result = resolveVariables('Hello {{missingVar}}', context);
      expect(result).toBe('Hello [MISSING: missingVar]');
    });

    it('should return empty string in production', () => {
      (process.env as any).NODE_ENV = 'production';
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const context = createMockContext();
      const result = resolveVariables('Hello {{missingVar}}', context);
      expect(result).toBe('Hello ');
      consoleSpy.mockRestore();
    });

    it('should handle multiple missing variables', () => {
      (process.env as any).NODE_ENV = 'development';
      const context = createMockContext();
      const result = resolveVariables('{{missing1}} and {{missing2}}', context);
      expect(result).toBe('[MISSING: missing1] and [MISSING: missing2]');
    });
  });

  describe('missing variables - explicit options', () => {
    it('should return empty string with missing: "empty"', () => {
      const context = createMockContext();
      const result = resolveVariables('Hello {{missingVar}}', context, { missing: 'empty' });
      expect(result).toBe('Hello ');
    });

    it('should show [MISSING: varName] with missing: "warn"', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const context = createMockContext();
      const result = resolveVariables('Hello {{missingVar}}', context, { missing: 'warn' });
      expect(result).toBe('Hello [MISSING: missingVar]');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should throw error with missing: "throw"', () => {
      const context = createMockContext();
      expect(() => {
        resolveVariables('Hello {{missingVar}}', context, { missing: 'throw' });
      }).toThrow('Required variable "missingVar" is missing');
    });
  });

  describe('transform function', () => {
    it('should apply transform to resolved values', () => {
      const context = createMockContext();
      const result = resolveVariables('{{name}}', context, {
        transform: (value) => value.toUpperCase(),
      });
      expect(result).toBe('THE STERLING EXECUTIVE');
    });

    it('should apply transform to all variables', () => {
      const context = createMockContext();
      const result = resolveVariables('{{name}} in {{location}}', context, {
        transform: (value) => value.toUpperCase(),
      });
      expect(result).toBe('THE STERLING EXECUTIVE in NEW YORK');
    });

    it('should not transform missing variables', () => {
      const context = createMockContext();
      const result = resolveVariables('{{missingVar}}', context, {
        missing: 'empty',
        transform: (value) => value ? value.toUpperCase() : value,
      });
      expect(result).toBe('');
    });
  });

  describe('edge cases', () => {
    it('should handle empty template', () => {
      const context = createMockContext();
      const result = resolveVariables('', context);
      expect(result).toBe('');
    });

    it('should handle template with only variable', () => {
      const context = createMockContext();
      const result = resolveVariables('{{name}}', context);
      expect(result).toBe('The Sterling Executive');
    });

    it('should handle variable at start', () => {
      const context = createMockContext();
      const result = resolveVariables('{{name}} Hotel', context);
      expect(result).toBe('The Sterling Executive Hotel');
    });

    it('should handle variable at end', () => {
      const context = createMockContext();
      const result = resolveVariables('Welcome to {{name}}', context);
      expect(result).toBe('Welcome to The Sterling Executive');
    });

    it('should handle adjacent variables', () => {
      const context = createMockContext();
      const result = resolveVariables('{{name}}{{location}}', context);
      expect(result).toBe('The Sterling ExecutiveNew York');
    });
  });
});

describe('resolveVariablesOrThrow', () => {
  const createMockContext = (): VariableContext => ({
    hotelParameters: {
      name: 'Test Hotel',
      id: 'test-123',
    },
  });

  it('should resolve existing variables', () => {
    const context = createMockContext();
    const result = resolveVariablesOrThrow('Welcome to {{name}}', context);
    expect(result).toBe('Welcome to Test Hotel');
  });

  it('should throw on missing variables', () => {
    const context = createMockContext();
    expect(() => {
      resolveVariablesOrThrow('Hello {{missingVar}}', context);
    }).toThrow('Required variable "missingVar" is missing');
  });

  it('should throw on first missing variable when multiple missing', () => {
    const context = createMockContext();
    expect(() => {
      resolveVariablesOrThrow('{{missing1}} and {{missing2}}', context);
    }).toThrow('Required variable "missing1" is missing');
  });
});
