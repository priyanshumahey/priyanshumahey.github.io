import EmploymentCard, { EmploymentCardCompact } from "@/components/employmentCard";
import { LanguageBar } from "@/components/language-bar";
import { AgentGrepDemo, ASTVisualizerDemo, FleurDemo, GrepDemo, IndexingPipelineDemo, IvDemo, NextEditArchitecture, NextEditDemo, SemanticSearchDemo, TreeSitterDemo } from "@/components/projects/Demos";
import { FleurArchitecture } from "@/components/projects/Demos/Fleur/FleurArchitecture";
import { GitflowDemo } from "@/components/projects/Demos/GitflowDemo";
import Image from "next/image";
import * as runtime from "react/jsx-runtime";
import BlogLinkCard from "../blogCard";
import GitHubLinkCard from "../githubCard";
import ProjectLinkCard from "../projectCard";
import { Callout } from "./callout";
import Chart from "./chart";
import { Citation, References } from "./citation";

const useMDXComponent = (code: string) => {
  if (!code) return () => null;
  const fn = new Function(code);
  return fn({ ...runtime }).default;
};

const components = {
  Image,
  Callout,
  Chart,
  Citation,
  References,
  EmploymentCard,
  EmploymentCardCompact,
  IvDemo,
  GitflowDemo,
  GrepDemo,
  AgentGrepDemo,
  FleurDemo,
  FleurArchitecture,
  IndexingPipelineDemo,
  SemanticSearchDemo,
  TreeSitterDemo,
  ASTVisualizerDemo,
  NextEditDemo,
  NextEditArchitecture,
  LanguageBar,
  GitHubLinkCard,
  BlogLinkCard,
  ProjectLinkCard
};

interface MdxProps {
  code: string;
}

export function MDXContent({ code }: MdxProps) {
  const Component = useMDXComponent(code);
  return <Component components={components} />;
}
