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