/* OOP Template:
1. Note:
2. Method: [[element]]:function(...)
3. Variable: .var
4. Counterpart: functionName */
// {{OOP|Set the variable to nil to execute [[removePedFromVehicle]]|[[ped]]:warpIntoVehicle|vehicle|getPedOccupiedVehicle}}

const REGEX: RegExp = /{{OOP\|(.*?)}}/g;

export function parse(input: string): string {
  // Replace [[name]] with *name*
  input = input.replace(/\[\[(.*?)\]\]/g, '*$1*');
  // Parse template
  input = input.replace(REGEX, (match, p1: string) => {
    let parsed = '==OOP Syntax==\n';
    for (const [i, line] of p1.split('|').entries()) {
      switch (i + 1) {
        case 1:
          parsed = line.length > 0 ? `${parsed}**Note:** ${line}\n` : parsed;
          break;
        case 2:
          parsed = line.length > 0 ? `${parsed}**Method:** ${line}(...)\n` : parsed;
          break;
        case 3:
          parsed = line.length > 0 ? `${parsed}**Variable:** .${line}\n` : parsed;
          break;
        case 4:
          parsed = line.length > 0 ? `${parsed}**Counterpart:** ${line}\n` : parsed;
          break;
      }
    }
    return parsed;
  });
  return input;
}
