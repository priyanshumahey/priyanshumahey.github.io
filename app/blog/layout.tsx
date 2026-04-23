import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Writing",
    description:
        "Essays and notes by Priyanshu Mahey on AI, software engineering, and system design.",
    alternates: {
        canonical: "https://priyanshumahey.github.io/blog",
    },
    openGraph: {
        title: "Writing | Priyanshu Mahey",
        description:
            "Essays and notes by Priyanshu Mahey on AI, software engineering, and system design.",
        url: "https://priyanshumahey.github.io/blog",
        type: "website",
    },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return children;
}
