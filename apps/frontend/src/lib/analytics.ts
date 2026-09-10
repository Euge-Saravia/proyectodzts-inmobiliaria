import { sendGAEvent } from "@next/third-parties/google";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const ANALYTICS_EVENT = {
  whatsappContact: "whatsapp_contact",
  share: "share",
  fichaOpen: "ficha_open",
  fichaPrint: "ficha_print",
} as const;

export type AnalyticsEventParams = Record<
  string,
  string | number | boolean | undefined
>;

export function trackEvent(name: string, params?: AnalyticsEventParams): void {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return;
  if (typeof window.gtag !== "function") return;

  try {
    const cleanParams = params
      ? (Object.fromEntries(
          Object.entries(params).filter(([, value]) => value !== undefined),
        ) as Record<string, string | number | boolean>)
      : undefined;

    if (cleanParams) {
      sendGAEvent("event", name, cleanParams);
    } else {
      sendGAEvent("event", name);
    }
  } catch {
    // Analytics failures should never break the UI.
  }
}
