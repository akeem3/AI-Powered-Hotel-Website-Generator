/**
 * Utility functions for safely serializing data to JSON for injection into HTML pages.
 */

/**
 * Safely serializes a JavaScript object into a JSON string that can be safely
 * embedded within a <script> tag.
 *
 * This function escapes characters like `<`, `>`, `&`, `\u2028`, and `\u2029`
 * to their Unicode equivalents to prevent Cross-Site Scripting (XSS) vulnerabilities
 * when the JSON is placed directly into HTML.
 *
 * @param obj The object to serialize
 * @returns A safely serialized JSON string
 */
export function safeJsonStringify(obj: unknown): string {
  const json = JSON.stringify(obj);

  if (json === undefined) {
    return 'undefined';
  }

  return json
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    // Escape U+2028 (Line Separator) and U+2029 (Paragraph Separator)
    // as they are valid JSON but invalid in JavaScript strings and can cause syntax errors.
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
