/* Warning Template:
1. text
2. image
 */
// {{Warning|information|use warning image}}

const REGEX: RegExp = /{{Warning\|(.*?)}}/g;

export function parse(input: string): string {
  // Parse template
  input = input.replace(REGEX, (match, p1: string) => {
    let parsed = '**Warning**: ';
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
