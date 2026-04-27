import { MemoryStatePersistence } from '@/app/langgraph/persistence/MemoryStatePersistence';
import { WorkflowState } from '@/app/langgraph/state/workflow-state';

describe('MemoryStatePersistence', () => {
  let persistence: MemoryStatePersistence;
  const mockState: WorkflowState = {
    generationId: 'test-gen-123',
    hotelParameters: { hotelName: 'Test Hotel' }
  } as any;

  beforeEach(() => {
    persistence = new MemoryStatePersistence();
  });

  test('should generate a secure checkpoint ID if not provided', async () => {
    const id = await persistence.saveState(mockState);

    // Format should be: generationId_timestamp_uuid
    expect(id).toContain('test-gen-123_');
    const parts = id.split('_');
    expect(parts.length).toBe(3);

    // Verify the UUID part
    const uuid = parts[2];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(uuid).toMatch(uuidRegex);
  });

  test('should use provided checkpoint ID if given', async () => {
    const customId = 'custom-id';
    const id = await persistence.saveState(mockState, customId);
    expect(id).toBe(customId);
  });

  test('should load saved state', async () => {
    const id = await persistence.saveState(mockState);
    const loaded = await persistence.loadState(id);
    expect(loaded).toEqual(mockState);
    // Should be a copy, not the same reference
    expect(loaded).not.toBe(mockState);
  });

  test('should return null for non-existent checkpoint', async () => {
    const loaded = await persistence.loadState('non-existent');
    expect(loaded).toBeNull();
  });
});
