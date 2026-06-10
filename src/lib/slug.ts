export function slugify(input: string, fallback = 'adversaria'): string {
  return (
    input
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 60)
      .replace(/^-+|-+$/g, '') || fallback
  );
}
