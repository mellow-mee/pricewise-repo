/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface CurrencyDisplayProps {
  amountMinor: number;
  className?: string;
  showDecimals?: boolean;
  prefix?: string;
}

/**
 * Cleanly renders Indian Rupee amount with reliable glyph font rendering across all environments.
 */
export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amountMinor,
  className = '',
  showDecimals,
  prefix = '',
}) => {
  if (isNaN(amountMinor) || amountMinor === null || amountMinor === undefined) {
    return <span className={className}>₹0</span>;
  }

  const isNegative = amountMinor < 0;
  const absPaise = Math.abs(amountMinor);
  const rupees = absPaise / 100;
  const hasDecimalPart = absPaise % 100 !== 0;
  const shouldShowDecimals = showDecimals ?? hasDecimalPart;

  const formattedDigits = rupees.toLocaleString('en-IN', {
    minimumFractionDigits: shouldShowDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      {prefix && <span>{prefix}</span>}
      {isNegative && <span>-</span>}
      <span className="font-sans font-medium mr-0.5 select-none text-[0.95em]">₹</span>
      <span className="font-mono tracking-tight">{formattedDigits}</span>
    </span>
  );
};
