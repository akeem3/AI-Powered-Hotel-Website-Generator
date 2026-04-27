import { render, RenderOptions } from "@testing-library/react";
import React, { ReactElement } from "react";

// Note: TranslationProvider will be implemented in Epic 2 as mentioned in Story 1.7
// For now, using simple wrapper until Translation infrastructure is available
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  // TODO: Replace with TranslationProvider when Epic 2 is implemented
  // return <TranslationProvider>{children}</TranslationProvider>;
  return <>{children}</>;
};

const customRender = (ui: ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from React Testing Library
export * from "@testing-library/react";
export { customRender as render };
export { customRender };

// Helper function to create a custom wrapper for tests that need specific providers
export const createWrapper = (WrapperComponent: React.ComponentType<{ children: React.ReactNode }>) => {
  return ({ children }: { children: React.ReactNode }) => (
    <WrapperComponent>{children}</WrapperComponent>
  );
};

// Common test utilities
export const createMockProps = <T extends Record<string, any>>(defaults: T, overrides: Partial<T> = {}): T => {
  return { ...defaults, ...overrides };
};