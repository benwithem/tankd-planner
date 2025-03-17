/** @jsxImportSource react */
import * as React from 'react';
import { Fish, Leaf } from 'lucide-react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import type { FishData, PlantData, TankParameters, TankDimensions } from './types';
import { cn } from '@/lib/utils';
import { checkFishCompatibility, checkTankParameters, getWaterColor } from '@/utils/compatibility-utils';
import { getConsistentColor } from '@/utils/color-utils';

// Define animation classes
const swimAnimationClass = "animate-[swim_20s_ease-in-out_infinite]";
const swimReverseClass = "animate-[swim-reverse_20s_ease-in-out_infinite]";
const plantAnimationClass = "animate-[sway_4s_ease-in-out_infinite]";

// Get swim level vertical position 
const getVerticalPosition = (location: string | undefined, tankHeight: number): number => {
  switch (location) {
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
  plant: PlantData;
  position: { x: number; y: number };
  isCompatible: boolean;
}) => {
  const plantSize = plant.tankSize.recommended || 30; // Add default value for tankSize
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

// Custom fish component
const FishIcon = ({ 
  fish, 
  isCompatible,
  size = 24 
}: { 
  fish: FishData, 
  isCompatible: boolean,
  size?: number 
}) => {
  const color = getConsistentColor(fish.scientificName, false);
  
  return (
    <div
      className={cn(
        "relative w-full h-full",
        !isCompatible && "opacity-50"
      )}
    >
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill={color}
        className="transform -scale-x-100"
      >
        <path d="M20 12c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8zm-8-5c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm3 5c0 1.7-1.3 3-3 3s-3-1.3-3-3 1.3-3 3-3 3 1.3 3 3zm-3-1c-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1-.4-1-1-1z"/>
      </svg>
    </div>
  );
};

interface TankVisualizationProps {
  dimensions: TankDimensions;
  fish: FishData[];
  plants: PlantData[];
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
    const gallons = (lengthCm * widthCm * heightCm) / 1000 || 0;
    return {
      width: Math.min(800, Math.max(300, lengthCm * 2)),
      height: Math.min(600, Math.max(200, heightCm * 2)),
      gallons
    };
  }, [lengthCm, widthCm, heightCm]);

  // Group fish by location for better organization
  const fishByLocation = React.useMemo(() => {
    const grouped = fish.reduce((acc, fish) => {
      const location = fish.location || 'middle';
      if (!acc[location]) acc[location] = [];
      acc[location].push(fish);
      return acc;
    }, {} as Record<string, FishData[]>);

    return {
      top: grouped.top || [],
      middle: grouped.middle || [],
      bottom: grouped.bottom || []
    };
  }, [fish]);

  // Calculate fish positions based on location
  const getFishPosition = (fish: FishData, index: number, total: number) => {
    const location = fish.location || 'middle';
    const y = getVerticalPosition(location, tankDimensions.height);
    const x = (tankDimensions.width * (index + 1)) / (total + 1);
    return { x, y };
  };

  // Calculate plant positions
  const plantPositions = React.useMemo(() => {
    return plants.map((plant, index) => {
      const x = (tankDimensions.width * (index + 1)) / (plants.length + 1);
      const y = 50; // Fixed height for now
      return { x, y };
    });
  }, [plants, tankDimensions.width]);

  return (
    <div 
      className={cn("relative overflow-hidden rounded-lg border bg-card", className)}
      style={{ 
        width: tankDimensions.width,
        height: tankDimensions.height,
        background: getWaterColor(parameters, fish),
      }}
    >
      {/* Decorative elements */}
      <DecorativePlant position={25} height={60} />
      <DecorativePlant position={45} height={50} delay={0.5} />
      <DecorativePlant position={75} height={70} delay={1} />
      <div 
        className="absolute bottom-0 left-0 right-0 h-8"
        style={{
          background: 'linear-gradient(180deg, #e2c49f 0%, #d4b48c 100%)',
          borderRadius: '0 0 0.5rem 0.5rem'
        }}
      />
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
      {/* Fish groups by location */}
      {Object.entries(fishByLocation).map(([location, locationFish]) => (
        <React.Fragment key={location}>
          {locationFish.map((fish, index) => {
            const position = getFishPosition(fish, index, locationFish.length);
            const isCompatible = checkFishCompatibility(fish, parameters).isCompatible;

            return (
              <div
                key={fish.slug}
                className={cn(
                  "absolute transition-opacity",
                  index % 2 === 0 ? swimAnimationClass : swimReverseClass
                )}
                style={{
                  left: position.x,
                  top: position.y,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div>
                      <FishIcon fish={fish} isCompatible={isCompatible} size={32} />
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">{fish.name}</h4>
                      <p className="text-xs text-muted-foreground italic">{fish.scientificName}</p>
                      <div className="text-xs space-y-1">
                        <div>Care Level: {fish.careLevel}</div>
                        <div>Temperament: {fish.temperament}</div>
                        <div>Location: {fish.location}</div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            );
          })}
        </React.Fragment>
      ))}

      {/* Plants */}
      {plants.map((plant, index) => {
        const position = plantPositions[index];
        const isCompatible = checkTankParameters(plant.waterParameters, parameters).isCompatible;

        return (
          <PlantComponent
            key={plant.scientificName}
            plant={plant}
            position={position}
            isCompatible={isCompatible}
          />
        );
      })}
    </div>
  );
}
