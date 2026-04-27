import { Langfuse } from 'langfuse';

/**
 * LangFuseService
 *
 * Wrapper around LangFuse SDK to provide centralized observability for
 * the LangGraph workflow.
 *
 * Features:
 * - Singleton-ish usage or per-request instantiation
 * - Workflow Trace management
 * - Generation tracking (LLM calls)
 */
export class LangFuseService {
  private langfuse: Langfuse;
  private currentTrace: ReturnType<Langfuse['trace']> | null = null;
  private traceId: string | null = null;

  constructor() {
    // Initialize LangFuse v3 with environment variables
    // LANGFUSE_SECRET_KEY, LANGFUSE_PUBLIC_KEY, LANGFUSE_HOST (or LANGFUSE_BASE_URL)
    this.langfuse = new Langfuse({
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      baseUrl: process.env.LANGFUSE_BASE_URL || process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com',
      // Optional: flushAt, flushInterval can be passed here if needed
    });
  }

  /**
   * Start a new trace for a workflow execution.
   *
   * @param name Name of the trace (e.g., "HomepageGenerationWorkflow")
   * @param metadata Optional metadata
   * @param sessionId Optional session ID
   */
  public startWorkflowTrace(name: string, metadata?: Record<string, any>, sessionId?: string) {
    this.currentTrace = this.langfuse.trace({
      name,
      metadata,
      sessionId,
      timestamp: new Date(),
    });
    this.traceId = this.currentTrace.id;
    return this.currentTrace;
  }

  /**
   * Get the current trace ID
   */
  public getTraceId(): string | null {
    return this.traceId;
  }

  /**
   * Get the URL for the current trace
   */
  public getTraceUrl(): string | null {
    if (this.currentTrace && this.traceId) {
      // Construct the URL based on the host
      const baseUrl = process.env.LANGFUSE_BASE_URL ||
                     process.env.LANGFUSE_HOST ||
                     'https://cloud.langfuse.com';
      return `${baseUrl}/trace/${this.traceId}`;
    }
    return null;
  }

  /**
   * End the current workflow trace.
   *
   * @param output Final output of the workflow
   * @param status 'DEBUG' | 'DEFAULT' | 'SUCCESS' | 'WARNING' | 'ERROR'
   */
  public endWorkflowTrace(output?: any, status: string = 'SUCCESS') {
    if (this.currentTrace) {
      this.currentTrace.update({
        output,
        // mapping status might be needed depending on SDK version types
      });
      // The SDK doesn't always have an explicit 'end' method for traces in the same way, 
      // often 'update' with output/outcome is sufficient, or just flushing.
      // But we can set a status.
      // this.currentTrace.update({ metadata: { status } });
    }
  }

  /**
   * Execute a generation (LLM call) within the current trace.
   * Implements the CRITICAL visibility pattern:
   * 1. Update trace with input before LLM call (ensures input appears in dashboard)
   * 2. Create generation
   * 3. Execute LLM call
   * 4. End generation with success
   * 5. Update trace with output after LLM call (ensures output appears in dashboard)
   *
   * @param name Name of the generation step
   * @param input Input to the LLM
   * @param modelParams Model parameters (model name, etc.)
   * @param executeFn The actual async function calling the LLM
   * @returns The result of executeFn
   */
  public async executeGeneration<T>(
    name: string,
    input: any,
    modelParams: { model: string; [key: string]: any },
    executeFn: () => Promise<T & { usage?: any; output?: any; model?: string }> // Expecting result to have output/usage for logging
  ): Promise<T> {
    if (!this.currentTrace) {
      console.warn('[LangFuseService] executeGeneration called without active trace. Starting independent trace.');
      this.startWorkflowTrace(name, { mode: 'detached' });
    }

    const trace = this.currentTrace!;

    // 1. CRITICAL: Update trace with input before LLM call (ensures input appears in dashboard)
    trace.update({ input });

    // 2. Create generation
    const generation = trace.generation({
      name,
      model: modelParams.model,
      modelParameters: modelParams,
      startTime: new Date(),
    });

    try {
      // 3. Execute LLM call
      const result = await executeFn();

      // 4. End generation with success
      // We assume result has `output` field, or we treat the whole result as output
      // We also look for `usage` (input/output tokens) and `model` (actual model used)
      const output = result.output || result;
      const usage = result.usage || {}; // usage: { input: 0, output: 0, total: 0 }
      const actualModel = result.model || modelParams.model;

      generation.end({
        output,
        usage,
        model: actualModel,
        completionStartTime: new Date(), // approx
      });

      // 5. CRITICAL: Update trace with output (ensures output appears in dashboard)
      trace.update({ output });

      return result;
    } catch (error: any) {
      // 6. End generation with error
      generation.end({
        statusMessage: error.message || String(error),
        level: 'ERROR',
      });

      // 7. Update trace with error output
      trace.update({ output: { error: error.message || String(error) } });

      throw error;
    }
  }

  /**
   * Fetch a prompt from Langfuse.
   *
   * @param name Name of the prompt in Langfuse
   * @param variables Variables to render in the prompt template
   * @param label Optional label (defaults to 'production')
   * @returns The rendered prompt string
   */
  public async getPrompt(name: string, variables: Record<string, any>, label: string = 'production'): Promise<string> {
    const prompt = await this.langfuse.getPrompt(name, undefined, { label });

    const stringifiedVariables = Object.entries(variables).reduce((acc, [key, value]) => {
      acc[key] = typeof value === 'object'
        ? JSON.stringify(value, null, 2)
        : this.sanitizeForTemplate(String(value));
      return acc;
    }, {} as Record<string, string>);

    return prompt.compile(stringifiedVariables);
  }

  /**
   * Sanitize a string value for safe insertion into JSON-based prompt templates.
   * Escapes characters that could break JSON structure or enable prompt injection.
   */
  private sanitizeForTemplate(value: string): string {
    return JSON.stringify(value).slice(1, -1);
  }

  /**
   * Flush all events to LangFuse asynchronously.
   * Safely handles cases where the flush method may not exist in certain SDK versions.
   */
  public async flush(): Promise<void> {
    // Check if flush method exists before calling (SDK version compatibility)
    if (this.langfuse && typeof this.langfuse.flush === 'function') {
      await this.langfuse.flush();
    } else {
      console.debug('[LangFuseService] flush() method not available in this LangFuse SDK version. Events will be flushed on shutdown.');
    }
  }

  /**
   * Add a score to the current trace.
   *
   * @param name Name of the score (e.g., "quality-score")
   * @param value Numeric value of the score
   * @param comment Optional comment or reasoning
   */
  public addScore(name: string, value: number, comment?: string) {
    if (this.currentTrace) {
      this.currentTrace.score({
        name,
        value,
        comment,
      });
      console.debug(`[LangFuseService] Added score: ${name} = ${value}`);
    } else {
      console.warn(`[LangFuseService] Attempted to add score '${name}' without active trace.`);
    }
  }

  /**
   * Log an error event to the current trace.
   * 
   * @param message The error message to log
   * @param context Additional context for the error
   */  
  public logError(message: string, context?: any) {
    if (this.currentTrace) {
      this.currentTrace.event({
        name: 'error',
        input: context,
        output: { error: message },
        level: 'ERROR',
        statusMessage: message,
      });
      console.error(`[LangFusService] Logged error: ${message}`);
    } else {
      console.warn('[LangFuseService] Attempted to log error without active trace.');
    }
  }

  /**
   * Clean shutdown
   * Safely handles cases where the shutdown method may not exist in certain SDK versions.
   */
  public async shutdown(): Promise<void> {
    // Check if shutdown method exists before calling (SDK version compatibility)
    if (this.langfuse && typeof this.langfuse.shutdown === 'function') {
      await this.langfuse.shutdown();
    } else {
      console.debug('[LangFuseService] shutdown() method not available in this LangFuse SDK version.');
    }
  }
}
