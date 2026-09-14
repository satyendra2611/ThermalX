import React from 'react';

type Variant = 'primary' | 'ghost' | 'learning' | 'practice' | 'improve';

const styles: Record<Variant, string> = {
  primary: 'bg-sb-blue text-[#12303f] hover:brightness-95',
  ghost: 'bg-white border border-sb-border text-sb-text hover:border-sb-blue',
  learning: 'bg-sb-gold text-[#4a3510] hover:brightness-95',
  practice: 'bg-sb-peach text-[#4a2c10] hover:brightness-95',
  improve: 'bg-sb-coral text-[#4a1414] hover:brightness-95',
};

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export default function Button({ variant = 'primary', className = '', children, ...rest }: Props) {
  return (
    <button
      className={`rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
