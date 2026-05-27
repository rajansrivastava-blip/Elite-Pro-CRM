import React from "react";

interface EliteProLogoProps {
  className?: string;
  inverseColors?: boolean; // useful if we want to tweak behavior
  scale?: number;
}

export default function EliteProLogo({ className = "", scale = 1 }: EliteProLogoProps) {
  // Let's create an elegant gold-and-black corporate logo matching the user's uploaded asset.
  return (
    <div className={`flex flex-col items-center select-none ${className}`} style={{ transform: `scale(${scale})`, transformOrigin: "center" }}>
      {/* Outer Rectangle with Gold Border */}
      <div className="border border-amber-500/95 bg-black rounded-sm flex items-stretch divide-x divide-amber-500/95 overflow-hidden shadow-md shadow-black/35">
        
        {/* Left Half: Metallic Gold Gradient with Black text */}
        <div className="bg-gradient-to-r from-[#b38728] via-[#ffd700] to-[#b38728] px-4 py-1 flex items-center justify-center">
          <span className="font-display font-black tracking-widest text-slate-950 text-xs sm:text-sm">
            ELITE
          </span>
        </div>

        {/* Right Half: Black background with White text */}
        <div className="bg-slate-950 px-4 py-1 flex items-center justify-center">
          <span className="font-display font-black tracking-widest text-white text-xs sm:text-sm">
            PRO
          </span>
        </div>

      </div>

      {/* Subtitle: TRUSTED FOR TRANSPARENCY centered below */}
      <div className="mt-1 flex items-center justify-center">
        <span className="text-[7.5px] sm:text-[8.5px] font-mono tracking-[0.2em] uppercase font-bold text-slate-300 dark:text-slate-300">
          TRUSTED FOR TRANSPARENCY
        </span>
      </div>
    </div>
  );
}
