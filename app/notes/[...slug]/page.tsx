import { posts } from "#site/content";
import { MDXContent } from "@/components/notes/mdx-components";
import { notFound } from "next/navigation";

import { Header } from "@/components/Header";
import { formatDate } from "@/lib/utils";
import "@/styles/mdx.css";

interface PostPageProps {
  params: {
    slug: string[];
  };
}

async function getPostFromParams(params: PostPageProps["params"]) {
  const slug = params?.slug?.join("/");
  const post = posts.find((post) => post.slugAsParams === slug);

  return post;
}

export async function generateStaticParams(): Promise<
  PostPageProps["params"][]
> {
  return posts.map((post) => ({ slug: post.slugAsParams.split("/") }));
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostFromParams(params);

  if (!post || !post.published) {
    notFound();
  }

  return (
    <article className="container max-full w-full mx-auto max-w-3xl px-4 pt-8 text-slate-900 xs:px-6 sm:px-8 md:pt-16">
      <div className="mb-8">
        <Header />
      </div>
      <dl className="flex gap-2 mb-2 text-muted-foreground">
        <dt className="sr-only">Published On</dt>
        <dd className="text-sm sm:text-base font-medium flex items-center gap-1">
          Published on <time dateTime={post.date}>{formatDate(post.date)}</time>
        </dd>
      </dl>
      <h1 className="mb-2">{post.title}</h1>
      <p className="text-muted-foreground">By: {post.authors?.join(", ")}</p>

      {post.description ? (
        <p className="text-xl mt-0 text-muted-foreground">{post.description}</p>
      ) : null}
      <hr className="my-4" />
      <MDXContent code={post.body} />
    </article>
  );
}
