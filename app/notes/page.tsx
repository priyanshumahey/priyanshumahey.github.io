import { posts } from "#site/content";
import { Header } from "@/components/Header";
import { Separator } from "@/components/ui/separator";
import { formatDate, sortPosts } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default async function BlogPage() {
  const displayPosts = sortPosts(posts);

  return (
    <>
      <main className="max-full w-full mx-auto max-w-3xl px-4 pt-8 text-slate-900 xs:px-6 sm:px-8 md:pt-16">
        <div className="mb-8">
          <Header />
        </div>

        <section className="text-lg">
          <h1 className="text-3xl font-semibold tracking-tight">notes</h1>
          <p className="mt-3 max-w-xl b"></p>
        </section>

        <Separator className="border-[#dadada] border-2" />

        <div>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 col-start-1 sm:col-span-8">
              <hr className="my-4" />
              {displayPosts?.length ? (
                <div className="grid gap-10 sm:grid-cols-2">
                  {displayPosts.map((post, index) => (
                    <article
                      key={post.slug}
                      className="group relative flex flex-col space-y-2"
                    >
                      <Image
                        src={post.image || "/hero.jpg"}
                        alt={post.title}
                        width={804}
                        height={452}
                        className="rounded-md border bg-muted transition-colors"
                      />
                      <h2 className="text-2xl font-bold">{post.title}</h2>
                      {post.description && (
                        <p className="text-muted-foreground">
                          {post.description}
                        </p>
                      )}
                      <div></div>

                      <span className="text-muted-foreground">
                        {post.date && (
                          <span className="text-sm text-muted-foreground">
                            {formatDate(post.date)}
                          </span>
                        )}
                      </span>

                      <Link href={post.slug} className="absolute inset-0">
                        <span className="sr-only">View Article</span>
                      </Link>
                    </article>
                  ))}
                </div>
              ) : (
                <p>No posts published.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* <div className="w-full py-20 lg:py-40">
    <div className="container mx-auto flex flex-col gap-14">
      <div className="flex w-full flex-col sm:flex-row sm:justify-between sm:items-center gap-8">
        <h4 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-regular">
          Latest articles
        </h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4 hover:opacity-75 cursor-pointer md:col-span-2">
          <div className="bg-muted rounded-md aspect-video"></div>
          <div className="flex flex-row gap-4 items-center">
            <Badge>News</Badge>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="max-w-3xl text-4xl tracking-tight">
              Pay supplier invoices
            </h3>
            <p className="max-w-3xl text-muted-foreground text-base">
              Managing a small business today is already tough. Avoid further
              complications by ditching outdated, tedious trade methods. Our
              goal is to streamline SMB trade, making it easier and faster than
              ever.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 hover:opacity-75 cursor-pointer">
          <div className="bg-muted rounded-md aspect-video"></div>
          <div className="flex flex-row gap-4 items-center">
            <Badge>News</Badge>

          </div>
          <div className="flex flex-col gap-1">
            <h3 className="max-w-3xl text-2xl tracking-tight">
              Pay supplier invoices
            </h3>
            <p className="max-w-3xl text-muted-foreground text-base">
              Managing a small business today is already tough. Avoid further
              complications by ditching outdated, tedious trade methods. Our
              goal is to streamline SMB trade, making it easier and faster than
              ever.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 hover:opacity-75 cursor-pointer">
          <div className="bg-muted rounded-md aspect-video"></div>
          <div className="flex flex-row gap-4 items-center">
            <Badge>News</Badge>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="max-w-3xl text-2xl tracking-tight">
              Pay supplier invoices
            </h3>
            <p className="max-w-3xl text-muted-foreground text-base">
              Managing a small business today is already tough. Avoid further
              complications by ditching outdated, tedious trade methods. Our
              goal is to streamline SMB trade, making it easier and faster than
              ever.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div> */}
    </>
  );
}
