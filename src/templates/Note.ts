/* Deprecated Template:
1. TEXT for the note
*/
// {{Note|TEXT for the note}}

const REGEX: RegExp = /{{Note\|(.*?)}}/g;

export function parse(input: string): string {
  // Parse template
  input = input.replace(REGEX, (match, p1: string) => {
    let parsed = '**Note**: ';
    for (const [i, line] of p1.split('|').entries()) {
      switch (i + 1) {
        case 1:
          parsed = line.length > 0 ? `${parsed} ${line}` : parsed;
          break;
      }
    }
    return `${parsed}\n`;
  });
  return input;
}
