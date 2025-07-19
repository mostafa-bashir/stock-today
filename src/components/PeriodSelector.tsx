import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Period {
  label: string;
  value: string;
}

interface PeriodSelectorProps {
  periods: Period[];
  selected: string;
  onChange: (value: string) => void;
  customStart: Date | null;
  customEnd: Date | null;
  setCustomStart: (date: Date | null) => void;
  setCustomEnd: (date: Date | null) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({ periods, selected, onChange, customStart, customEnd, setCustomStart, setCustomEnd }) => (
  <div className="mb-4 flex flex-wrap gap-4 items-center">
    {periods.map((p) => (
      <label key={p.value} className="flex items-center gap-1">
        <input
          type="radio"
          name="period"
          value={p.value}
          checked={selected === p.value}
          onChange={() => onChange(p.value)}
        />
        {p.label}
      </label>
    ))}
    {selected === "CUSTOM" && (
      <>
        <span>From:</span>
        <DatePicker
          selected={customStart}
          onChange={setCustomStart}
          selectsStart
          startDate={customStart || undefined}
          endDate={customEnd || undefined}
          maxDate={customEnd || new Date()}
          dateFormat="yyyy-MM-dd"
          placeholderText="Start date"
          className="border rounded px-2 py-1"
        />
        <span>To:</span>
        <DatePicker
          selected={customEnd}
          onChange={setCustomEnd}
          selectsEnd
          startDate={customStart || undefined}
          endDate={customEnd || undefined}
          minDate={customStart || undefined}
          maxDate={new Date()}
          dateFormat="yyyy-MM-dd"
          placeholderText="End date"
          className="border rounded px-2 py-1"
        />
      </>
    )}
  </div>
); 