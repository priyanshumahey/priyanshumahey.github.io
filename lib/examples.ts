import { examples } from "#site/content";
import { Example } from "#site/content";

export function getExampleBySlug(slugAsParams: string): Example | undefined {
  return examples.find((e) => e.slugAsParams === slugAsParams);
}
