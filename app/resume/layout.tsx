import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Resume",
    description:
        "Resume and work history for Priyanshu Mahey — AI & Software Engineer.",
    alternates: {
        canonical: "https://priyanshumahey.github.io/resume",
    },
    openGraph: {
        title: "Resume | Priyanshu Mahey",
        description:
            "Resume and work history for Priyanshu Mahey — AI & Software Engineer.",
        url: "https://priyanshumahey.github.io/resume",
        type: "profile",
    },
};

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
    return children;
}
