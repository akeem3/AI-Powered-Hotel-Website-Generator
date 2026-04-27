import { safeJsonStringify } from '@/lib/utils/json-serialization';

describe('safeJsonStringify', () => {
  it('should serialize standard objects correctly', () => {
    const obj = { name: 'Test', value: 123 };
    expect(safeJsonStringify(obj)).toBe('{"name":"Test","value":123}');
  });

  it('should escape HTML tags to prevent XSS', () => {
    const malicious = {
      text: '</script><script>alert("XSS")</script>',
      div: '<div>Hello</div>'
    };
    const result = safeJsonStringify(malicious);

    // Should contain unicode escapes instead of raw brackets
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
    expect(result).toContain('\\u003c/script\\u003e');
    expect(result).toContain('\\u003cscript\\u003e');
    expect(result).toContain('\\u003cdiv\\u003e');
  });

  it('should escape ampersands', () => {
    const obj = { url: 'https://example.com?a=1&b=2' };
    const result = safeJsonStringify(obj);

    expect(result).not.toContain('&');
    expect(result).toContain('\\u0026');
  });

  it('should escape line and paragraph separators', () => {
    const obj = {
      lineSep: 'Hello\u2028World',
      paraSep: 'Hello\u2029World'
    };
    const result = safeJsonStringify(obj);

    expect(result).toContain('Hello\\u2028World');
    expect(result).toContain('Hello\\u2029World');
  });

  it('should handle undefined values gracefully', () => {
    expect(safeJsonStringify(undefined)).toBe('undefined');
  });

  it('should handle null values correctly', () => {
    expect(safeJsonStringify(null)).toBe('null');
  });

  it('should handle arrays correctly', () => {
    const arr = [1, '</script>', 3];
    const result = safeJsonStringify(arr);

    expect(result).toBe('[1,"\\u003c/script\\u003e",3]');
  });
});
