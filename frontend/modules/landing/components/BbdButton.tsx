'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

export type BbdButtonVariant = 'purple' | 'white' | 'orange' | 'green';

interface BbdButtonProps {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: BbdButtonVariant;
  className?: string;
  external?: boolean;
}

const variantClasses: Record<
  BbdButtonVariant,
  { button: string; iconCircle: string }
> = {
  purple: {
    button: 'bg-[#8F1025] text-[#FCE0E4]',
    iconCircle: 'bg-[#FCE0E4] text-[#8F1025]',
  },
  white: {
    button: 'bg-white text-[#290006]',
    iconCircle: 'bg-[#C32942] text-white',
  },
  orange: {
    button: 'bg-white text-[#54230C]',
    iconCircle: 'bg-[#ED7B32] text-[#FFF0E5]',
  },
  green: {
    button: 'bg-[#32965C] text-[#EAF8EE]',
    iconCircle: 'bg-[#EAF8EE] text-[#32965C]',
  },
};

function DiagonalArrowSvg() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4.5 11.5L11.5 4.5M11.5 4.5H5.5M11.5 4.5V10.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function BbdButton({
  label,
  href,
  onClick,
  variant = 'purple',
  className,
  external = false,
}: BbdButtonProps) {
  const styles = variantClasses[variant];

  const inner = (
    <>
      <span className={cn('bbd-btn__icon-left', styles.iconCircle)}>
        <DiagonalArrowSvg />
      </span>
      <span className="bbd-btn__text">{label}</span>
      <span className={cn('bbd-btn__icon-right', styles.iconCircle)}>
        <DiagonalArrowSvg />
      </span>
    </>
  );

  const combinedClass = cn('bbd-btn', styles.button, className);

  if (href) {
    if (external || href.startsWith('http') || href.startsWith('mailto:')) {
      return (
        <a
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noreferrer' : undefined}
          className={combinedClass}
        >
          {inner}
        </a>
      );
    }

    return (
      <Link href={href} onClick={onClick} className={combinedClass}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={combinedClass}>
      {inner}
    </button>
  );
}
