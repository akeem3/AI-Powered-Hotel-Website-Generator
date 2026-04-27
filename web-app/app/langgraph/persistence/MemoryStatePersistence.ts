// web-app/app/langgraph/persistence/MemoryStatePersistence.ts
import { randomUUID } from 'node:crypto';
import { WorkflowState } from '../state/workflow-state';

/**
 * Configuration interface for state persistence
 * Designed to match Postgres checkpointer API for seamless migration
 */
export interface StatePersistenceConfig {
  // In-memory settings
  maxStates?: number; // Maximum states to keep in memory
  ttlMs?: number; // Time-to-live for states in milliseconds

  // Postgres migration settings (for future use)
  connectionString?: string;
  tableName?: string;
  checkpointTTL?: number; // Checkpoint TTL in seconds
}

/**
 * In-memory state persistence implementation
 * Provides checkpointing functionality for LangGraph workflows
 * Interface compatible with Postgres checkpointer for future migration
 */
export class MemoryStatePersistence {
  private states: Map<string, { state: WorkflowState; timestamp: number }> = new Map();
  private config: Required<StatePersistenceConfig>;

  constructor(config: StatePersistenceConfig = {}) {
    this.config = {
      maxStates: config.maxStates || 100,
      ttlMs: config.ttlMs || 30 * 60 * 1000, // 30 minutes default
      connectionString: config.connectionString || '',
      tableName: config.tableName || 'workflow_checkpoints',
      checkpointTTL: config.checkpointTTL || 3600, // 1 hour default
    };
  }

  /**
   * Save workflow state with checkpoint ID
   * Returns the checkpoint ID for retrieval
   */
  async saveState(
    state: WorkflowState,
    checkpointId?: string
  ): Promise<string> {
    const id = checkpointId || this.generateCheckpointId(state.generationId);
    const timestamp = Date.now();

    // Clean up old states first
    this.cleanup();

    // Store the state
    this.states.set(id, {
      state: { ...state }, // Deep copy to prevent mutations
      timestamp,
    });

    console.debug(`[MemoryStatePersistence] Saved state for checkpoint: ${id}`);
    return id;
  }

  /**
   * Retrieve workflow state by checkpoint ID
   * Returns null if not found or expired
   */
  async loadState(checkpointId: string): Promise<WorkflowState | null> {
    const entry = this.states.get(checkpointId);

    if (!entry) {
      console.warn(`[MemoryStatePersistence] Checkpoint not found: ${checkpointId}`);
      return null;
    }

    // Check if state has expired
    if (Date.now() - entry.timestamp > this.config.ttlMs) {
      console.warn(`[MemoryStatePersistence] Checkpoint expired: ${checkpointId}`);
      this.states.delete(checkpointId);
      return null;
    }

    console.debug(`[MemoryStatePersistence] Loaded state for checkpoint: ${checkpointId}`);
    return { ...entry.state }; // Return copy to prevent mutations
  }

  /**
   * List all available checkpoint IDs for a generation
   */
  async listCheckpoints(generationId: string): Promise<string[]> {
    const checkpoints: string[] = [];
    const now = Date.now();

    this.states.forEach((entry, id) => {
      if (entry.state.generationId === generationId) {
        // Check if not expired
        if (now - entry.timestamp <= this.config.ttlMs) {
          checkpoints.push(id);
        }
      }
    });

    return checkpoints.sort(); // Return sorted list
  }

  /**
   * Delete a specific checkpoint
   */
  async deleteCheckpoint(checkpointId: string): Promise<boolean> {
    const deleted = this.states.delete(checkpointId);
    if (deleted) {
      console.debug(`[MemoryStatePersistence] Deleted checkpoint: ${checkpointId}`);
    }
    return deleted;
  }

  /**
   * Clear all states (useful for testing)
   */
  async clear(): Promise<void> {
    this.states.clear();
    console.debug(`[MemoryStatePersistence] Cleared all states`);
  }

  /**
   * Get current statistics
   */
  getStats(): {
    totalStates: number;
    memoryUsageEstimate: number;
    oldestStateAge: number;
  } {
    const now = Date.now();
    let oldestTimestamp = now;
    let totalSize = 0;

    this.states.forEach((entry) => {
      oldestTimestamp = Math.min(oldestTimestamp, entry.timestamp);
      // Rough estimate of state size in bytes
      totalSize += JSON.stringify(entry.state).length * 2; // UTF-16 chars
    });

    return {
      totalStates: this.states.size,
      memoryUsageEstimate: totalSize,
      oldestStateAge: now - oldestTimestamp,
    };
  }

  /**
   * Clean up expired and excess states
   */
  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    // Mark expired states for deletion
    this.states.forEach((entry, id) => {
      if (now - entry.timestamp > this.config.ttlMs) {
        toDelete.push(id);
      }
    });

    // If still over limit, remove oldest states
    if (this.states.size - toDelete.length > this.config.maxStates) {
      const sortedEntries: Array<[string, { state: WorkflowState; timestamp: number }]> = [];
      this.states.forEach((entry, id) => {
        sortedEntries.push([id, entry]);
      });
      sortedEntries.sort((a, b) => a[1].timestamp - b[1].timestamp);

      const excess = this.states.size - toDelete.length - this.config.maxStates;
      for (let i = 0; i < excess; i++) {
        toDelete.push(sortedEntries[i][0]);
      }
    }

    // Delete marked states
    for (const id of toDelete) {
      this.states.delete(id);
    }

    if (toDelete.length > 0) {
      console.debug(`[MemoryStatePersistence] Cleaned up ${toDelete.length} expired/old states`);
    }
  }

  /**
   * Generate a checkpoint ID from generation ID
   */
  private generateCheckpointId(generationId: string): string {
    const timestamp = Date.now();
    const random = randomUUID();
    return `${generationId}_${timestamp}_${random}`;
  }

  /**
   * Check if ready for Postgres migration
   * Returns true if connection string is configured
   */
  readyForPostgresMigration(): boolean {
    return Boolean(this.config.connectionString);
  }

  /**
   * Get Postgres configuration for migration
   */
  getPostgresConfig(): {
    connectionString: string;
    tableName: string;
    checkpointTTL: number;
  } | null {
    if (!this.readyForPostgresMigration()) {
      return null;
    }

    return {
      connectionString: this.config.connectionString!,
      tableName: this.config.tableName,
      checkpointTTL: this.config.checkpointTTL,
    };
  }
}