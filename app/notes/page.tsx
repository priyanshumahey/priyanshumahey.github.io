import { Header } from "@/components/Header";

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 pt-8 text-slate-900 xs:px-6 sm:px-8 md:pt-16">
      <div className="mb-8">
        <Header />
      </div>

      <section className="text-lg">
        <h2 className="text-3xl font-semibold tracking-tight">
          notes
        </h2>
        <p className="mt-3 max-w-xl"></p>
      </section>
    </main>
  );
}
