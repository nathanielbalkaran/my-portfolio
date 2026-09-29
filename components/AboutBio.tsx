import { externalLinks } from "@/data/site-content";

const linkClass =
  "text-[#F97316] underline underline-offset-2 decoration-[#F97316]/70 transition-colors ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#F97316] hover:text-black hover:decoration-transparent";

export function AboutBio() {
  return (
    <section className="relative max-w-3xl border-l-2 border-[#F97316] pl-6 font-sans text-[15px] font-semibold leading-snug text-foreground/90 hyphens-auto">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:16px_16px]" />
      <p className="text-justify">
        I am a first-year business student at{" "}
        <a
          href={externalLinks.western}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          Western University
        </a>{" "}
        with{" "}
        <a
          href={externalLinks.ivey}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          Ivey AEO
        </a>{" "}
        Status. I am passionate about{" "}
        <a
          href={externalLinks.investing}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          investing
        </a>{" "}
        and understanding how markets operate.
      </p>
      <p className="mt-4 text-justify">
        When I&apos;m not studying, I&apos;m working on social media content{" "}
        <a
          href={externalLinks.nathanielpredicts}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          @nathanielpredicts
        </a>{" "}
        or spending time outdoors{" "}
        <a
          href={externalLinks.strava}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          running
        </a>
        ,{" "}
        <a
          href={externalLinks.strava}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          biking
        </a>
        , or{" "}
        <a
          href={externalLinks.strava}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          hiking
        </a>
        .
      </p>
      <p className="mt-4 text-justify">
        I take pride in my work and am always looking for new problems to
        solve.{" "}
        <a
          href={externalLinks.linkedIn}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          Let&apos;s connect.
        </a>
      </p>
    </section>
  );
}
