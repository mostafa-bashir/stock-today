import React from "react";

interface OhlcDisplayProps {
  date: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export const OhlcDisplay: React.FC<OhlcDisplayProps> = ({ date, open, high, low, close, volume }) => (
  <div className="mb-4 p-4 bg-white rounded shadow flex flex-wrap gap-4 items-center text-lg">
    <span className="font-bold text-xl">{new Date(date).toLocaleDateString()}</span>
    <span>O <span className="text-green-700">{open}</span></span>
    <span>H <span className="text-green-700">{high}</span></span>
    <span>L <span className="text-red-700">{low}</span></span>
    <span>C <span className="font-bold">{close}</span></span>
    <span>Vol <span className="text-purple-700">{volume}</span></span>
  </div>
); 