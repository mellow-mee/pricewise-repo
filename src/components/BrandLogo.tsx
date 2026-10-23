/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface BrandLogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  showWordmark = true,
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`${iconSizes[size]} rounded-lg bg-[#1D4ED8] flex items-center justify-center text-white shadow-xs shrink-0`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4/6 h-4/6"
        >
          {/* Subtle balanced scale and price tag mark */}
          <path d="M12 3v18" />
          <path d="M5 8h14" />
          <path d="M5 8l-2 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2L7 8" />
          <path d="M19 8l-2 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2l-2-5" />
          <circle cx="12" cy="3" r="1.5" fill="currentColor" />
        </svg>
      </div>

      {showWordmark && (
        <span className={`font-semibold tracking-tight text-[#0F172A] ${textSizes[size]}`}>
          Pricewise
        </span>
      )}
    </div>
  );
};
