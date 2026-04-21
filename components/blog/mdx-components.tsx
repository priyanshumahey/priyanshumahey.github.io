import EmploymentCard, { EmploymentCardCompact } from "@/components/employmentCard";
import { LanguageBar } from "@/components/language-bar";
import { AgentGrepDemo, ASTVisualizerDemo, CopilotArchitecture, EmbeddingPipeline, EmbeddingSpaceDemo, FileWatcherDemo, FleurDemo, FleurExplodedView, GitflowAnimatedDemo, GrepDemo, IndexingPipelineDemo, IvDemo, LookoutArchitecture, MultiCameraTimelineDemo, NextEditAnimatedDemo, NextEditArchitecture, NextEditDemo, P2PMeshDemo, PollingDemo, QueryRetrievalFlow, RedisCacheDemo, RedisDataTypesDemo, SemanticSearchDemo, SSEDemo, TreeSitterDemo, WebSocketDemo, WireProtocolFlow } from "@/components/projects/Demos";
import { CodeIndexingArchitecture } from "@/components/projects/Demos/Fleur/CodeIndexingArchitecture";
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
  GitflowAnimatedDemo,
  GrepDemo,
  AgentGrepDemo,
  FleurDemo,
  CodeIndexingArchitecture,
  FileWatcherDemo,
  FleurExplodedView,
  CopilotArchitecture,
  IndexingPipelineDemo,
  SemanticSearchDemo,
  TreeSitterDemo,
  ASTVisualizerDemo,
  NextEditDemo,
  NextEditArchitecture,
  NextEditAnimatedDemo,
  PollingDemo,
  WebSocketDemo,
  SSEDemo,
  RedisCacheDemo,
  RedisDataTypesDemo,
  LookoutArchitecture,
  EmbeddingPipeline,
  WireProtocolFlow,
  QueryRetrievalFlow,
  EmbeddingSpaceDemo,
  MultiCameraTimelineDemo,
  P2PMeshDemo,
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
