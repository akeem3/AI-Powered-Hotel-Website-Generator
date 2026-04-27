import { OpenRouterClient } from '../../../app/langgraph/services/OpenRouterClient';
import { CostMonitor } from '../../../app/langgraph/services/CostMonitor';

// Mock global fetch
global.fetch = jest.fn();

describe('OpenRouterClient', () => {
  let client: OpenRouterClient;
  const mockCostMonitor = { TOTAL_BUDGET: 2.0 };

  beforeEach(() => {
    jest.clearAllMocks();
    client = new OpenRouterClient(undefined, mockCostMonitor);
    process.env.OPENROUTER_API_KEY = 'test-key';
    process.env.GENERATION_TIMEOUT_MS = '1000';
    
    // Mock setTimeout to resolve immediately during tests to avoid timeout
    jest.spyOn(global, 'setTimeout').mockImplementation((cb: any) => { 
      if (typeof cb === 'function') cb(); 
      return 0 as any;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Model Selection Logic', () => {
    it('should select PRIMARY model when budget > $1.00', () => {
      const model = client.selectModel('TestAgent', 1.5);
      expect(model).toBe('moonshotai/kimi-k2');
    });

    it('should select PRIMARY model when budget equals exactly $1.01', () => {
      const model = client.selectModel('TestAgent', 1.01);
      expect(model).toBe('moonshotai/kimi-k2');
    });

    it('should select FALLBACK model when budget is $0.50-$1.00', () => {
      const model1 = client.selectModel('TestAgent', 0.8);
      expect(model1).toBe('anthropic/claude-3-haiku');

      const model2 = client.selectModel('TestAgent', 0.50);
      expect(model2).toBe('anthropic/claude-3-haiku');

      const model3 = client.selectModel('TestAgent', 1.00);
      expect(model3).toBe('anthropic/claude-3-haiku');
    });

    it('should select BUDGET model when budget < $0.50', () => {
      const model = client.selectModel('TestAgent', 0.49);
      expect(model).toBe('openai/gpt-4o-mini');
    });

    it('should select BUDGET model when budget is very low', () => {
      const model = client.selectModel('TestAgent', 0.10);
      expect(model).toBe('openai/gpt-4o-mini');
    });
  });

  describe('Pricing Logic', () => {
    it('should return correct pricing for Kimi K2', () => {
      const pricing = client.getModelPricing('moonshotai/kimi-k2');
      expect(pricing).toEqual({ input: 0.0001, output: 0.0004 });
    });

    it('should return correct pricing for Haiku', () => {
      const pricing = client.getModelPricing('anthropic/claude-3-haiku');
      expect(pricing).toEqual({ input: 0.00025, output: 0.00125 });
    });

    it('should return correct pricing for GPT-4o Mini', () => {
      const pricing = client.getModelPricing('openai/gpt-4o-mini');
      expect(pricing).toEqual({ input: 0.00015, output: 0.0006 });
    });

    it('should default to Kimi pricing for unknown models', () => {
      const pricing = client.getModelPricing('unknown-model');
      expect(pricing).toEqual({ input: 0.0001, output: 0.0004 });
    });
  });

  describe('sendCompletion', () => {
    const mockMessages = [{ role: 'user', content: 'test' }];
    const mockOptions = { agentName: 'TestAgent', budgetRemaining: 2.0 };
    const mockSuccessResponse = {
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Success response' } }],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 }
      })
    };

    it('should successfully call API and return result', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockSuccessResponse);

      const result = await client.sendCompletion(mockMessages, mockOptions);

      expect(result.text).toBe('Success response');
      expect(result.model).toBe('moonshotai/kimi-k2'); // Default primary
      expect(result.usage.total).toBe(150);
      
      // Cost: (100/1000 * 0.0001) + (50/1000 * 0.0004) = 0.00001 + 0.00002 = 0.00003
      expect(result.cost).toBeCloseTo(0.00003, 8);
    });

    it('should pass correct headers and body to API', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockSuccessResponse);

      await client.sendCompletion(mockMessages, { ...mockOptions, temperature: 0.5 });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key',
            'HTTP-Referer': 'https://effective-tours.com',
          }),
          body: JSON.stringify({
            model: 'moonshotai/kimi-k2',
            messages: mockMessages,
            temperature: 0.5,
            max_tokens: 2000
          })
        })
      );
    });

    it('should retry on failure (exponential backoff)', async () => {
      // Fail twice, then succeed
      const mockErrorResponse = {
        ok: false,
        status: 500,
        json: async () => ({ error: { message: 'Server error' } })
      };
      
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockErrorResponse)
        .mockResolvedValueOnce(mockErrorResponse) // Retry 1
        .mockResolvedValueOnce(mockSuccessResponse); // Retry 2

      const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      await client.sendCompletion(mockMessages, mockOptions);

      expect(global.fetch).toHaveBeenCalledTimes(3);
      spy.mockRestore();
    });

    it('should fallback to next model tier after max retries', async () => {
      const mockErrorResponse = {
        ok: false,
        status: 500,
        json: async () => ({ error: { message: 'Persistent error' } })
      };

      // Mock fetch to fail 3 times (Primary), then succeed (Fallback)
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockErrorResponse) // Kimi attempt 1
        .mockResolvedValueOnce(mockErrorResponse) // Kimi retry 1
        .mockResolvedValueOnce(mockErrorResponse) // Kimi retry 2
        .mockResolvedValueOnce(mockSuccessResponse); // Haiku attempt 1

      const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await client.sendCompletion(mockMessages, mockOptions);

      expect(result.model).toBe('anthropic/claude-3-haiku');
      expect(global.fetch).toHaveBeenCalledTimes(4);
      spy.mockRestore();
    });

    it('should throw error if all models fail', async () => {
      const mockErrorResponse = {
        ok: false,
        status: 500,
        json: async () => ({ error: { message: 'Fail' } })
      };
      
      // Mock failure for all tiers and retries
      // 3 tiers * 3 attempts = 9 calls max
      (global.fetch as jest.Mock).mockResolvedValue(mockErrorResponse);

      const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      await expect(client.sendCompletion(mockMessages, mockOptions))
        .rejects.toThrow('OpenRouter completion failed for all models');
      
      spy.mockRestore();
    });
  });
});
