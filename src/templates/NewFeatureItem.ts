/* New feature/item Template:
1. Version in numeric format
2. Version in release format
3. Revision
4. Description
*/
// {{New feature/item|3.0140|1.4.0|6715|This function checks whether MTA has frozen an element because it is above map objects which are still loading or not.}}
// Output: This function checks whether MTA has frozen an element because it is above map objects which are still loading or not.

/* New items Template:
1. Version in numeric format
2. Version in release format
4. Description
*/
// {{New items|3.0153|1.5.3|
// This function intelligently outputs debug messages into the Debug Console.  It is similar to [[outputDebugString]], but outputs useful information for '''any''' variable type, and does not require use of Lua's tostring.  This includes information about element types, and table structures.  It is especially useful for quick debug tasks.
// }}

const REGEX: RegExp = /{{New feature\/item\|(.*?)}}/g;
const REGEX2: RegExp = /{{New items\|(.*?)}}/g;
export function parse(input: string): string {
  // Parse template
  input = input.replace(REGEX, (match, p1: string) => {
    const split = p1.split('|');
    return split.length >= 4 ? split.slice(3).join('|') : '';
  });
  input = input.replace(REGEX2, (match, p1: string) => {
    const split = p1.split('|');
    return split.length >= 3 ? split.slice(2).join('|') : '';
  });
  return input;
}
