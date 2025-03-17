// Aquatic color scheme (blues, greens, purples)
const aquaticColors = [
  '#2C7DA0', // Blue
  '#468FAF', // Light Blue
  '#61A5C2', // Sky Blue
  '#89C2D9', // Pale Blue
  '#2D6A4F', // Forest Green
  '#40916C', // Sea Green
  '#52B788', // Mint
  '#74C69D', // Sage
  '#4C4C6D', // Navy Purple
  '#5C5C8A', // Lavender
  '#6B6BA7', // Periwinkle
  '#7A7AC4', // Light Purple
];

// Vegetative color scheme (greens, browns, yellows)
const vegetativeColors = [
  '#386641', // Forest Green
  '#4C956C', // Sage
  '#6BAA75', // Mint
  '#8AB87E', // Light Green
  '#94AF76', // Olive
  '#B4B471', // Yellow Green
  '#9B6B4E', // Brown
  '#7D5A44', // Dark Brown
  '#A47551', // Tan
  '#BF9169', // Light Brown
  '#D4B483', // Sand
  '#E6C99D', // Beige
];

// Function to get a consistent color based on a string (e.g., fish/plant name)
export function getConsistentColor(str: string, isAquatic: boolean = true): string {
  const colors = isAquatic ? aquaticColors : vegetativeColors;
  // Create a simple hash of the string
  const hash = str.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  // Use the hash to select a color
  return colors[Math.abs(hash) % colors.length];
}

// Function to get contrasting text color (black or white) based on background color
export function getContrastColor(hexcolor: string): string {
  // Convert hex to RGB
  const r = parseInt(hexcolor.slice(1, 3), 16);
  const g = parseInt(hexcolor.slice(3, 5), 16);
  const b = parseInt(hexcolor.slice(5, 7), 16);
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

// Export color arrays for direct use
export { aquaticColors, vegetativeColors };
