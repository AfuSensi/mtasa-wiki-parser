/* New feature/item Template:
1. Version in numeric format
2. Version in release format
3. Revision
4. Description
*/
// {{New feature/item|3.0140|1.4.0|6715|This function checks whether MTA has frozen an element because it is above map objects which are still loading or not.}}
// Output: Deprecated = "Use ${2} instead"

const REGEX: RegExp = /{{New feature\/item\|.*?\|.*?\|.*?\|(.*?)}}/g;

export function parse(input: string): string {
  // Parse template
  input = input.replace(REGEX, '$1');
  return input;
}
