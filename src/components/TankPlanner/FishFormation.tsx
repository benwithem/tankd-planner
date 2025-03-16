import React from 'react';
import { Fish } from 'lucide-react';
import type { TankItem } from './types';

// Define fish position type for type safety
export interface FishPosition {
  x: number;
  y: number;
  size: number;
  flip: boolean;
  delay: number;
}

interface FishFormationProps {
  group: TankItem & { quantity: number; isAggressive: boolean };
  position: { x: number; y: number; radius: number };
  fishSize: number;
  getFishColor: (temperament: string | undefined) => string;
}

// Move the createFishFormation function above the FishFormation component
function createFishFormation(
  group: TankItem & { quantity: number; isAggressive: boolean }, 
  position: {x: number, y: number, radius: number},
  fishSize: number
): FishPosition[] {
  const { quantity } = group;
  
  // For very large groups (>15), use a more complex formation
  if (quantity > 15) {
    // Create a school formation with multiple layers
    return Array.from({ length: quantity }).map((_, i) => {
      // Determine which layer this fish belongs to
      const layerIndex = Math.floor(i / 8);
      const fishInLayer = Math.min(8, quantity - layerIndex * 8);
      const fishIndexInLayer = i % 8;
      
      // Calculate angle within the layer
      const angleOffset = (layerIndex % 2) * (Math.PI / fishInLayer); // Offset alternate layers
      const angle = ((fishIndexInLayer / fishInLayer) * Math.PI * 2) + angleOffset;
      
      // Radius increases with each layer, but with diminishing returns
      const layerRadius = position.radius * (0.3 + (layerIndex * 0.15));
      
      // Add some randomness
      const jitterX = Math.sin(i * 0.7) * (fishSize * 0.2);
      const jitterY = Math.cos(i * 0.9) * (fishSize * 0.2);
      
      // Calculate position in a circular/oval pattern
      const x = Math.cos(angle) * layerRadius + jitterX;
      const y = Math.sin(angle) * layerRadius * 0.7 + jitterY; // Flatten to oval
      
      return {
        x,
        y,
        size: fishSize * (0.8 + (Math.random() * 0.3)), // More size variation
        flip: Math.cos(angle) < 0, // Face direction of movement
        delay: i * 0.05 + (Math.random() * 0.3) // Shorter delays for large groups
      };
    });
  } 
  // For medium groups (6-15), use a school pattern
  else if (quantity > 5) {
    return Array.from({ length: quantity }).map((_, i) => {
      // Calculate position in a more natural school pattern
      const angle = (i / Math.max(1, quantity)) * Math.PI * 2;
      const distanceFromCenter = (position.radius * 0.6) * (0.4 + (Math.random() * 0.6));
      
      // Add some randomness
      const jitterX = Math.sin(i * 0.7) * (fishSize * 0.3);
      const jitterY = Math.cos(i * 0.9) * (fishSize * 0.3);
      
      // Calculate position in a circular/oval pattern
      const x = Math.cos(angle) * distanceFromCenter + jitterX;
      const y = Math.sin(angle) * distanceFromCenter * 0.7 + jitterY; // Flatten to oval
      
      return {
        x,
        y,
        size: fishSize * (0.9 + (Math.random() * 0.2)),
        flip: Math.cos(angle) < 0, // Face direction of movement
        delay: i * 0.1 + (Math.random() * 0.5)
      };
    });
  } 
  // For small groups (1-5), use a loose formation
  else {
    return Array.from({ length: quantity }).map((_, i) => {
      // For small groups, create a more scattered pattern
      const angle = (i / Math.max(1, quantity)) * Math.PI * 2;
      // More random positioning for small groups
      const distanceFromCenter = (position.radius * 0.5) * (0.3 + (Math.random() * 0.7));
      
      // Add more randomness for small groups
      const jitterX = Math.sin(i * 1.2) * (fishSize * 0.4);
      const jitterY = Math.cos(i * 1.5) * (fishSize * 0.4);
      
      const x = Math.cos(angle) * distanceFromCenter + jitterX;
      const y = Math.sin(angle) * distanceFromCenter + jitterY;
      
      return {
        x,
        y,
        size: fishSize * (0.9 + (Math.random() * 0.3)),
        flip: Math.random() > 0.5, // Random direction for small groups
        delay: i * 0.2 + (Math.random() * 0.8) // More varied delays
      };
    });
  }
}

export function FishFormation({ group, position, fishSize, getFishColor }: FishFormationProps) {
  // Get temperament for coloring
  const temperament = group.data && typeof group.data === 'object' && 
    'temperament' in group.data ? group.data.temperament as string : undefined;
  
  // Use the formation generator
  const fishPositions = createFishFormation(group, position, fishSize);
  
  // Get fish name
  const fishName = group.data && typeof group.data === 'object' && 
    'commonName' in group.data 
      ? group.data.commonName as string
      : 'Unknown';
  
  // Calculate label offset based on group size
  const labelYOffset = group.quantity > 15 
    ? position.radius * 0.9  // Move labels further down for large groups
    : position.radius * 0.8;  // Standard offset for smaller groups

  return (
    <g>
      {/* Group container */}
      <g transform={`translate(${position.x}, ${position.y})`}>
        {/* Render each fish in the group */}
        {fishPositions.map((pos, i) => (
          <g 
            key={`${group.slug}-${i}`} 
            className="animate-float"
            style={{ animationDelay: `${pos.delay}s` }}
          >
            {/* Background circle for contrast */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={pos.size * 0.6}
              fill="rgba(255,255,255,0.7)"
              opacity="0.8"
            />
            <g transform={`translate(${pos.x - (pos.size/2)}, ${pos.y - (pos.size/2)})`}>
              <Fish 
                size={pos.size}
                color={getFishColor(temperament)}
                style={{
                  filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.2))',
                  transform: pos.flip ? 'scaleX(-1)' : ''
                }}
              />
            </g>
          </g>
        ))}

        {/* Label for fish group - positioned at bottom of group */}
        <g transform={`translate(0, ${labelYOffset})`}>
          <rect
            x={-70}
            y={0}
            width={140}
            height={26}
            rx={13}
            fill="white"
            stroke="rgba(0,119,182,0.3)"
            strokeWidth="1"
          />
          <text
            x={0}
            y={18}
            textAnchor="middle"
            fontSize={14}
            fontWeight="600"
            fill="#0066a6"
          >
            {fishName}
            {group.quantity > 1 && ` (×${group.quantity})`}
          </text>
        </g>
      </g>
    </g>
  );
}

// Export the helper function separately
export { createFishFormation };