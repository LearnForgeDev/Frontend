export function haveSameNonEmptyIds(leftIds: string[], rightIds: string[]): boolean {
  const left = new Set(leftIds);
  const right = new Set(rightIds);

  if (left.size === 0 || left.size !== right.size) {
    return false;
  }

  return Array.from(left).every((id) => right.has(id));
}
