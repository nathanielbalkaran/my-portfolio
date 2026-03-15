import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Footer } from "@/components/Footer";
import { SetDocumentLang } from "@/components/SetDocumentLang";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

function isValidLocale(
  locale: string,
): locale is (typeof routing.locales)[number] {
  return routing.locales.includes(locale as (typeof routing.locales)[number]);
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SetDocumentLang />
      <div className="relative z-10 flex min-h-screen flex-col pt-[env(safe-area-inset-top,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)] pb-[env(safe-area-inset-bottom,0px)]">
        <main className="flex-1 pb-24 md:pb-28 lg:pb-32">{children}</main>
        <div className="relative z-30 shrink-0">
          <Footer />
        </div>
      </div>
    </NextIntlClientProvider>
  );
}
