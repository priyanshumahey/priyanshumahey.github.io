import Image from "next/image";
import * as runtime from "react/jsx-runtime";
import { Callout } from "./callout";
import Chart from "./chart";
import EmploymentCard, { EmploymentCardCompact } from "@/components/employmentCard";

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
};

interface MdxProps {
  code: string;
}

export function MDXContent({ code }: MdxProps) {
  const Component = useMDXComponent(code);
  return <Component components={components} />;
}
