import { render, screen } from '@testing-library/react';
import { createMockRoom } from '../factories/mockData';
import {
  testAccessibility,
  testImageAltText,
  testKeyboardNavigation,
  testAriaAttributes,
  renderAndTestAccessibility
} from './accessibility';

// Simple accessible component for testing
const TestAccessibleComponent = () => (
  <div>
    <h1>Test Component</h1>
    <button>Click me</button>
    <img src="/test.jpg" alt="Test image" />
    <a href="/test">Test link</a>
  </div>
);

describe('Accessibility Helpers', () => {
  it('should test accessibility of a simple component', async () => {
    const { container } = render(<TestAccessibleComponent />);
    await testAccessibility(container);
  });

  it('should test image alt text', () => {
    const { container } = render(
      <div>
        <img src="/test1.jpg" alt="Descriptive alt text" />
        <img src="/test2.jpg" role="presentation" alt="" />
      </div>
    );

    expect(() => testImageAltText(container)).not.toThrow();
  });

  it('should test keyboard navigation', () => {
    const { container } = render(
      <div>
        <button>Button 1</button>
        <button>Button 2</button>
        <a href="/test">Test Link</a>
      </div>
    );

    expect(() => testKeyboardNavigation(container)).not.toThrow();
  });

  it('should test ARIA attributes', () => {
    const { container } = render(
      <div role="main" aria-label="Main content">
        <button aria-expanded="true">Toggle</button>
      </div>
    );

    expect(() => testAriaAttributes(container, {
      role: 'main',
      label: 'Main content'
    })).not.toThrow();
  });

  it('should render and test accessibility', async () => {
    const TestComponent = () => (
      <main>
        <h1>Accessible Page</h1>
        <p>This is a test page.</p>
      </main>
    );

    const result = await renderAndTestAccessibility(<TestComponent />);
    expect(result.container.querySelector('h1')).toBeInTheDocument();
  });

  it('should work with mock data in accessibility tests', async () => {
    const room = createMockRoom();
    const RoomComponent = () => (
      <article>
        <h2>{room.name}</h2>
        <img src={room.image} alt={room.name} />
        <p>Price: ${room.price}</p>
        <button>Book this room</button>
      </article>
    );

    const { container } = render(<RoomComponent />);
    await testAccessibility(container);
  });
});