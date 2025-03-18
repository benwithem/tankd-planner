// Generate a random number between min and max based on a string seed
function seededRandom(seed: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  const random = Math.abs(Math.sin(hash));
  return min + (random * (max - min));
}

// Fish color palette - vibrant aquatic colors
const fishHues = [
  { h: 195, s: 85, l: 55 }, // Vibrant Ocean Blue
  { h: 210, s: 90, l: 60 }, // Electric Blue
  { h: 185, s: 80, l: 45 }, // Deep Aqua
  { h: 205, s: 95, l: 50 }, // Tropical Blue
  { h: 175, s: 75, l: 55 }, // Reef Blue
  { h: 225, s: 85, l: 65 }, // Neon Blue
  { h: 165, s: 80, l: 50 }, // Marine Teal
  { h: 215, s: 90, l: 45 }, // Deep Sea Blue
  { h: 180, s: 85, l: 60 }, // Crystal Blue
  { h: 200, s: 95, l: 55 }, // Betta Blue
];

// Plant color palette - lush natural greens
const plantHues = [
  { h: 125, s: 75, l: 35 }, // Rich Forest
  { h: 145, s: 85, l: 30 }, // Deep Emerald
  { h: 95, s: 70, l: 40 }, // Moss Green
  { h: 155, s: 80, l: 25 }, // Dark Jungle
  { h: 135, s: 65, l: 45 }, // Vibrant Sage
  { h: 165, s: 60, l: 35 }, // Deep Sea Plant
  { h: 115, s: 75, l: 40 }, // Fresh Leaf
  { h: 140, s: 90, l: 30 }, // Rich Pine
  { h: 150, s: 85, l: 35 }, // Tropical Leaf
  { h: 130, s: 70, l: 45 }, // Aquatic Plant
];

/**
 * Generates a consistent color based on a name string
 * @param name The string to generate a color from
 * @param isPlant Whether to use the plant color palette (green hues) instead of fish palette (blue hues)
 * @returns An HSL color string
 */
export function getConsistentColor(name: string, isPlant: boolean = false): string {
  const palette = isPlant ? plantHues : fishHues;
  const index = Math.floor(seededRandom(name, 0, palette.length));
  const baseColor = palette[index];
  
  // Add slight random variation to make each instance unique but consistent
  const hueVariation = seededRandom(name + '_hue', -10, 10);
  const satVariation = seededRandom(name + '_sat', -5, 5);
  const lightVariation = seededRandom(name + '_light', -5, 5);
  
  return `hsl(${baseColor.h + hueVariation}, ${baseColor.s + satVariation}%, ${baseColor.l + lightVariation}%)`;
}

/**
 * Calculates the relative luminance of an HSL color
 * @param hsl HSL color string in the format "hsl(h, s%, l%)"
 * @returns The relative luminance value between 0 and 1
 */
function getLuminance(hsl: string): number {
  // Extract the lightness value from the HSL string
  const match = hsl.match(/hsl\(\s*\d+\s*,\s*\d+%\s*,\s*(\d+)%\s*\)/);
  if (!match) return 0.5; // Default to middle lightness if parsing fails
  
  const lightness = parseInt(match[1], 10);
  return lightness / 100; // Convert percentage to decimal
}

/**
 * Determines a contrasting color (white or a light color) for text/icons to be visible against a background
 * @param backgroundColor The background color as an HSL string
 * @returns A contrasting color for text/icons
 */
export function getContrastColor(backgroundColor: string): string {
  const luminance = getLuminance(backgroundColor);
  
  // For darker backgrounds, use white or a very light color
  if (luminance < 0.6) {
    return 'hsl(0, 0%, 100%)'; // White
  }
  
  // For lighter backgrounds, use a dark blue/teal that's not black
  return 'hsl(210, 80%, 25%)'; // Dark blue
}