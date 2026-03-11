import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { DocumentDownload } from "@/components/DocumentDownload";
import { getPitchBySlug, getAllSlugs } from "@/lib/pitches";

const mdxComponents = {
  img: (props: Record<string, unknown>) => {
    const src = String(props.src ?? "");
    const alt = String(props.alt ?? "");
    const w = props.width != null ? Number(props.width) : 800;
    const h = props.height != null ? Number(props.height) : 500;
    return <Image src={src} alt={alt} width={w} height={h} className="rounded-lg" />;
  },
  Image,
  DocumentDownload,
};

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function FinancePitchPage({ params }: Props) {
  const { slug } = await params;
  const pitch = getPitchBySlug(slug);
  if (!pitch) notFound();

  return (
    <main>
      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <Link
            href="/finance"
            className="mb-8 inline-block font-sans text-sm text-[#0a192f]/60 underline-offset-2 hover:text-emerald hover:underline"
          >
            ← Back to Pitches
          </Link>

          <header className="mb-12 border-b border-[#0a192f]/10 pb-8">
            <p className="font-mono text-sm font-medium text-[#0a192f]/70">
              {pitch.ticker}
            </p>
            <h1
              className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#0a192f] sm:text-4xl"
              style={{ fontFamily: "var(--font-heading-serif)" }}
            >
              {pitch.title}
            </h1>
            <p className="mt-2 font-sans text-sm text-[#0a192f]/60">
              {pitch.date
                ? new Date(pitch.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : ""}
            </p>
          </header>

          <div
            className="prose prose-lg max-w-none font-sans text-[#0a192f] prose-headings:font-serif prose-h1:font-serif prose-h2:font-serif prose-h3:font-serif prose-h1:text-[#0a192f] prose-h2:text-[#0a192f] prose-h3:text-[#0a192f] prose-p:text-[#0a192f] prose-a:text-emerald prose-a:no-underline hover:prose-a:underline prose-strong:text-[#0a192f] prose-li:text-[#0a192f]"
          >
            <MDXRemote source={pitch.content} components={mdxComponents} />
          </div>
      </article>
    </main>
  );
}
