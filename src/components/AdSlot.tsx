import React from 'react';

interface AdSlotProps {
  label?: string;
  className?: string;
}

export function AdSlot({ label = 'Advertisement', className = '' }: AdSlotProps) {
  return (
    <div className={`bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center relative ${className}`}>
      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">
        {label}
      </span>
      <div className="absolute top-0 right-0 p-1">
        <span className="text-[8px] text-gray-300">AdChoices</span>
      </div>
    </div>
  );
}
