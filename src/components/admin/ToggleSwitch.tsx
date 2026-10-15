
'use client';

import { type ReactNode } from 'react';

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
  hint,
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <div className='flex items-start'>
      <div className='flex items-center h-5'>
        <input
          type='checkbox'
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className='h-4 w-4 rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]'
          disabled={disabled}
        />
      </div>
      <div className='ml-3 text-sm'>
        {label && <div className='font-medium'>{label}</div>}
        {hint && <p className='text-xs text-[var(--text-dim)]'>{hint}</p>}
      </div>
    </div>
  );
}
