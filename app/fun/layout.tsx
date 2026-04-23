import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Fun",
    description: "Side projects, experiments, and fun things by Priyanshu Mahey.",
    alternates: {
        canonical: "https://priyanshumahey.github.io/fun",
    },
};

export default function FunLayout({ children }: { children: React.ReactNode }) {
    return children;
}
