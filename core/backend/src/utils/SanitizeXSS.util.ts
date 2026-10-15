/**
 *  Sanitize input text, remove html code
 * @param text string provided
 */
export function SanitizeXSS(text: string): string {
  return text
    .replace(/>/g, '&gt')
    .replace(/</g, '&lt')
    .replace(/"/g, '&quot')
    .replace(/\//g, '&#xF2')
    .replace(/'/, '&#x27');
}
