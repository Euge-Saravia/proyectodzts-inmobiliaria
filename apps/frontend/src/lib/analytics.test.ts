import { afterEach, describe, expect, it, vi } from "vitest";

const { sendGAEventMock } = vi.hoisted(() => ({
  sendGAEventMock: vi.fn(),
}));

vi.mock("@next/third-parties/google", () => ({
  sendGAEvent: sendGAEventMock,
}));

import { trackEvent, ANALYTICS_EVENT } from "./analytics";

afterEach(() => {
  sendGAEventMock.mockReset();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("trackEvent", () => {
  it("no-ops when there is no window (server-side)", () => {
    trackEvent(ANALYTICS_EVENT.share, { method: "native" });
    expect(sendGAEventMock).not.toHaveBeenCalled();
  });

  it("no-ops when the GA measurement id is not configured", () => {
    vi.stubGlobal("window", { gtag: vi.fn() });
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "");

    trackEvent(ANALYTICS_EVENT.share);

    expect(sendGAEventMock).not.toHaveBeenCalled();
  });

  it("no-ops when window.gtag is not available", () => {
    vi.stubGlobal("window", {});
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TEST123");

    trackEvent(ANALYTICS_EVENT.share);

    expect(sendGAEventMock).not.toHaveBeenCalled();
  });

  it("sends the event with undefined params stripped when configured", () => {
    vi.stubGlobal("window", { gtag: vi.fn() });
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TEST123");

    trackEvent(ANALYTICS_EVENT.whatsappContact, {
      location: "float",
      property_slug: undefined,
    });

    expect(sendGAEventMock).toHaveBeenCalledWith("event", "whatsapp_contact", {
      location: "float",
    });
  });

  it("sends the event without a params object when none is given", () => {
    vi.stubGlobal("window", { gtag: vi.fn() });
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TEST123");

    trackEvent(ANALYTICS_EVENT.fichaOpen);

    expect(sendGAEventMock).toHaveBeenCalledWith("event", "ficha_open");
  });

  it("never throws even if sendGAEvent itself throws", () => {
    vi.stubGlobal("window", { gtag: vi.fn() });
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TEST123");
    sendGAEventMock.mockImplementation(() => {
      throw new Error("boom");
    });

    expect(() => trackEvent(ANALYTICS_EVENT.share)).not.toThrow();
  });
});
