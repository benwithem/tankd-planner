/** @jsxImportSource react */
import * as React from 'react';
import { Fish, Leaf } from 'lucide-react';
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/ui/hover-card';
import type { TankItem, PlantItem, TankParameters, TankDimensions } from './types';
import { cn } from '@/lib/utils';
import { checkFishCompatibility, checkTankParameters, getWaterColor } from '@/utils/compatibility-utils';
import { getConsistentColor } from '@/utils/color-utils';

// Define animation classes
const swimAnimationClass = "animate-[swim_20s_ease-in-out_infinite]";
const swimReverseClass = "animate-[swim-reverse_20s_ease-in-out_infinite]";
const plantAnimationClass = "animate-[sway_4s_ease-in-out_infinite]";

// Get swim level vertical position 
const getVerticalPosition = (swimLevel: string | undefined, tankHeight: number): number => {
  switch (swimLevel) {
    case 'top': return tankHeight * 0.25;
    case 'bottom': return tankHeight * 0.75;
    default: return tankHeight * 0.5; // middle
  }
};

// Decorative elements for the tank
const DecorativePlant = ({ position, height, delay = 0 }: { position: number; height: number; delay?: number }) => (
  <div
    className={cn("absolute bottom-6", plantAnimationClass)}
    style={{
      left: `${position}%`,
      width: '20px',
      height: `${height}px`,
      background: 'linear-gradient(180deg, #2d5a27 0%, #1a4314 100%)',
      clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
      animationDelay: `${delay}s`,
    }}
  />
);

// Real plant component
const PlantComponent = ({ 
  plant,
  position,
  isCompatible
}: { 
  plant: PlantItem;
  position: { x: number; y: number };
  isCompatible: boolean;
}) => {
  const plantSize = plant.tankSize.recommended / 10; // Scale plant size based on recommended tank size
  const size = Math.max(30, Math.min(60, plantSize)); // Clamp size between 30-60px
  const plantColor = getConsistentColor(plant.scientificName, true);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div
          className={cn(
            "absolute flex items-center justify-center transition-opacity",
            plantAnimationClass,
            !isCompatible && "opacity-50"
          )}
          style={{
            left: position.x,
            bottom: position.y,
            width: size,
            height: size * 1.5,
          }}
        >
          <Leaf 
            style={{
              width: size,
              height: size,
              color: plantColor
            }}
          />
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">{plant.name}</h4>
          <p className="text-xs text-muted-foreground italic">{plant.scientificName}</p>
          <div className="text-xs space-y-1">
            <div>Care Level: {plant.careLevel}</div>
            <div>Lighting: {plant.lighting}</div>
            <div>CO₂: {plant.co2}</div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const Rock = ({ position, size }: { position: number; size: number }) => (
  <div
    className="absolute bottom-6"
    style={{
      left: `${position}%`,
      width: `${size}px`,
      height: `${size * 0.8}px`,
      background: 'linear-gradient(135deg, #8b8b8b 0%, #4a4a4a 100%)',
      borderRadius: '30% 70% 50% 50% / 50% 30% 70% 50%',
      transform: `rotate(${Math.random() * 360}deg)`,
    }}
  />
);

const Decorations = () => (
  <>
    {/* Sand/gravel bottom */}
    <div 
      className="absolute bottom-0 left-0 right-0 h-8"
      style={{
        background: 'linear-gradient(180deg, #e2c49f 0%, #d4b48c 100%)',
        borderRadius: '0 0 0.5rem 0.5rem'
      }}
    />
    
    {/* Rocks */}
    <Rock position={15} size={30} />
    <Rock position={40} size={25} />
    <Rock position={65} size={35} />
    
    {/* Decorative Plants */}
    <DecorativePlant position={25} height={60} />
    <DecorativePlant position={45} height={50} delay={0.5} />
    <DecorativePlant position={75} height={70} delay={1} />
    
    {/* Bubbles */}
    {[...Array(5)].map((_, i) => (
      <div
        key={`bubble-${i}`}
        className="absolute w-2 h-2 rounded-full bg-white/30 animate-[bubble_3s_ease-in-out_infinite]"
        style={{
          left: `${85 + (i * 3)}%`,
          bottom: '8px',
          animationDelay: `${i * 0.5}s`,
        }}
      />
    ))}
  </>
);

// Custom fish component
const FishIcon = ({ 
  fish, 
  isCompatible,
  size = 24 
}: { 
  fish: TankItem, 
  isCompatible: boolean,
  size?: number 
}) => {
  const fishColor = getConsistentColor(fish.name, false);
  
  return (
    <Fish 
      className={cn(
        "transition-colors",
        !isCompatible ? "opacity-70" : "opacity-100"
      )}
      style={{
        width: size,
        height: size * 0.6,
        color: fishColor
      }}
    />
  );
};

// Function to generate a unique color based on fish slug/id
const generateFishColor = (id: string) => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

interface TankVisualizationProps {
  dimensions: TankDimensions;
  fish: TankItem[];
  plants: PlantItem[];
  parameters: TankParameters;
  className?: string;
}

export function TankVisualization({
  dimensions,
  fish,
  plants,
  parameters,
  className,
}: TankVisualizationProps): React.ReactElement {
  const { lengthCm, widthCm, heightCm } = dimensions;

  const tankDimensions = React.useMemo(() => {
    // Convert cm to pixels with a dynamic scale factor
    const maxWidth = 800;
    const maxHeight = 600;
    
    // Calculate scale factors for both dimensions
    const widthScale = maxWidth / lengthCm;
    const heightScale = maxHeight / heightCm;
    
    // Use the smaller scale to maintain aspect ratio
    const scale = Math.min(widthScale, heightScale, 4); // Cap at 4x to prevent excessive scaling
    
    return {
      width: lengthCm * scale,
      height: heightCm * scale,
      depth: widthCm * scale,
    };
  }, [lengthCm, heightCm, widthCm]);

  // Calculate positions for each fish instance based on quantity
  const fishPositions = React.useMemo(() => {
    const positions: Array<{ x: number; y: number; z: number; fish: TankItem; direction: 'left' | 'right' }> = [];
    
    fish.forEach((fish) => {
      const count = fish.quantity ?? 1; // Default to 1 if quantity is undefined
      for (let i = 0; i < count; i++) {
        // Create a pseudo-random but stable position for each fish
        const hashBase = fish.slug.length + i;
        
        // Horizontal position based on random distribution
        const x = (Math.sin(hashBase * 0.7) * 0.4 + 0.5) * tankDimensions.width;
        
        // Vertical position based on the fish's preferred swimming level
        const baseY = getVerticalPosition(fish.swimLevel, tankDimensions.height);
        const y = baseY + (Math.cos(hashBase * 0.9) * 0.2 * tankDimensions.height);
        
        const z = (Math.sin(hashBase * 1.1) * 0.4 + 0.5) * tankDimensions.depth;
        
        // Alternate swimming direction based on index
        const direction = i % 2 === 0 ? 'right' : 'left';
        
        positions.push({ x, y, z, fish, direction });
      }
    });

    return positions;
  }, [fish, tankDimensions]);

  // Calculate positions for each plant instance based on quantity
  const plantPositions = React.useMemo(() => {
    const positions: Array<{ x: number; y: number; plant: PlantItem }> = [];
    
    plants.forEach(plant => {
      const count = plant.quantity ?? 1; // Default to 1 if quantity is undefined
      for (let i = 0; i < count; i++) {
        // Create a pseudo-random but stable position for each plant
        const hashBase = plant.scientificName.length + i;
        
        // Horizontal position based on random distribution
        const x = (Math.sin(hashBase * 0.7) * 0.4 + 0.5) * tankDimensions.width;
        
        // Vertical position is always at the bottom with slight variation
        const y = 20 + (Math.cos(hashBase * 0.9) * 10);
        
        positions.push({ x, y, plant });
      }
    });

    return positions;
  }, [plants, tankDimensions]);

  // Use our compatibility utilities to check for issues
  const compatibility = React.useMemo(() => {
    const fishCompatibility = checkFishCompatibility(fish);
    const tankCompatibility = checkTankParameters(fish, parameters);
    
    // Check plant compatibility with parameters
    const plantIssues: string[] = plants.flatMap(plant => {
      const issues: string[] = [];
      if (parameters.temperature < plant.waterParameters.temperature[0] ||
          parameters.temperature > plant.waterParameters.temperature[1]) {
        issues.push(`${plant.commonName} temperature requirements not met`);
      }
      if (parameters.ph < plant.waterParameters.pH[0] ||
          parameters.ph > plant.waterParameters.pH[1]) {
        issues.push(`${plant.commonName} pH requirements not met`);
      }
      return issues;
    });
    
    return {
      isCompatible: fishCompatibility.isCompatible && 
                   tankCompatibility.isCompatible && 
                   plantIssues.length === 0,
      issues: [...fishCompatibility.issues, ...tankCompatibility.issues, ...plantIssues]
    };
  }, [fish, plants, parameters]);

  // Get water color based on parameters and compatibility
  const waterColor = React.useMemo(() => 
    getWaterColor(parameters, compatibility.isCompatible),
    [parameters, compatibility.isCompatible]
  );

  return (
    <div className={cn("relative rounded-lg overflow-hidden", className)}>
      {/* Tank container */}
      <div
        className="relative"
        style={{
          width: tankDimensions.width,
          height: tankDimensions.height,
          background: waterColor,
        }}
      >
        {/* Decorative elements */}
        <Decorations />

        {/* Render fish */}
        {fishPositions.map((pos, idx) => (
          <HoverCard key={`${pos.fish.slug}-${idx}`}>
            <HoverCardTrigger asChild>
              <div
                className={cn(
                  "absolute transition-all",
                  pos.direction === 'right' ? swimAnimationClass : swimReverseClass,
                  pos.direction === 'left' && "scale-x-[-1]"
                )}
                style={{
                  left: pos.x,
                  top: pos.y,
                  transform: `translateZ(${pos.z}px)`,
                }}
              >
                <FishIcon 
                  fish={pos.fish} 
                  isCompatible={compatibility.isCompatible}
                  size={Math.max(24, pos.fish.size * 2)}
                />
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">{pos.fish.name}</h4>
                <p className="text-xs text-muted-foreground italic">{pos.fish.scientificName}</p>
                <div className="text-xs space-y-1">
                  <div>Size: {pos.fish.size}cm</div>
                  <div>Temperature: {pos.fish.waterParameters.temperature[0]}-{pos.fish.waterParameters.temperature[1]}°C</div>
                  <div>pH: {pos.fish.waterParameters.pH[0]}-{pos.fish.waterParameters.pH[1]}</div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}

        {/* Render plants */}
        {plantPositions.map((pos, idx) => (
          <PlantComponent
            key={`${pos.plant.scientificName}-${idx}`}
            plant={pos.plant}
            position={{ x: pos.x, y: pos.y }}
            isCompatible={compatibility.isCompatible}
          />
        ))}

        {/* Glass reflection effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(
                to bottom right,
                rgba(255,255,255,0.1) 0%,
                rgba(255,255,255,0.05) 20%,
                transparent 30%,
                transparent 100%
              )
            `
          }}
        />
      </div>
    </div>
  );
}
