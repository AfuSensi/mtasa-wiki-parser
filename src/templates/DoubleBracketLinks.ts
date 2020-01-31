/* New feature/item Template:
1. Version in numeric format
2. Version in release format
3. Revision
4. Description
*/
// // [[event system#Event source|source]]
// Output: source

const REGEX: RegExp = /\[\[.*?\|(.*?)\]\]/g;

export function parse(input: string): string {
  // Parse template
  input = input.replace(REGEX, '$1');
  return input;
}
