import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { defineCollection, defineConfig, s } from "velite";

const computedFields = (data: any) => ({
  ...data,
  slugAsParams: data.slug
    .split("/")
    .slice(1)
    .join("/"),
});

const posts = defineCollection({
  name: "Post",
  pattern: "blog/**/*.mdx",
  schema: s
    .object({
      slug: s.path(),
      title: s.string().max(99),
      authors: s.array(s.string()).optional(),
      description: s.string().max(999).optional(),
      date: s.isodate(),
      published: s.boolean().default(true),
      tags: s.array(s.string()).optional(),
      body: s.mdx(),
      image: s.string().optional(),
    })
    .transform(computedFields),
});

const works = defineCollection({
  name: "Work",
  pattern: "work/**/*.mdx",
  schema: s
    .object({
      slug: s.path(),
      title: s.string().max(99),
      company: s.string().max(99),
      role: s.string().max(99).optional(),
      description: s.string().max(999).optional(),
      startDate: s.isodate(),
      endDate: s.isodate().optional(),
      published: s.boolean().default(true),
      tags: s.array(s.string()).optional(),
      body: s.mdx(),
      image: s.string().optional(),
      hoverImage: s.string().optional(),
      hoverVideo: s.string().optional(),
      link: s.string().optional(),
      isPrivate: s.boolean().default(false),
    })
    .transform(computedFields),
});

const projects = defineCollection({
  name: "Project",
  pattern: "projects/**/*.mdx",
  schema: s
    .object({
      slug: s.path(),
      title: s.string().max(99),
      description: s.string().max(999).optional(),
      date: s.isodate(),
      published: s.boolean().default(true),
      tags: s.array(s.string()).optional(),
      body: s.mdx(),
      image: s.string().optional(),
      hoverImage: s.string().optional(),
      hoverVideo: s.string().optional(),
      github: s.string().optional(),
      demo: s.string().optional(),
      featured: s.boolean().default(false),
    })
    .transform(computedFields),
});

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/",
    base: "/",
    name: "[name]-[hash:6].[ext]",
    clean: true,
  },
  collections: { posts, works, projects },
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      [rehypePrettyCode, { theme: "github-dark" }],
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: {
            className: ["subheading-anchor"],
            ariaLabel: "Link to section",
          },
        },
      ],
    ],
    remarkPlugins: [],
  },
});
