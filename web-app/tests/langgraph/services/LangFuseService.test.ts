import { LangFuseService } from '../../../app/langgraph/services/LangFuseService';

// Mock the langfuse package (v3)
const mockGeneration = {
  end: jest.fn(),
};

const mockTrace = {
  id: 'test-trace-id',
  generation: jest.fn().mockReturnValue(mockGeneration),
  update: jest.fn(),
};

const mockLangfuse = {
  trace: jest.fn().mockReturnValue(mockTrace),
  flush: jest.fn().mockResolvedValue(undefined),
  shutdown: jest.fn().mockResolvedValue(undefined),
  getPrompt: jest.fn(),
};

jest.mock('langfuse', () => {
  return {
    Langfuse: jest.fn().mockImplementation(() => mockLangfuse),
  };
});

describe('LangFuseService', () => {
  let service: LangFuseService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new LangFuseService();
  });

  describe('startWorkflowTrace', () => {
    it('should start a workflow trace with name', () => {
      const trace = service.startWorkflowTrace('TestWorkflow');
      expect(trace).toBeDefined();
      expect(service.getTraceId()).toBe('test-trace-id');
    });

    it('should start a workflow trace with metadata', () => {
      const metadata = { hotelId: 'test-hotel' };
      service.startWorkflowTrace('TestWorkflow', metadata);
      expect(service.getTraceId()).toBe('test-trace-id');
    });

    it('should start a workflow trace with sessionId', () => {
      service.startWorkflowTrace('TestWorkflow', {}, 'session-123');
      expect(service.getTraceId()).toBe('test-trace-id');
    });
  });

  describe('getTraceId', () => {
    it('should return null when no trace is active', () => {
      const newService = new LangFuseService();
      expect(newService.getTraceId()).toBeNull();
    });

    it('should return trace id when trace is active', () => {
      service.startWorkflowTrace('TestWorkflow');
      expect(service.getTraceId()).toBe('test-trace-id');
    });
  });

  describe('getTraceUrl', () => {
    it('should return null when no trace is active', () => {
      const newService = new LangFuseService();
      expect(newService.getTraceUrl()).toBeNull();
    });

    it('should generate default cloud URL', () => {
      service.startWorkflowTrace('TestWorkflow');
      expect(service.getTraceUrl()).toBe('https://cloud.langfuse.com/trace/test-trace-id');
    });

    it('should use custom base URL from env', () => {
      process.env.LANGFUSE_BASE_URL = 'https://custom.langfuse.com';
      const customService = new LangFuseService();
      customService.startWorkflowTrace('TestWorkflow');
      expect(customService.getTraceUrl()).toBe('https://custom.langfuse.com/trace/test-trace-id');
      delete process.env.LANGFUSE_BASE_URL;
    });
  });

  describe('endWorkflowTrace', () => {
    it('should end workflow trace with output', () => {
      service.startWorkflowTrace('TestWorkflow');
      expect(() => service.endWorkflowTrace({ result: 'success' })).not.toThrow();
    });

    it('should end workflow trace without output', () => {
      service.startWorkflowTrace('TestWorkflow');
      expect(() => service.endWorkflowTrace()).not.toThrow();
    });

    it('should handle ending when no trace is active', () => {
      expect(() => service.endWorkflowTrace({ result: 'test' })).not.toThrow();
    });
  });

  describe('executeGeneration - Critical Visibility Pattern', () => {
    it('should call trace.update with input before LLM call', async () => {
      service.startWorkflowTrace('TestWorkflow');
      const mockExecute = jest.fn().mockResolvedValue({ output: 'result', usage: { input: 10, output: 20 } });

      await service.executeGeneration('TestGeneration', { prompt: 'test' }, { model: 'test-model' }, mockExecute);

      // Verify trace.update was called with input (should be first call)
      expect(mockTrace.update).toHaveBeenCalledWith({ input: { prompt: 'test' } });
    });

    it('should call trace.update with output after LLM call', async () => {
      service.startWorkflowTrace('TestWorkflow');
      const mockExecute = jest.fn().mockResolvedValue({ output: 'result', usage: { input: 10, output: 20 } });

      await service.executeGeneration('TestGeneration', { prompt: 'test' }, { model: 'test-model' }, mockExecute);

      // Verify trace.update was called at least twice (input + output)
      expect(mockTrace.update.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    it('should create generation with correct parameters', async () => {
      service.startWorkflowTrace('TestWorkflow');
      const mockExecute = jest.fn().mockResolvedValue({ output: 'result', usage: { input: 10, output: 20 } });

      await service.executeGeneration('TestGeneration', { prompt: 'test' }, { model: 'test-model' }, mockExecute);

      expect(mockTrace.generation).toHaveBeenCalledWith({
        name: 'TestGeneration',
        model: 'test-model',
        modelParameters: { model: 'test-model' },
        startTime: expect.any(Date),
      });
    });

    it('should end generation with output and usage', async () => {
      service.startWorkflowTrace('TestWorkflow');
      const mockExecute = jest.fn().mockResolvedValue({ output: 'result', usage: { input: 10, output: 20 } });

      await service.executeGeneration('TestGeneration', { prompt: 'test' }, { model: 'test-model' }, mockExecute);

      expect(mockGeneration.end).toHaveBeenCalledWith({
        output: 'result',
        usage: { input: 10, output: 20 },
        completionStartTime: expect.any(Date),
        model: 'test-model',
      });
    });

    it('should return the execution result', async () => {
      service.startWorkflowTrace('TestWorkflow');
      const expectedResult = { output: 'result', usage: { input: 10, output: 20 } };
      const mockExecute = jest.fn().mockResolvedValue(expectedResult);

      const result = await service.executeGeneration('TestGeneration', { prompt: 'test' }, { model: 'test-model' }, mockExecute);

      expect(result).toEqual(expectedResult);
    });

    it('should handle result without explicit output field', async () => {
      service.startWorkflowTrace('TestWorkflow');
      const mockExecute = jest.fn().mockResolvedValue({ text: 'direct result' });

      await service.executeGeneration('TestGeneration', { prompt: 'test' }, { model: 'test-model' }, mockExecute);

      expect(mockGeneration.end).toHaveBeenCalledWith({
        output: { text: 'direct result' },
        usage: {},
        completionStartTime: expect.any(Date),
        model: 'test-model',
      });
    });

    it('should handle result without usage field', async () => {
      service.startWorkflowTrace('TestWorkflow');
      const mockExecute = jest.fn().mockResolvedValue({ output: 'result' });

      await service.executeGeneration('TestGeneration', { prompt: 'test' }, { model: 'test-model' }, mockExecute);

      expect(mockGeneration.end).toHaveBeenCalledWith({
        output: 'result',
        usage: {},
        completionStartTime: expect.any(Date),
        model: 'test-model',
      });
    });
  });

  describe('executeGeneration - Error Handling', () => {
    it('should end generation with error status on failure', async () => {
      service.startWorkflowTrace('TestWorkflow');
      const mockError = new Error('LLM failed');
      const mockExecute = jest.fn().mockRejectedValue(mockError);

      await expect(service.executeGeneration('TestGeneration', { prompt: 'test' }, { model: 'test-model' }, mockExecute))
        .rejects.toThrow('LLM failed');

      expect(mockGeneration.end).toHaveBeenCalledWith({
        statusMessage: 'LLM failed',
        level: 'ERROR',
      });
    });

    it('should update trace with error output on failure', async () => {
      service.startWorkflowTrace('TestWorkflow');
      const mockError = new Error('LLM failed');
      const mockExecute = jest.fn().mockRejectedValue(mockError);

      await expect(service.executeGeneration('TestGeneration', { prompt: 'test' }, { model: 'test-model' }, mockExecute))
        .rejects.toThrow();

      // Verify trace.update was called (input + error output)
      expect(mockTrace.update.mock.calls.length).toBeGreaterThan(0);
    });

    it('should handle non-Error exceptions', async () => {
      service.startWorkflowTrace('TestWorkflow');

      // Create an actual rejected promise with a string value
      const mockExecute = () => Promise.reject('string error');

      await expect(service.executeGeneration('TestGeneration', { prompt: 'test' }, { model: 'test-model' }, mockExecute))
        .rejects.toEqual('string error');

      expect(mockGeneration.end).toHaveBeenCalledWith({
        statusMessage: 'string error',
        level: 'ERROR',
      });
    });
  });

  describe('executeGeneration - No Active Trace', () => {
    it('should start independent trace when no active trace', async () => {
      const newService = new LangFuseService();
      const mockExecute = jest.fn().mockResolvedValue({ output: 'result', usage: { input: 10, output: 20 } });

      const result = await newService.executeGeneration('TestGeneration', { prompt: 'test' }, { model: 'test-model' }, mockExecute);

      expect(result).toEqual({ output: 'result', usage: { input: 10, output: 20 } });
      expect(newService.getTraceId()).toBe('test-trace-id');
    });
  });

  describe('getPrompt - Input Sanitization', () => {
    it('should escape double quotes in string variables', async () => {
      const mockCompile = jest.fn().mockReturnValue('compiled prompt');
      mockLangfuse.getPrompt = jest.fn().mockResolvedValue({ compile: mockCompile });

      await service.getPrompt('test-prompt', { hotelName: 'My " Hotel' });

      expect(mockCompile).toHaveBeenCalledWith({ hotelName: 'My \\" Hotel' });
    });

    it('should escape backslashes in string variables', async () => {
      const mockCompile = jest.fn().mockReturnValue('compiled prompt');
      mockLangfuse.getPrompt = jest.fn().mockResolvedValue({ compile: mockCompile });

      await service.getPrompt('test-prompt', { path: 'C:\\Users\\test' });

      expect(mockCompile).toHaveBeenCalledWith({ path: 'C:\\\\Users\\\\test' });
    });

    it('should escape newlines in string variables', async () => {
      const mockCompile = jest.fn().mockReturnValue('compiled prompt');
      mockLangfuse.getPrompt = jest.fn().mockResolvedValue({ compile: mockCompile });

      await service.getPrompt('test-prompt', { desc: 'line1\nline2' });

      expect(mockCompile).toHaveBeenCalledWith({ desc: 'line1\\nline2' });
    });

    it('should JSON-stringify object variables without sanitization', async () => {
      const mockCompile = jest.fn().mockReturnValue('compiled prompt');
      mockLangfuse.getPrompt = jest.fn().mockResolvedValue({ compile: mockCompile });

      await service.getPrompt('test-prompt', { data: { key: 'value' } });

      expect(mockCompile).toHaveBeenCalledWith({
        data: JSON.stringify({ key: 'value' }, null, 2),
      });
    });

    it('should handle safe strings unchanged', async () => {
      const mockCompile = jest.fn().mockReturnValue('compiled prompt');
      mockLangfuse.getPrompt = jest.fn().mockResolvedValue({ compile: mockCompile });

      await service.getPrompt('test-prompt', { hotelName: 'Grand Hotel' });

      expect(mockCompile).toHaveBeenCalledWith({ hotelName: 'Grand Hotel' });
    });
  });

  describe('flush', () => {
    it('should flush events to LangFuse', async () => {
      await service.flush();
      expect(mockLangfuse.flush).toHaveBeenCalled();
    });
  });

  describe('shutdown', () => {
    it('should shutdown LangFuse client', async () => {
      await service.shutdown();
      expect(mockLangfuse.shutdown).toHaveBeenCalled();
    });
  });
});
