const string = 'world';

export function hello(world: string = string): string {
  return `Hello ${world}! `;
}
