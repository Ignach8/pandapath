export const shuffle = <T,>(arr: readonly T[]): T[] => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const sample = <T,>(arr: readonly T[], n: number): T[] => shuffle(arr).slice(0, n);

export const pickOne = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
