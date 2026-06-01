import React from "react";
// @ts-ignore
import logoLightUrl from "../assets/images/elite_pro_original_logo_1780145973827.png";
// @ts-ignore
import logoDarkUrl from "../assets/images/elite_pro_dark_with_tagline_1780294335567.png";

interface EliteProLogoProps {
  className?: string;
  scale?: number;
  darkMode?: boolean;
}

export default function EliteProLogo({ className = "", scale = 1, darkMode = false }: EliteProLogoProps) {
  // Use light logo mode by default, unless darkMode is explicitly set to true.
  const logoUrl = darkMode ? logoDarkUrl : logoLightUrl;

  return (
    <div 
      className={`flex items-center justify-center select-none ${className}`} 
      style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
    >
      <img
        src={logoUrl}
        alt="Elite Pro Logo"
        className="object-contain"
        style={{ width: "500px", height: "100px" }}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}



