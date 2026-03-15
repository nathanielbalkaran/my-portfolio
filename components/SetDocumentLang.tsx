"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

export function SetDocumentLang() {
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
