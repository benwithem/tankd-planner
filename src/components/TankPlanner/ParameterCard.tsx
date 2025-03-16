import { type ReactNode } from 'react';

interface ParameterCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  status: 'success' | 'warning' | 'danger';
}

export function ParameterCard({ label, value, icon, status }: ParameterCardProps) {
  const statusColors = {
    success: 'border-green-200 bg-green-50/50',
    warning: 'border-yellow-200 bg-yellow-50/50',
    danger: 'border-red-200 bg-red-50/50'
  } as const;

  return (
    <div className={`text-center p-3 rounded-lg backdrop-blur-sm border ${statusColors[status]}`}>
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-xs font-medium text-gray-600">{label}</div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}