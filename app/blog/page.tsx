import { posts } from "#site/content";
import { formatDate, sortPosts } from "@/lib/utils";
import { ArrowRight, FileText, Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

const socialLinks = [
  { href: "https://www.linkedin.com/in/priyanshu-mahey/", label: "LinkedIn", icon: "linkedin" },
  { href: "https://x.com/PriyanshuMahey", label: "X", icon: "x" },
  { href: "https://github.com/priyanshumahey", label: "GitHub", icon: "github" },
  { href: "mailto:priyanshu.mahey02@gmail.com", label: "Email", icon: "email" },
];

const navLinks = [
  { href: "/blog", label: "Writing" },
  { href: "/fun", label: "Fun" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "Resume" },
];

const Icons = {
  linkedin: () => <Linkedin className="w-5 h-5" />,
  x: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  github: () => <Github className="w-5 h-5" />,
  email: () => <Mail className="w-5 h-5" />,
};

// Group posts by year for better organization
function groupPostsByYear(posts: typeof import("#site/content").posts) {
  const grouped: { [year: string]: typeof posts } = {};
  posts.forEach((post) => {
    const year = new Date(post.date).getFullYear().toString();
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(post);
  });
  return Object.entries(grouped).sort(([a], [b]) => parseInt(b) - parseInt(a));
}

export default async function BlogPage() {
  const displayPosts = sortPosts(posts);
  const postsByYear = groupPostsByYear(displayPosts);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fafafa]">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <header className="space-y-6 px-6 pt-8">
          <div>
            <Link href="/" className="text-2xl leading-[1.1] font-medium tracking-tight text-[#fafafa] hover:text-[#a1a1a1] transition-colors">
              Priyanshu Mahey.
            </Link>
            <nav className="flex flex-row gap-4 pt-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[#a1a1a1] hover:text-[#fafafa] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="px-6 pb-16">
          <section className="py-12 border-b border-[#1a1a1a]">
            <h1 className="text-3xl font-medium tracking-tight mb-3">Writing</h1>
            <p className="text-base text-[#a1a1a1] leading-relaxed">
              Thoughts on AI, software engineering, and building products.
            </p>
          </section>

          {/* Post List */}
          <section className="py-8">
            {displayPosts?.length ? (
              <div className="space-y-1">
                {displayPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/${post.slug}`}
                    className="group flex items-baseline justify-between gap-4 py-4 border-b border-[#1a1a1a] hover:border-[#333] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-medium text-[#fafafa] group-hover:text-blue-400 transition-colors truncate">
                        {post.title}
                      </h2>
                      {post.description && (
                        <p className="text-sm text-[#737373] mt-1 line-clamp-1">{post.description}</p>
                      )}
                    </div>
                    <time className="text-xs text-[#525252] tabular-nums shrink-0">
                      {formatDate(post.date)}
                    </time>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-[#737373] py-8">No posts published yet.</p>
            )}
          </section>

          <footer className="flex items-center gap-3 pt-8 pb-6">
            {socialLinks.map((link) => {
              const IconComponent = Icons[link.icon as keyof typeof Icons];
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="w-10 h-10 rounded-full border border-[#333] flex items-center justify-center text-[#888] hover:text-white hover:border-[#555] transition-all"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                >
                  <IconComponent />
                </Link>
              );
            })}
          </footer>
        </main>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-4xl mx-auto px-8 py-16">
          {/* Header */}
          <header className="flex items-center justify-between mb-16">
            <Link href="/" className="text-lg font-medium text-[#fafafa] hover:text-[#a1a1a1] transition-colors">
              ← Back
            </Link>
            <nav className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-colors ${link.href === "/blog"
                      ? "text-[#fafafa]"
                      : "text-[#737373] hover:text-[#fafafa]"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </header>

          {/* Title Section */}
          <section className="mb-16">
            <h1 className="text-[2.5rem] font-bold leading-tight tracking-tight mb-4">Writing</h1>
            <p className="text-xl text-[#a1a1a1] leading-relaxed max-w-2xl">
              Thoughts on AI, software engineering, and building products. I write about what I&apos;m learning and building.
            </p>
          </section>

          {/* Posts grouped by year */}
          <section className="space-y-12">
            {postsByYear.length ? (
              postsByYear.map(([year, yearPosts]) => (
                <div key={year}>
                  <h2 className="text-sm font-medium text-[#525252] uppercase tracking-wider mb-6">{year}</h2>
                  <div className="space-y-0">
                    {yearPosts.map((post) => (
                      <Link
                        key={post.slug}
                        href={`/${post.slug}`}
                        className="group flex items-start gap-6 py-5 border-b border-[#1a1a1a] hover:border-[#333] transition-all"
                      >
                        <time className="text-sm text-[#525252] tabular-nums w-24 shrink-0 pt-0.5">
                          {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </time>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium text-[#fafafa] group-hover:text-blue-400 transition-colors">
                              {post.title}
                            </h3>
                            <ArrowRight className="w-4 h-4 text-[#525252] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                          </div>
                          {post.description && (
                            <p className="text-sm text-[#737373] mt-1 leading-relaxed line-clamp-2">
                              {post.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[#737373] py-8">No posts published yet.</p>
            )}
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#050505] border-t border-[#1a1a1a] py-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <p className="text-sm text-[#525252]">
              © {new Date().getFullYear()} Priyanshu Mahey
            </p>
            <div className="flex items-center gap-6">
              {socialLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-[#737373] hover:text-[#fafafa] transition-colors uppercase tracking-wider"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
