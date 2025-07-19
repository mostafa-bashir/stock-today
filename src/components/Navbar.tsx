import React from "react";

export const Navbar: React.FC = () => (
  <nav className="w-full bg-[#18191A] px-4 sm:px-6 py-2 sm:py-3 flex items-center border-b border-[#222]">
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="bg-green-500 rounded-xl w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center">
        {/* Chart Arrow Icon (SVG) */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-7 sm:h-7 w-5 h-5"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>
      </div>
      <span className="text-green-500 text-lg sm:text-2xl font-bold whitespace-nowrap">Stock Today</span>
    </div>
  </nav>
); 