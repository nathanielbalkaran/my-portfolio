import { notFound } from "next/navigation";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { DocumentDownload } from "@/components/DocumentDownload";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
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

type Props = { params: Promise<{ slug: string; locale: string }> };

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug }))
  );
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
          className="mb-8 inline-block font-sans text-sm text-foreground/60 underline-offset-2 hover:text-emerald hover:underline"
        >
          ← Back to Pitches
        </Link>

        <header className="mb-12 border-b border-foreground/10 pb-8">
          <p className="font-mono text-sm font-medium text-foreground/70">
            {pitch.ticker}
          </p>
          <h1
            className="mt-2 font-serif text-3xl font-semibold tracking-tight text-finance-navy sm:text-4xl"
            style={{ fontFamily: "var(--font-heading-serif)" }}
          >
            {pitch.title}
          </h1>
          <p className="mt-2 font-sans text-sm text-foreground/60">
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
          className="prose prose-lg max-w-none font-sans text-foreground prose-headings:font-serif prose-a:text-emerald prose-a:no-underline hover:prose-a:underline dark:prose-invert"
        >
          <MDXRemote source={pitch.content} components={mdxComponents} />
        </div>
      </article>
    </main>
  );
}
