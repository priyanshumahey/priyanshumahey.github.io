import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "System Design",
    description:
        "A structured collection of system design chapters and examples by Priyanshu Mahey.",
    alternates: {
        canonical: "https://priyanshumahey.github.io/system-design",
    },
    openGraph: {
        title: "System Design | Priyanshu Mahey",
        description:
            "A structured collection of system design chapters and examples by Priyanshu Mahey.",
        url: "https://priyanshumahey.github.io/system-design",
        type: "website",
    },
};

export default function SystemDesignLayout({ children }: { children: React.ReactNode }) {
    return children;
}
