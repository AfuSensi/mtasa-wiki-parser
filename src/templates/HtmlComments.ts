const REGEX: RegExp = /<!--([\s\S]*?)-->/g;

export function parse(input: string): string {
    // Parse template
    return input.replace(REGEX, '');
}
