"use client"

import Image from "next/image"

export function IndexCalHeroCard() {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden rounded-xl bg-[#020617]">
            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/30 via-blue-500/10 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-tl from-blue-400/25 via-transparent to-transparent" />

            {/* Dot pattern */}
            <div className="absolute inset-0 opacity-[0.15]">
                <svg width="100%" height="100%">
                    <defs>
                        <pattern id="dots-cal" width="16" height="16" patternUnits="userSpaceOnUse">
                            <circle cx="8" cy="8" r="1" fill="white" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dots-cal)" />
                </svg>
            </div>

            {/* Centered icon */}
            <div className="relative z-10 flex h-full items-center justify-center">
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 lg:w-36 lg:h-36 rounded-2xl lg:rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-sky-500/10">
                    <Image
                        src="/projects/index-cal.png"
                        alt="Index Calendar"
                        fill
                        className="object-cover"
                    />
                </div>
            </div>
        </div>
    )
}
