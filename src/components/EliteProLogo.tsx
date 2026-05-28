import React from "react";

interface EliteProLogoProps {
  className?: string;
  scale?: number;
}

export default function EliteProLogo({ className = "", scale = 1 }: EliteProLogoProps) {
  return (
    <div 
      className={`flex flex-col items-center select-none ${className}`} 
      style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
    >
      {/* Outer Rectangle with Gold Border */}
      <div 
        className="w-[210px] h-[58px] bg-black border-2 border-[#b38728] overflow-hidden shadow-2xl flex items-stretch"
      >
        {/* Left Half: Metallic Gold Gradient with Black text */}
        <div 
          className="flex-1 flex items-center justify-center px-2"
          style={{
            background: "linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)",
          }}
        >
          <span 
            className="text-black uppercase tracking-[0.05em] select-none"
            style={{
              fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
              fontSize: "25px",
              fontWeight: 900,
              lineHeight: "1.0",
            }}
          >
            ELITE
          </span>
        </div>

        {/* Middle Divider: pure gold */}
        <div className="w-[2px] bg-[#b38728]" />

        {/* Right Half: Black background with White text */}
        <div className="flex-1 bg-black flex items-center justify-center px-1">
          <span 
            className="text-white uppercase tracking-[0.02em] select-none"
            style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: "27px",
              fontWeight: 900,
              lineHeight: "1.0",
            }}
          >
            PRO
          </span>
        </div>
      </div>

      {/* Slogan Subtitle: TRUSTED FOR TRANSPARENCY centered below */}
      <div className="mt-1.5 text-center">
        <span 
          className="text-white text-[8px] uppercase font-bold tracking-[0.22em] block"
          style={{
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          TRUSTED FOR TRANSPARENCY
        </span>
      </div>
    </div>
  );
}
