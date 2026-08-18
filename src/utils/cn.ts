export function cn(...classes: (string | undefined | null | false | Record<string, boolean>)[]): string {
  const result: string[] = [];

  classes.forEach((cls) => {
    if (!cls) return;
    if (typeof cls === 'string') {
      result.push(cls);
    } else if (typeof cls === 'object') {
      Object.entries(cls).forEach(([key, val]) => {
        if (val) result.push(key);
      });
    }
  });

  return result.join(' ');
}
