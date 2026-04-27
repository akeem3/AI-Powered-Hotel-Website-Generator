import React from 'react';
import { render } from '@testing-library/react';
import { JsonLdScript } from '@/components/seo/JsonLdScript';

describe('JsonLdScript Component', () => {
  it('should render a script tag with application/ld+json', () => {
    const data = {
      "@context": "https://schema.org",
      "@type": "Hotel",
      "name": "Luxury Hotel"
    };

    const { container } = render(<JsonLdScript jsonLd={data} />);
    const script = container.querySelector('script');

    expect(script).toBeInTheDocument();
    expect(script).toHaveAttribute('type', 'application/ld+json');
    expect(script?.innerHTML).toContain('"name":"Luxury Hotel"');
  });

  it('should escape malicious XSS payloads in JSON-LD', () => {
    const maliciousData = {
      "@context": "https://schema.org",
      "@type": "Hotel",
      "description": "</script><script>alert('XSS Attack!')</script>"
    };

    const { container } = render(<JsonLdScript jsonLd={maliciousData} />);
    const script = container.querySelector('script');

    expect(script).toBeInTheDocument();

    // The script content should be safely escaped
    const htmlContent = script?.innerHTML || '';

    expect(htmlContent).not.toContain('</script>');
    expect(htmlContent).not.toContain('<script>');

    // It should contain the unicode escaped equivalents
    expect(htmlContent).toContain('\\u003c/script\\u003e');
    expect(htmlContent).toContain('\\u003cscript\\u003e');
  });
});
