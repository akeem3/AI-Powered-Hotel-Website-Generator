import { ContactFormContract } from '../../lib/contracts/contact.contract';
import { testContractPerformance, testContractValidation } from './contract-test-utils';

describe('ContactForm Contract Validation', () => {
  const validConfig = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123-4567',
    subject: 'General',
    message: 'I would like to inquire about room availability for next month. Please let me know if you have any suites available.'
  };

  const invalidConfigs = [
    { name: 'J', email: 'test@example.com', subject: 'General', message: 'Test message' }, // Name too short
    { name: '', email: 'test@example.com', subject: 'General', message: 'Test message' }, // Empty name
    { name: 'John Doe', email: 'invalid-email', subject: 'General', message: 'Test message' }, // Invalid email
    { name: 'John Doe', email: '', subject: 'General', message: 'Test message' }, // Empty email
    { name: 'John Doe', email: 'test@example.com', subject: 'Invalid', message: 'Test message' }, // Invalid subject
    { name: 'John Doe', email: 'test@example.com', subject: 'General', message: 'Short' }, // Message too short
    { name: 'John Doe', email: 'test@example.com', subject: 'General', message: '' }, // Empty message
    { name: 'John Doe', email: 'test@example.com', subject: 'General', message: 'a'.repeat(1001) }, // Message too long
    { name: 123, email: 'test@example.com', subject: 'General', message: 'Test message' }, // Invalid name type
    { name: 'John Doe', email: 123, subject: 'General', message: 'Test message' }, // Invalid email type
    { name: 'John Doe', email: 'test@example.com', subject: 123, message: 'Test message' }, // Invalid subject type
    { name: 'John Doe', email: 'test@example.com', subject: 'General', message: 123 }, // Invalid message type
    { name: 'John Doe', email: 'test@example.com', subject: 'General', message: 'Test', phone: 123 }, // Invalid phone type
  ];

  describe('Contract Validation Tests', () => {
    it('should validate valid configuration', () => {
      testContractValidation(ContactFormContract, validConfig, invalidConfigs);
    });

    it('should validate configuration without optional phone', () => {
      const configWithoutPhone = {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        subject: 'Booking',
        message: 'I would like to book a room for next weekend.'
      };

      const result = ContactFormContract.safeParse(configWithoutPhone);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.phone).toBeUndefined();
      }
    });

    it('should validate configuration with phone', () => {
      const configWithPhone = {
        name: 'Robert Johnson',
        email: 'robert.j@example.com',
        phone: '+44-20-7946-0958',
        subject: 'Business',
        message: 'I need to arrange a business meeting room for 20 people.'
      };

      const result = ContactFormContract.safeParse(configWithPhone);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.phone).toBe('+44-20-7946-0958');
      }
    });
  });

  describe('Contract Performance Tests', () => {
    it('should validate under performance threshold', () => {
      testContractPerformance(ContactFormContract, validConfig, 5);
    });

    it('should validate complex configuration under performance threshold', () => {
      const complexConfig = {
        name: 'Alexandra Montgomery-Campbell',
        email: 'alexandra.montgomery.campbell@executive-corporation-international.com',
        phone: '+1-800-555-0123',
        subject: 'Events',
        message: 'We are planning our annual corporate gala event and would like to inquire about your event hosting capabilities, including catering options, audio-visual equipment, accommodation blocks for out-of-town attendees, and special corporate rates for a group of approximately 150 guests. The event is scheduled for December 15th, 2025, and we would need the space from 6 PM until midnight. Please provide a comprehensive proposal including all available packages and customization options.'
      };

      testContractPerformance(ContactFormContract, complexConfig, 5);
    });
  });

  describe('Name Validation Tests', () => {
    it('should accept valid names with various formats', () => {
      const validNames = [
        'John Smith',
        'Mary-Jane Johnson',
        'Dr. Robert Williams',
        'Jean-Claude Van Damme',
        ' María González',
        '张伟', // Chinese characters
        'José María', // Accented characters
        'O\'Connor', // Apostrophe
        'Smith-Jones', // Hyphen
        'Ann Marie Williams', // Three names
        'J.R.R. Tolkien', // Initials
        'John Smith II', // Suffix
        'Dr. Martin Luther King Jr.' // Complex name
      ];

      validNames.forEach((name) => {
        const config = {
          ...validConfig,
          name
        };

        const result = ContactFormContract.safeParse(config);
        expect(result.success).toBe(true);

        if (result.success) {
          expect(result.data.name).toBe(name);
        }
      });
    });

    it('should reject invalid names', () => {
      const invalidNames = [
        'J', // Too short
        '', // Empty
        '   ', // Only spaces
        '123', // Numbers only
        'John123', // Contains numbers
        '@John Smith', // Special character at start
        'John@Smith', // Special character in middle
        'John Smith!', // Special character at end
        'a'.repeat(101), // Too long
        null, // Null value
        undefined, // Undefined
        123, // Number
        [], // Array
        {} // Object
      ];

      invalidNames.forEach((name) => {
        const config = {
          ...validConfig,
          name
        };

        const result = ContactFormContract.safeParse(config);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Email Validation Tests', () => {
    it('should accept valid email formats', () => {
      const validEmails = [
        'simple@example.com',
        'very.common@example.com',
        'disposable.style.email.with+symbol@example.com',
        'other.email-with-dash@example.com',
        'fully-qualified-domain@example.com',
        'user.name+tag+sorting@example.com',
        'x@example.com',
        'john.smith@corporate-company-international.co.uk',
        'firstname.lastname@university.edu',
        'contact@restaurant-paris.fr'
      ];

      validEmails.forEach((email) => {
        const config = {
          ...validConfig,
          email
        };

        const result = ContactFormContract.safeParse(config);
        expect(result.success).toBe(true);

        if (result.success) {
          expect(result.data.email).toBe(email);
        }
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'Abc.example.com', // No @
        'A@b@c@example.com', // Multiple @
        'a"b(c)d,e:f;g<h>i[j\\k]l@example.com', // Invalid characters
        'just"not"right@example.com', // Invalid characters
        'this is"not\\allowed@example.com', // Spaces
        'this\\ still\\"not\\\\allowed@example.com', // Invalid escaping
        'john..doe@example.com', // Double dots
        '.john@example.com', // Starts with dot
        'john.@example.com', // Ends with dot
        'john@example..com', // Double dots in domain
        'john@example.com.', // Ends with dot
        ' john@example.com', // Starts with space
        'john@example.com ', // Ends with space
        '', // Empty
        null, // Null
        undefined, // Undefined
        123, // Number
        [], // Array
        {} // Object
      ];

      invalidEmails.forEach((email) => {
        const config = {
          ...validConfig,
          email
        };

        const result = ContactFormContract.safeParse(config);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Phone Validation Tests', () => {
    it('should accept valid phone formats', () => {
      const validPhones = [
        '+1-555-123-4567',
        '+44-20-7946-0958',
        '+33-1-42-86-83-26',
        '+61-2-9374-4000',
        '+81-3-3234-5678',
        '+49-30-12345678',
        '+1 555 123 4567',
        '555-123-4567',
        '555 123 4567',
        '+1-800-555-0199',
        '020 7946 0958', // UK format
        '03 9374 4000', // Australian format
      ];

      validPhones.forEach((phone) => {
        const config = {
          ...validConfig,
          phone
        };

        const result = ContactFormContract.safeParse(config);
        expect(result.success).toBe(true);

        if (result.success) {
          expect(result.data.phone).toBe(phone);
        }
      });
    });

    it('should reject invalid phone formats', () => {
      const invalidPhones = [
        'abc-def-ghij', // Letters only
        '123-abc-4567', // Mixed letters and numbers
        '+1-555-123-45678', // Too many digits
        '+1-555-123', // Too few digits
        '555-1234', // Too few digits
        '555-123-456-7890', // Too many segments
        '+1--555-123-4567', // Double dash
        '+1-555--123-4567', // Double dash
        '(555-123-4567', // Mismatched parentheses
        '555)123-4567', // Mismatched parentheses
        '+1 (555 123-4567', // Mismatched parentheses
        '', // Empty string
        ' ', // Space only
        '+', // Plus only
        '-', // Dash only
        '()', // Empty parentheses
        '555-123-4567 ext. abc', // Text extension
        null, // Null
        123, // Number
        [], // Array
        {} // Object
      ];

      invalidPhones.forEach((phone) => {
        const config = {
          ...validConfig,
          phone
        };

        const result = ContactFormContract.safeParse(config);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Subject Validation Tests', () => {
    it('should accept all valid subject values', () => {
      const validSubjects = ['General', 'Booking', 'Business', 'Events'];

      validSubjects.forEach((subject) => {
        const config = {
          ...validConfig,
          subject
        };

        const result = ContactFormContract.safeParse(config);
        expect(result.success).toBe(true);

        if (result.success) {
          expect(result.data.subject).toBe(subject);
        }
      });
    });

    it('should reject invalid subject values', () => {
      const invalidSubjects = [
        'general', // Lowercase
        'GENERAL', // Uppercase
        'Invalid', // Not in enum
        'Support', // Not in enum
        '', // Empty
        null, // Null
        undefined, // Undefined
        123, // Number
        [], // Array
        {} // Object
      ];

      invalidSubjects.forEach((subject) => {
        const config = {
          ...validConfig,
          subject
        };

        const result = ContactFormContract.safeParse(config);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Message Validation Tests', () => {
    it('should accept valid message lengths', () => {
      const validMessages = [
        'This is exactly 10 characters message.', // Exactly 10 characters without spaces
        'This is a typical message length for a contact form inquiry about hotel services.',
        'a'.repeat(1000), // Maximum length
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.'
      ];

      validMessages.forEach((message) => {
        const config = {
          ...validConfig,
          message
        };

        const result = ContactFormContract.safeParse(config);
        expect(result.success).toBe(true);

        if (result.success) {
          expect(result.data.message).toBe(message);
        }
      });
    });

    it('should reject invalid message lengths', () => {
      const invalidMessages = [
        'Short', // Too short (9 characters including space)
        '123456789', // Too short (9 characters)
        '12345678', // Too short (8 characters)
        '', // Empty
        '   ', // Only spaces
        'a'.repeat(1001), // Too long
        null, // Null
        undefined, // Undefined
        123, // Number
        [], // Array
        {} // Object
      ];

      invalidMessages.forEach((message) => {
        const config = {
          ...validConfig,
          message
        };

        const result = ContactFormContract.safeParse(config);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Edge Cases Tests', () => {
    it('should handle boundary values', () => {
      const boundaryConfig = {
        name: 'AB', // Exactly 2 characters
        email: 'a@b.co', // Minimal valid email
        subject: 'General',
        message: '1234567890' // Exactly 10 characters
      };

      const result = ContactFormContract.safeParse(boundaryConfig);
      expect(result.success).toBe(true);
    });

    it('should reject all empty or null values', () => {
      const emptyConfigs = [
        {}, // All missing
        { name: '', email: '', subject: 'General', message: 'Test' }, // Empty strings
        { name: null, email: null, subject: 'General', message: 'Test' }, // Null values
        { name: undefined, email: undefined, subject: 'General', message: 'Test' }, // Undefined values
      ];

      emptyConfigs.forEach((config) => {
        const result = ContactFormContract.safeParse(config);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Type Safety Tests', () => {
    it('should maintain type safety for valid data', () => {
      const result = ContactFormContract.safeParse(validConfig);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(typeof result.data.name).toBe('string');
        expect(typeof result.data.email).toBe('string');
        expect(['string', 'undefined']).toContain(typeof result.data.phone);
        expect(typeof result.data.subject).toBe('string');
        expect(typeof result.data.message).toBe('string');
      }
    });
  });
});