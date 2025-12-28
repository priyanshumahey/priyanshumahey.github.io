import Image from "next/image"
import Link from "next/link"

interface EmploymentCardProps {
    logo: string
    department: string
    company: string
    link?: string
}

export default function EmploymentCard({ logo, department, company, link }: EmploymentCardProps) {
    const cardContent = (
        <div className="flex items-center gap-3 rounded-lg bg-[#1a1a1a] hover:bg-[#222222] transition-colors px-4 py-3 w-full border border-[#2a2a2a]">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#252525] flex-shrink-0 overflow-hidden">
                <Image
                    src={logo}
                    alt={`${company} logo`}
                    width={32}
                    height={32}
                    className="object-contain"
                />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-white leading-tight">{department}</span>
                <span className="text-sm text-[#737373] leading-tight">{company}</span>
            </div>
        </div>
    )

    if (link) {
        return (
            <Link href={link} className="block">
                {cardContent}
            </Link>
        )
    }

    return cardContent
}

// Compact variant for resume/list views
export function EmploymentCardCompact({ logo, department, company, link }: EmploymentCardProps) {
    const cardContent = (
        <div className="flex items-center gap-3 py-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#1f1f1f] flex-shrink-0 overflow-hidden">
                <Image
                    src={logo}
                    alt={`${company} logo`}
                    width={28}
                    height={28}
                    className="object-contain"
                />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-base font-medium text-white leading-tight">{department}</span>
                <span className="text-sm text-[#888888] leading-tight">{company}</span>
            </div>
        </div>
    )

    if (link) {
        return (
            <Link href={link} className="block hover:opacity-80 transition-opacity">
                {cardContent}
            </Link>
        )
    }

    return cardContent
}
