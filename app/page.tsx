import { Header } from "@/components/Header";
import { ProjectCard } from "@/components/Project";
import { LinkPreview } from "@/components/ui/link-preview";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "next/link";

function Section({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={cn("mt-10 mb-20", className)}>{children}</section>;
}

export default function Home() {
  return (
    <main className="max-full mx-auto max-w-3xl px-4 pt-8 text-slate-900 xs:px-6 sm:px-8 md:pt-16">
      <div className="mb-8">
        <Header />
      </div>

      <section className="text-lg">
        <h1 className="text-3xl font-semibold tracking-tight">
          priyanshu mahey
        </h1>
        <p className="mt-3 max-w-xl b"></p>
      </section>

      <Separator className="border-[#dadada] border-2" />

      <Section>
        <h3 className="text-2xl font-bold tracking-tight">About Me</h3>
        <div className="mt-2 text-lg tracking-tight">
          <p>
            My name is Priyanshu and I am a software engineer. Currently,
            I&apos;m working at{" "}
            <LinkPreview
              url="https://purplelotusmh.com/"
              className="font-medium decoration-blue-400 decoration-2 underline-offset-2 underline"
            >
              Purple Lotus
            </LinkPreview>{" "}
            and building out {""}
            <LinkPreview
              url="https://www.inputretrieval.com/"
              className="font-medium decoration-blue-400 decoration-2 underline-offset-2 underline"
            >
              Input/Retrieval
            </LinkPreview>
            .
          </p>
        </div>
      </Section>

      <Section>
        <h3 className="text-2xl font-bold tracking-tight">My Work</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-2">
          <ProjectCard
            name="Purple Lotus"
            description="Mental health data analytics platform with AI automation for therapists."
            image="/plpic.png"
            badgeName="Visit"
            badgeUrl="https://www.lotus-mh.ca/"
          >
            <div>
              <h3>Additional Content</h3>
              <p>
                This is some extra information about the project that will
                appear in the dialog/drawer.
              </p>
            </div>
          </ProjectCard>
          <ProjectCard
            name="Input/Retrieval"
            description="Notetaking with voice and semantic search."
            image="/irpic.png"
            badgeName="Visit"
            badgeUrl="https://app.inputretrieval.com/"
          />
        </div>
      </Section>

      <Section>
        <h3 className="text-2xl font-bold tracking-tight">Contact</h3>
        <div className="text-lg mt-2 tracking-tight">
          <p>
            Message me with email{" "}
            <Link
              className="font-medium decoration-blue-400 decoration-2 underline-offset-2 outline-none hover:underline focus:underline"
              href="mailto:priyanshu.mahey02@gmail.com"
            >
              priyanshu.mahey02@gmail.com
            </Link>{" "}
            or{" "}
            <Link
              className="font-medium decoration-cyan-400 decoration-2 underline-offset-2 outline-none hover:underline focus:underline"
              href="https://twitter.com/PriyanshuMahey"
              target="_blank"
              rel="noreferrer"
            >
              DM me on Twitter{" "}
            </Link>
            or connect with me{" "}
            <Link
              className="font-medium decoration-blue-400 decoration-2 underline-offset-2 outline-none hover:underline focus:underline"
              href="https://www.linkedin.com/in/priyanshu-mahey/"
              target="_blank"
              rel="noreferrer"
            >
              on LinkedIn here
            </Link>
            .
          </p>
        </div>
      </Section>
    </main>
  );
}
