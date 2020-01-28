/* Deprecated Template:
1. alternativeFunctionOrEvent
2. more text
*/
// {{Deprecated|alternativeFunctionOrEvent|more text}}
// Output: Deprecated = "Use ${2} instead"

const REGEX: RegExp = /{{Deprecated\|(.*?)}}/g;

export function parse(input: string): string {
  // Parse template
  input = input.replace(REGEX, (match, p1: string) => {
    let parsed = '**Deprecated**';
    for (const [i, line] of p1.split('|').entries()) {
      switch (i + 1) {
        case 1:
          parsed = line.length > 0 ? `${parsed}: Use ${line} instead.` : parsed;
          break;
        case 2:
          parsed = line.length > 0 ? `${parsed} ${line}` : parsed;
          break;
      }
    }
    return `${parsed}\n`;
  });
  return input;
}
