const REGEX: RegExp = /\[\[.*?\|(.*?)\]\]/g;
const REGEX2: RegExp = /\[\[(.{1,}?)\]\]/g;
export function parse(input: string): string {
  // Parse template
  input = input.replace(REGEX, '$1');
  input = input.replace(REGEX2, '$1');
  return input;
}
