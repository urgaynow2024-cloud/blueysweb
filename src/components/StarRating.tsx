"use client";

import { useState } from "react";

interface Props {
  value: number;
  onChange: (value: number) => void;
  readonly?: boolean;
}

export default function StarRating({ value, onChange, readonly }: Props) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`text-2xl transition-all ${
            star <= (hover || value) ? "text-[var(--accent)] scale-110" : "text-[var(--text-dim)]"
          } ${!readonly ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
