/**
 * Unit Tests - Fixture Validation Utility
 *
 * @trace epic: EPIC-16
 * @trace story: STORY-16.01
 * @trace reqs: AC9
 *
 * Why: Tests the security validation, sanitization, and fixture loading
 * functionality for the dynamic preview page. Validates path traversal
 * protection, config name validation, and error handling.
 *
 * Coverage Targets:
 * - AC9: Config name validation with regex
 * - Security: Path traversal protection
 * - Error handling: Invalid inputs
 */

import {
  CONFIG_NAME_REGEX,
  MAX_CONFIG_NAME_LENGTH,
  MIN_CONFIG_NAME_LENGTH,
  sanitizeConfigName,
  sanitizeConfigNameWithDetails,
  getAvailableFixtures,
  fixtureExists,
  loadFixture,
  isValidFixtureName,
  getFixtureSuggestions,
} from '@/lib/validation/fixtureValidation';

// Mock fs module
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  readdirSync: jest.fn(),
}));

const mockFs = require('fs');

describe('CONFIG_NAME_REGEX', () => {
  describe('AC9: Valid config names', () => {
    it('should accept alphanumeric with hyphens and underscores', () => {
      expect(CONFIG_NAME_REGEX.test('luxury-boutique')).toBe(true);
      expect(CONFIG_NAME_REGEX.test('budget_hostel')).toBe(true);
      expect(CONFIG_NAME_REGEX.test('hotel123')).toBe(true);
      expect(CONFIG_NAME_REGEX.test('Business-Hotel_2026')).toBe(true);
      expect(CONFIG_NAME_REGEX.test('a-b-c_d-e-f')).toBe(true);
    });

    it('should accept single character names', () => {
      expect(CONFIG_NAME_REGEX.test('a')).toBe(true);
      expect(CONFIG_NAME_REGEX.test('Z')).toBe(true);
      expect(CONFIG_NAME_REGEX.test('1')).toBe(true);
      expect(CONFIG_NAME_REGEX.test('-')).toBe(true);
      expect(CONFIG_NAME_REGEX.test('_')).toBe(true);
    });

    it('should accept names starting with special chars', () => {
      expect(CONFIG_NAME_REGEX.test('-config')).toBe(true);
      expect(CONFIG_NAME_REGEX.test('_config')).toBe(true);
      expect(CONFIG_NAME_REGEX.test('9hotel')).toBe(true);
    });
  });

  describe('AC9: Path traversal attempts', () => {
    it('should reject path traversal with dots', () => {
      expect(CONFIG_NAME_REGEX.test('../etc/passwd')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('./config')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('...')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config.json')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('../../../malicious')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config/../../../etc/passwd')).toBe(false);
    });

    it('should reject Windows-style path traversal', () => {
      expect(CONFIG_NAME_REGEX.test('..\\..\\windows')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('.\\config')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('C:\\Windows\\System32')).toBe(false);
    });
  });

  describe('AC9: Special characters and injection attempts', () => {
    it('should reject special characters', () => {
      expect(CONFIG_NAME_REGEX.test('config@file')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config#file')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config$file')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config%file')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config&file')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config*file')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config!file')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config~file')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config`file')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config\'file')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config"file')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config+file')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config=file')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config[file]')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config{file}')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config(file)')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config|file')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config\\file')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config:file')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config;file')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config\'file')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config"file')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config<file')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config>file')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config,file')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config?file')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config/file')).toBe(false);
    });

    it('should reject whitespace', () => {
      expect(CONFIG_NAME_REGEX.test('config file')).toBe(false);
      expect(CONFIG_NAME_REGEX.test(' config')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config ')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config\tfile')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config\nfile')).toBe(false);
    });

    it('should reject null byte attempts', () => {
      expect(CONFIG_NAME_REGEX.test('config\x00.json')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('config\x00')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('\x00config')).toBe(false);
    });

    it('should reject Unicode characters', () => {
      expect(CONFIG_NAME_REGEX.test('café')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('hôtel')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('hotelñ')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('ホテル')).toBe(false);
      expect(CONFIG_NAME_REGEX.test('酒店')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should reject empty string', () => {
      expect(CONFIG_NAME_REGEX.test('')).toBe(false);
    });

    it('should accept repeated special chars', () => {
      expect(CONFIG_NAME_REGEX.test('a--b')).toBe(true);
      expect(CONFIG_NAME_REGEX.test('a__b')).toBe(true);
      expect(CONFIG_NAME_REGEX.test('a-_-b')).toBe(true);
      expect(CONFIG_NAME_REGEX.test('---')).toBe(true);
      expect(CONFIG_NAME_REGEX.test('___')).toBe(true);
    });

    it('should accept long valid names', () => {
      const longName = 'a'.repeat(100);
      expect(CONFIG_NAME_REGEX.test(longName)).toBe(true);
    });
  });
});

describe('sanitizeConfigName()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AC9: Valid inputs', () => {
    it('should return lowercase sanitizedName for valid input', () => {
      expect(sanitizeConfigName('luxury-boutique')).toBe('luxury-boutique');
      expect(sanitizeConfigName('Luxury-Boutique')).toBe('luxury-boutique');
      expect(sanitizeConfigName('LUXURY-BOUTIQUE')).toBe('luxury-boutique');
    });

    it('should trim whitespace', () => {
      expect(sanitizeConfigName('  luxury-boutique  ')).toBe('luxury-boutique');
      expect(sanitizeConfigName('\tluxury-boutique\n')).toBe('luxury-boutique');
    });
  });

  describe('AC9: Invalid inputs - security rejections', () => {
    it('should return null for path traversal attempts', () => {
      expect(sanitizeConfigName('../etc/passwd')).toBeNull();
      expect(sanitizeConfigName('./config')).toBeNull();
      expect(sanitizeConfigName('config.json')).toBeNull();
      expect(sanitizeConfigName('../../../malicious')).toBeNull();
    });

    it('should return null for special characters', () => {
      expect(sanitizeConfigName('config@file')).toBeNull();
      expect(sanitizeConfigName('config#file')).toBeNull();
      expect(sanitizeConfigName('config file')).toBeNull();
    });

    it('should return null for null byte attempts', () => {
      expect(sanitizeConfigName('config\x00.json')).toBeNull();
    });
  });

  describe('Type validation', () => {
    it('should return null for non-string input', () => {
      expect(sanitizeConfigName(null)).toBeNull();
      expect(sanitizeConfigName(undefined)).toBeNull();
      expect(sanitizeConfigName(123)).toBeNull();
      expect(sanitizeConfigName({})).toBeNull();
      expect(sanitizeConfigName([])).toBeNull();
      expect(sanitizeConfigName(true)).toBeNull();
    });
  });

  describe('Length validation', () => {
    it('should return null for empty string', () => {
      expect(sanitizeConfigName('')).toBeNull();
    });

    it('should return null for whitespace-only string', () => {
      expect(sanitizeConfigName('   ')).toBeNull();
      expect(sanitizeConfigName('\t\n')).toBeNull();
    });

    it('should return null for string exceeding max length', () => {
      const tooLong = 'a'.repeat(101);
      expect(sanitizeConfigName(tooLong)).toBeNull();
    });

    it('should accept string at max length boundary', () => {
      const maxLength = 'a'.repeat(100);
      expect(sanitizeConfigName(maxLength)).toBe(maxLength.toLowerCase());
    });
  });

  describe('Logging', () => {
    it('should log security rejection for path traversal', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      sanitizeConfigName('../etc/passwd');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Security] Config name validation failed: contains invalid characters',
        expect.objectContaining({
          input: expect.any(String),
          reason: expect.stringContaining('characters outside the allowed set'),
        })
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log successful sanitization', () => {
      const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();

      sanitizeConfigName('Luxury-Boutique');

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[Security] Config name sanitized successfully',
        expect.objectContaining({
          original: 'Luxury-Boutique',
          sanitized: 'luxury-boutique',
        })
      );

      consoleInfoSpy.mockRestore();
    });
  });
});

describe('sanitizeConfigNameWithDetails()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success cases', () => {
    it('should return success result for valid input', () => {
      const result = sanitizeConfigNameWithDetails('luxury-boutique');

      expect(result).toEqual({
        success: true,
        sanitizedName: 'luxury-boutique',
        original: 'luxury-boutique',
      });
    });

    it('should convert to lowercase', () => {
      const result = sanitizeConfigNameWithDetails('Luxury-Boutique');

      expect(result).toEqual({
        success: true,
        sanitizedName: 'luxury-boutique',
        original: 'Luxury-Boutique',
      });
    });
  });

  describe('Failure cases with detailed reasons', () => {
    it('should return failure with type error for non-string', () => {
      const result = sanitizeConfigNameWithDetails(123);

      expect(result).toEqual({
        success: false,
        reason: 'Config name must be a string',
        original: '123',
      });
    });

    it('should return failure with empty error for empty string', () => {
      const result = sanitizeConfigNameWithDetails('');

      expect(result).toEqual({
        success: false,
        reason: 'Config name cannot be empty',
        original: '',
      });
    });

    it('should return failure with length error for too long', () => {
      const tooLong = 'a'.repeat(101);
      const result = sanitizeConfigNameWithDetails(tooLong);

      expect(result).toEqual({
        success: false,
        reason: 'Config name must be 100 characters or less',
        original: tooLong,
      });
    });

    it('should return failure with character error for invalid chars', () => {
      const result = sanitizeConfigNameWithDetails('config.json');

      expect(result).toEqual({
        success: false,
        reason: 'Config name can only contain letters, numbers, hyphens, and underscores',
        original: 'config.json',
      });
    });
  });
});

describe('getAvailableFixtures()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty array when directory read fails', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockFs.readdirSync.mockImplementation(() => {
      throw new Error('Directory not found');
    });

    const fixtures = getAvailableFixtures();

    expect(fixtures).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[Fixture Discovery] Failed to read fixtures directory',
      expect.objectContaining({
        directory: expect.any(String),
        error: expect.any(String),
      })
    );

    consoleErrorSpy.mockRestore();
  });

  it('should return filtered list of fixture names', () => {
    mockFs.readdirSync.mockReturnValue([
      'luxury-boutique.json',
      'budget-hostel.json',
      'business-hotel.json',
      'README.md', // Not JSON
      '.hidden.json', // Invalid name (starts with dot)
      'config.invalid.json', // Invalid name (multiple dots)
    ]);

    const fixtures = getAvailableFixtures();

    expect(fixtures).toEqual([
      'budget-hostel',
      'business-hotel',
      'luxury-boutique',
    ]); // Sorted alphabetically
  });

  it('should return empty array when no valid fixtures exist', () => {
    mockFs.readdirSync.mockReturnValue([
      'README.md',
      '.gitkeep',
    ]);

    const fixtures = getAvailableFixtures();

    expect(fixtures).toEqual([]);
  });
});

describe('fixtureExists()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true when fixture file exists and is readable', () => {
    mockFs.readFileSync.mockReturnValue('{"test": "data"}');

    expect(fixtureExists('luxury-boutique')).toBe(true);
    expect(mockFs.readFileSync).toHaveBeenCalledWith(
      expect.stringContaining('luxury-boutique.json'),
      { encoding: 'utf-8' }
    );
  });

  it('should return false when file does not exist', () => {
    mockFs.readFileSync.mockImplementation(() => {
      throw new Error('File not found');
    });

    expect(fixtureExists('nonexistent')).toBe(false);
  });

  it('should return false when file exists but is not readable', () => {
    mockFs.readFileSync.mockImplementation(() => {
      throw new Error('Permission denied');
    });

    expect(fixtureExists('restricted')).toBe(false);
  });
});

describe('loadFixture()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AC1: Load valid fixture', () => {
    it('should load and parse valid JSON fixture', () => {
      const mockConfig = {
        generationId: 'test-v1',
        components: [],
      };
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

      const result = loadFixture('test-fixture');

      expect(result).toEqual(mockConfig);
    });

    it('should return null for invalid config name', () => {
      const result = loadFixture('../etc/passwd');

      expect(result).toBeNull();
      expect(mockFs.readFileSync).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should return null when fixture does not exist', () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const result = loadFixture('nonexistent');

      expect(result).toBeNull();
    });

    it('should return null when fixture contains invalid JSON', () => {
      mockFs.readFileSync.mockReturnValue('invalid json{');

      const result = loadFixture('malformed');

      expect(result).toBeNull();
    });
  });
});

describe('isValidFixtureName()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true for valid existing fixture', () => {
    mockFs.readFileSync.mockReturnValue('{"test": "data"}');

    expect(isValidFixtureName('luxury-boutique')).toBe(true);
  });

  it('should return false for invalid name', () => {
    expect(isValidFixtureName('../etc/passwd')).toBe(false);
  });

  it('should return false for valid name but non-existent file', () => {
    mockFs.readFileSync.mockImplementation(() => {
      throw new Error('File not found');
    });

    expect(isValidFixtureName('nonexistent')).toBe(false);
  });
});

describe('getFixtureSuggestions()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFs.readdirSync.mockReturnValue([
      'luxury-boutique.json',
      'budget-hostel.json',
      'business-hotel.json',
    ]);
  });

  describe('AC4: Typo suggestions', () => {
    it('should suggest similar fixtures for typos', () => {
      const suggestions = getFixtureSuggestions('luxry-boutique');

      expect(suggestions).toContain('luxury-boutique');
    });

    it('should suggest similar fixtures for missing hyphen', () => {
      const suggestions = getFixtureSuggestions('luxuryboutique');

      expect(suggestions).toContain('luxury-boutique');
    });

    it('should suggest similar fixtures for wrong separator', () => {
      const suggestions = getFixtureSuggestions('luxury_boutique');

      expect(suggestions).toContain('luxury-boutique');
    });

    it('should return empty array when no fixtures available', () => {
      mockFs.readdirSync.mockReturnValue([]);

      const suggestions = getFixtureSuggestions('anything');

      expect(suggestions).toEqual([]);
    });

    it('should limit suggestions to maxSuggestions', () => {
      const suggestions = getFixtureSuggestions('x', 2);

      expect(suggestions.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty input', () => {
      const suggestions = getFixtureSuggestions('');

      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should handle completely different input', () => {
      const suggestions = getFixtureSuggestions('zzzzzzzz');

      expect(Array.isArray(suggestions)).toBe(true);
    });
  });
});

describe('Constants', () => {
  describe('CONFIG_NAME_REGEX', () => {
    it('should match AC9 specification exactly', () => {
      expect(CONFIG_NAME_REGEX.toString()).toBe('/^[a-zA-Z0-9-_]+$/');
    });
  });

  describe('Length limits', () => {
    it('should have MAX_CONFIG_NAME_LENGTH set to 100', () => {
      expect(MAX_CONFIG_NAME_LENGTH).toBe(100);
    });

    it('should have MIN_CONFIG_NAME_LENGTH set to 1', () => {
      expect(MIN_CONFIG_NAME_LENGTH).toBe(1);
    });
  });
});
