import { LangFuseService } from '../../../app/langgraph/services/LangFuseService';
import fs from 'fs';
import path from 'path';

// Mock fs and path
jest.mock('fs');
jest.mock('path');
jest.mock('langfuse');

describe('LangFuseService Fallback Logic', () => {
  let service: LangFuseService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new LangFuseService();
  });

  describe('loadPromptFallback', () => {
    const mockContent = "Hello {{name}}! Welcome to {{place}}. Here is your {{data}}.";
    const variables = {
      name: "Jules",
      place: "The Sandbox",
      data: { foo: "bar" }
    };

    it('should correctly replace multiple variables in a single pass', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockContent);
      (path.join as jest.Mock).mockReturnValue('mock-path');

      // Access private method
      const result = (service as any).loadPromptFallback('test-prompt', variables);

      expect(result).toBe('Hello Jules! Welcome to The Sandbox. Here is your {\n  "foo": "bar"\n}.');
    });

    it('should handle special characters in variable keys', () => {
      const specialContent = "Value: {{key.with.dots}} and {{key*with+regex?}}";
      const specialVars = {
        "key.with.dots": "dots",
        "key*with+regex?": "regex"
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(specialContent);

      const result = (service as any).loadPromptFallback('test-prompt', specialVars);

      expect(result).toBe('Value: dots and regex');
    });

    it('should handle values with $ characters correctly', () => {
      const priceContent = "The price is {{price}}.";
      const priceVars = { price: "$100" };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(priceContent);

      const result = (service as any).loadPromptFallback('test-prompt', priceVars);

      expect(result).toBe('The price is $100.');
    });

    it('should return original content if no variables are provided', () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readFileSync as jest.Mock).mockReturnValue(mockContent);

        const result = (service as any).loadPromptFallback('test-prompt', {});

        expect(result).toBe(mockContent);
      });
  });
});
