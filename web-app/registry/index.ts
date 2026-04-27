// web-app/registry/index.ts
export type ComponentTier = 'sections' | 'blocks' | 'layouts' | 'atoms';

export interface ComponentMetadata {
  name: string;
  tier: ComponentTier;
  variants?: string[];
  responsiveStrategy?: string;
  hotelTypeRecommendations?: string[];
  tags?: string[];
  description?: string;
  path?: string;
  contractPath?: string; // ✅ optional: links to related Zod contract
}

const registry = new Map<string, ComponentMetadata>();

export function registerComponent(metadata: ComponentMetadata) {
  if (registry.has(metadata.name)) {
    console.warn(`[component-registry] Overwriting registration for ${metadata.name}`);
  }
  registry.set(metadata.name, metadata);
}

/**
 * Retrieve a registered component by name.
 */
export function getComponent(name: string) {
  return registry.get(name);
}

/**
 * List all registered components.
 */
export function listComponents() {
  return Array.from(registry.values());
}

/**
 * Utility for debugging in dev mode
 * Prints all registered component names in the console.
 */
export function debugRegistry() {
  console.table(
    listComponents().map((c) => ({
      Name: c.name,
      Tier: c.tier,
      Variants: c.variants?.join(', ') ?? '-',
      Tags: c.tags?.join(', ') ?? '-',
    }))
  );
}
