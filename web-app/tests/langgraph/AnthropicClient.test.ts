/**
 * AnthropicClient Integration Test
 *
 * Tests the Z.ai Anthropic-compatible endpoint with real API calls.
 * Run with: npm test -- tests/langgraph/AnthropicClient.test.ts
 */

import { AnthropicClient } from '../../app/langgraph/services/AnthropicClient';
import { LLMProviderFactory } from '../../app/langgraph/services/LLMProviderFactory';

// Load environment variables
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// CRITICAL: Restore real fetch for integration tests
// jest.workflow.setup.js mocks fetch globally, but we need real API calls
// Import node-fetch to restore real HTTP functionality
const nodeFetch = require('node-fetch');

describe('AnthropicClient (Z.ai Integration)', () => {
  let client: AnthropicClient;

  beforeAll(() => {
    // Restore real fetch for integration tests
    if ((global as any).fetch && typeof (global as any).fetch.mockClear === 'function') {
      (global as any).fetch.mockClear();
    }
    (global as any).fetch = nodeFetch.default || nodeFetch;
    (global as any).Headers = nodeFetch.Headers;
    (global as any).Request = nodeFetch.Request;
    (global as any).Response = nodeFetch.Response;

    client = new AnthropicClient();
  });

  describe('Configuration', () => {
    it('should have ANTHROPIC_BASE_URL configured', () => {
      expect(process.env.ANTHROPIC_BASE_URL).toBeDefined();
      expect(process.env.ANTHROPIC_BASE_URL).toContain('z.ai');
    });

    it('should have ANTHROPIC_AUTH_TOKEN configured', () => {
      expect(process.env.ANTHROPIC_AUTH_TOKEN).toBeDefined();
      expect(process.env.ANTHROPIC_AUTH_TOKEN!.length).toBeGreaterThan(10);
    });

    it('should have glm-4.7 as the model', () => {
      expect(process.env.ANTHROPIC_PRIMARY_MODEL).toBe('glm-4.7');
    });

    it('should select correct provider via factory', () => {
      expect(process.env.LLM_PROVIDER).toBe('anthropic');
      const provider = LLMProviderFactory.create();
      expect(provider).toBeInstanceOf(AnthropicClient);
    });
  });

  describe('Model Selection', () => {
    it('should return glm-4.7 for all budget tiers', () => {
      expect(client.selectModel('test', 2.0)).toBe('glm-4.7');
      expect(client.selectModel('test', 0.75)).toBe('glm-4.7');
      expect(client.selectModel('test', 0.25)).toBe('glm-4.7');
    });

    it('should have glm-4.7 in available models', () => {
      const models = client.getAvailableModels();
      expect(models).toContain('glm-4.7');
    });

    it('should return pricing for glm-4.7', () => {
      const pricing = client.getModelPricing('glm-4.7');
      expect(pricing.input).toBeDefined();
      expect(pricing.output).toBeDefined();
    });
  });

  describe('API Integration (Real Call)', () => {
    it('should successfully call Z.ai endpoint', async () => {
      const response = await client.sendCompletion(
        [{ role: 'user', content: 'Say "Hello from GLM" in exactly 5 words.' }],
        { agentName: 'test', budgetRemaining: 2.0, maxTokens: 50 }
      );

      // DEBUG: Print full response
      console.log('🔍 DEBUG - Full response:', JSON.stringify(response, null, 2));
      console.log('🔍 DEBUG - response.text:', response.text);
      console.log('🔍 DEBUG - response.text length:', response.text?.length);
      console.log('🔍 DEBUG - response.text type:', typeof response.text);

      expect(response.text).toBeDefined();
      expect(response.text.length).toBeGreaterThan(0);
      expect(response.model).toBe('glm-4.7');
      expect(response.usage.input).toBeGreaterThan(0);
      expect(response.usage.output).toBeGreaterThan(0);
      expect(response.cost).toBeGreaterThanOrEqual(0);

      console.log('✅ Z.ai Response:', response.text);
      console.log('📊 Usage:', response.usage);
      console.log('💰 Cost:', response.cost);
    }, 30000);

    it('should handle JSON response request', async () => {
      const response = await client.sendCompletion(
        [{
          role: 'user',
          content: 'Return a JSON object with keys "status" and "message". Status should be "ok" and message should be "test passed". Only return the JSON, no other text.'
        }],
        { agentName: 'test', budgetRemaining: 2.0, maxTokens: 100 }
      );

      expect(response.text).toBeDefined();

      // Try to parse JSON from response
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      expect(jsonMatch).not.toBeNull();

      const parsed = JSON.parse(jsonMatch![0]);
      expect(parsed.status).toBe('ok');

      console.log('✅ JSON Response:', parsed);
    }, 30000);
  });
});
