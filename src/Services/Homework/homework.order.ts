export function nextHomeworkPosition(items: readonly { position?: number }[]) {
  return items.reduce((maximum, item) => Math.max(maximum, item.position ?? -1), -1) + 1;
}
