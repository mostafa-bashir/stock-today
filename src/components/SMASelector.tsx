import React from "react";

interface SMASelectorProps {
  periods: number[];
  selected: number[];
  onChange: (period: number) => void;
}

export const SMASelector: React.FC<SMASelectorProps> = ({ periods, selected, onChange }) => (
  <div className="mb-4 flex gap-4">
    {periods.map((period) => (
      <label key={period} className="flex items-center gap-1">
        <input
          type="checkbox"
          checked={selected.includes(period)}
          onChange={() => onChange(period)}
        />
        SMA {period}
      </label>
    ))}
  </div>
); 