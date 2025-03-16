"use client";

import React from 'react';
import { cn } from '@/lib/utils';

export interface FeatureCardProps {
  title: string;
  description: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export function FeatureCard({ title, description, Icon }: FeatureCardProps) {
  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl p-6 flex flex-col items-center text-center",
      "border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:scale-[1.02]"
    )}>
      {Icon && <Icon className="h-12 w-12 text-cyan-600 dark:text-cyan-400 mb-4" />}
      <h3 className="text-xl md:text-2xl font-semibold mb-3 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">{description}</p>
    </div>
  );
}