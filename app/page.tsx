import { Header } from "@/components/Header";
import Image from "next/image";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 pt-8 text-slate-900 xs:px-6 sm:px-8 md:pt-16">
      <div className="mb-8">
        <Header />
      </div>

    

    {/* <section className="flex mb-8 px-4">
      <Image
        src="/hero.jpg"
        alt="Priyanshu Mahey"
        width={678}
        height={300}
      />
      </section> */}

      <section className="text-lg">
        <h2 className="text-3xl font-semibold tracking-tight">
          priyanshu mahey
        </h2>
        <p className="mt-3 max-w-xl"></p>
      </section>

      <section className="mt-12 mb-32">
        <h3 className="text-2xl font-semibold tracking-tight">About Me</h3>
        <div className="mt-2 text-lg text-slate-700">
          <p>My name is Priyanshu and I am a software engineer.</p>
        </div>
      </section>

      <section className="mt-12 mb-32">
        <h3 className="text-2xl font-semibold tracking-tight">Contact</h3>
        <div className="text-lg text-slate-700 mt-2 ">
          <p>
            Shoot me an email at{" "}
            <a
              className="font-medium decoration-blue-400 decoration-2 underline-offset-2 outline-none hover:underline focus:underline"
              href="mailto:priyanshu.mahey02@gmail.com"
            >
              priyanshu.mahey02@gmail.com
            </a>{" "}
            or shoot me a{" "}
            <a
              className="font-medium decoration-cyan-400 decoration-2 underline-offset-2 outline-none hover:underline focus:underline"
              href="https://twitter.com/PriyanshuMahey"
              target="_blank"
              rel="noreferrer"
            >
              DM on Twitter{" "}
            </a>
            or connect with me{" "}
            <a
              className="font-medium decoration-blue-400 decoration-2 underline-offset-2 outline-none hover:underline focus:underline"
              href="https://www.linkedin.com/in/priyanshu-mahey/"
              target="_blank"
              rel="noreferrer"
            >
              on LinkedIn here
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
