"use client";

import React from 'react';
import { FeatureCard, type FeatureCardProps } from './FeatureCard';
import { CheckCircle, Fish, Droplet } from 'lucide-react';

const features: FeatureCardProps[] = [
  {
    title: 'Easy Tank Setup',
    description: 'Configure your tank size, water parameters, and more in just a few clicks.',
    Icon: CheckCircle,
  },
  {
    title: 'Comprehensive Fish Guide',
    description: 'Browse detailed profiles to choose fish that thrive together.',
    Icon: Fish,
  },
  {
    title: 'Compatibility Checker',
    description: 'Automatically analyze your selected fish to ensure a harmonious aquarium.',
    Icon: Droplet,
  },
];

export function FeatureCardWrapper() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {features.map((feature, i) => (
        <FeatureCard key={i} {...feature} />
      ))}
    </div>
  );
}