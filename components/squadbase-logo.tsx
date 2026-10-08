import Image from "next/image";

interface SquadbaseLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark";
  showText?: boolean;
  className?: string;
  tagline?: string;
}

const sizeConfig = {
  sm: { icon: 28, text: "text-base", sub: "text-[9px]" },
  md: { icon: 36, text: "text-xl", sub: "text-[10px]" },
  lg: { icon: 48, text: "text-2xl", sub: "text-xs" },
  xl: { icon: 64, text: "text-3xl", sub: "text-sm" },
};

export function SquadbaseLogo({
  size = "md",
  variant = "light",
  showText = true,
  className = "",
  tagline,
}: SquadbaseLogoProps) {
  const cfg = sizeConfig[size];
  const isLight = variant === "light";

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative shrink-0 flex items-center justify-center drop-shadow-xs">
        <Image
          src="/logo.png"
          alt="Squadbase Logo"
          width={cfg.icon}
          height={cfg.icon}
          priority
          unoptimized
          className="object-contain"
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight ${cfg.text} ${
                isLight ? "text-white" : "text-navy-950"
              }`}
            >
              SQUADBASE
            </span>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-500" />
          </div>
          {tagline ? (
            <span
              className={`mt-0.5 font-bold uppercase tracking-widest ${cfg.sub} ${
                isLight ? "text-gold-400" : "text-gold-600"
              }`}
            >
              {tagline}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
