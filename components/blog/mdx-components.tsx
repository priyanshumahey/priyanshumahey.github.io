import EmploymentCard, { EmploymentCardCompact } from "@/components/employmentCard";
import { LanguageBar } from "@/components/language-bar";
import { IvDemo } from "@/components/projects/Demos";
import Image from "next/image";
import * as runtime from "react/jsx-runtime";
import GitHubLinkCard from "../githubCard";
import { Callout } from "./callout";
import Chart from "./chart";

const useMDXComponent = (code: string) => {
  if (!code) return () => null;
  const fn = new Function(code);
  return fn({ ...runtime }).default;
};

const components = {
  Image,
  Callout,
  Chart,
  EmploymentCard,
  EmploymentCardCompact,
  IvDemo,
  LanguageBar,
  GitHubLinkCard
};

interface MdxProps {
  code: string;
}

export function MDXContent({ code }: MdxProps) {
  const Component = useMDXComponent(code);
  return <Component components={components} />;
}
