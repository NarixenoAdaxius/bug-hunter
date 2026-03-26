/** Compute 1-based line number for a byte index in source code. */
export function lineNumberAtIndex(code: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < code.length; i++) {
    if (code.charCodeAt(i) === 10) {
      line++;
    }
  }
  return line;
}
