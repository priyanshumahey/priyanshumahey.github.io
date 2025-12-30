export interface Language {
    name: string
    percentage: number
}

const languageColors: Record<string, string> = {
    // Popular languages
    "Rust": "#dea584",
    "TypeScript": "#3178c6",
    "JavaScript": "#f1e05a",
    "Python": "#3572A5",
    "Go": "#00ADD8",
    "Java": "#b07219",
    "C": "#555555",
    "C++": "#f34b7d",
    "C#": "#178600",
    "Ruby": "#701516",
    "PHP": "#4F5D95",
    "Swift": "#F05138",
    "Kotlin": "#A97BFF",
    "Scala": "#c22d40",
    "Dart": "#00B4AB",
    "Lua": "#000080",
    "R": "#198CE7",
    "Julia": "#a270ba",
    "Haskell": "#5e5086",
    "Elixir": "#6e4a7e",
    "Clojure": "#db5855",
    "Erlang": "#B83998",
    "OCaml": "#3be133",
    "F#": "#b845fc",
    "Zig": "#ec915c",
    "Nim": "#ffc200",
    "Crystal": "#000100",
    // Web & markup
    "HTML": "#e34c26",
    "CSS": "#563d7c",
    "SCSS": "#c6538c",
    "Sass": "#a53b70",
    "Less": "#1d365d",
    "Vue": "#41b883",
    "Svelte": "#ff3e00",
    // Shell & config
    "Shell": "#89e051",
    "Bash": "#89e051",
    "PowerShell": "#012456",
    "Dockerfile": "#384d54",
    "Makefile": "#427819",
    "YAML": "#cb171e",
    "JSON": "#292929",
    "TOML": "#9c4221",
    "Markdown": "#083fa1",
    // Other
    "SQL": "#e38c00",
    "GraphQL": "#e10098",
    "WebAssembly": "#654ff0",
    "Solidity": "#AA6746",
}

function getLanguageColor(name: string): string {
    return languageColors[name] || "#6e7681"
}

interface LanguageBarProps {
    languages: Language[]
}

export function LanguageBar({ languages }: LanguageBarProps) {
    return (
        <div className="w-full space-y-3 mt-4">
            {/* Progress bar */}
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-[#1a1a1a]">
                {languages.map((lang) => (
                    <div
                        key={lang.name}
                        className="h-full transition-all duration-300"
                        style={{
                            width: `${lang.percentage}%`,
                            backgroundColor: getLanguageColor(lang.name),
                        }}
                        title={`${lang.name} ${lang.percentage}%`}
                    />
                ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-2">
                {languages.map((lang) => (
                    <div key={lang.name} className="flex items-center gap-1.5">
                        <span className="size-3 rounded-full" style={{ backgroundColor: getLanguageColor(lang.name) }} />
                        <span className="text-sm font-medium text-[#fafafa]">{lang.name}</span>
                        <span className="text-sm text-[#737373]">{lang.percentage}%</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
