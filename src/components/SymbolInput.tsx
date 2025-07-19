import React, { useState } from "react";

interface SymbolInputProps {
  value: string;
  onChange: (value: string) => void;
}

const POPULAR_SYMBOLS = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "BRK.A", "JPM", "V", "UNH", "HD", "PG", "MA", "DIS", "NFLX", "IBM", "INTC", "AMD", "BABA"
];

function isValidSymbol(symbol: string) {
  return /^[A-Z]{1,8}$/.test(symbol);
}

export const SymbolInput: React.FC<SymbolInputProps> = ({ value, onChange }) => {
  const [input, setInput] = useState(value);
  const [focused, setFocused] = useState(false);
  const suggestions =
    input.length > 0
      ? POPULAR_SYMBOLS.filter((s) => s.startsWith(input.toUpperCase()) && s !== input.toUpperCase())
      : [];
  const valid = isValidSymbol(input);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setInput(val);
    if (isValidSymbol(val)) {
      onChange(val);
    }
  };

  const handleSuggestionClick = (symbol: string) => {
    setInput(symbol);
    onChange(symbol);
  };

  return (
    <div className="mb-4 flex flex-col items-start gap-1 relative w-48">
      <div className="flex items-center gap-2 w-full">
        <label htmlFor="symbol-input" className="font-semibold">Symbol:</label>
        <input
          id="symbol-input"
          type="text"
          value={input}
          onChange={handleInputChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 100)}
          className={`border rounded px-2 py-1 w-24 text-center ${valid ? "border-gray-300" : "border-red-500"}`}
          maxLength={8}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      {!valid && input.length > 0 && (
        <span className="text-xs text-red-500 ml-20">Invalid symbol</span>
      )}
      {focused && suggestions.length > 0 && (
        <ul className="absolute left-20 top-10 bg-white text-black border border-gray-700 rounded shadow z-10 w-28 max-h-40 overflow-auto">
          {suggestions.map((s) => (
            <li
              key={s}
              className="px-2 py-1 text-black font-semibold hover:bg-black-800 hover:!text-black cursor-pointer"
              onMouseDown={() => handleSuggestionClick(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}; 