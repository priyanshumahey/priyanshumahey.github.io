import { MetadataRoute } from "next";
import { posts } from "#site/content";
import { works } from "#site/content";
import { projects } from "#site/content";
import { chapters } from "#site/content";
import { examples } from "#site/content";

export const dynamic = "force-static";

const BASE_URL = "https://priyanshumahey.github.io";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/blog`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/projects`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/resume`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/system-design`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/system-design/examples`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/fun`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
    ];

    // Blog posts
    const blogPages: MetadataRoute.Sitemap = posts
        .filter((post) => post.published)
        .map((post) => ({
            url: `${BASE_URL}/blog/${post.slugAsParams}`,
            lastModified: new Date(post.date),
            changeFrequency: "monthly" as const,
            priority: 0.8,
        }));

    // Work pages
    const workPages: MetadataRoute.Sitemap = works
        .filter((work) => work.published)
        .map((work) => ({
            url: `${BASE_URL}/work/${work.slugAsParams}`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.7,
        }));

    // Project pages
    const projectPages: MetadataRoute.Sitemap = projects
        .filter((project) => project.published)
        .map((project) => ({
            url: `${BASE_URL}/projects/${project.slugAsParams}`,
            lastModified: new Date(project.date),
            changeFrequency: "monthly" as const,
            priority: 0.7,
        }));

    // System design chapters
    const chapterPages: MetadataRoute.Sitemap = chapters
        .filter((chapter) => chapter.published)
        .map((chapter) => ({
            url: `${BASE_URL}/system-design/${chapter.slugAsParams}`,
            lastModified: new Date(chapter.date),
            changeFrequency: "monthly" as const,
            priority: 0.6,
        }));

    // System design examples
    const examplePages: MetadataRoute.Sitemap = examples
        .filter((example) => example.published)
        .map((example) => ({
            url: `${BASE_URL}/system-design/examples/${example.slugAsParams}`,
            lastModified: new Date(example.date),
            changeFrequency: "monthly" as const,
            priority: 0.6,
        }));

    return [
        ...staticPages,
        ...blogPages,
        ...workPages,
        ...projectPages,
        ...chapterPages,
        ...examplePages,
    ];
}
