export function cn(...classes: (string | undefined | false | null)[]) { // Updated type definition
  return classes.filter((cls) => cls).join(" "); // Filter out falsy values
}