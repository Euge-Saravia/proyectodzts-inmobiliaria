"use client";

import type { AnchorHTMLAttributes } from "react";
import { trackEvent } from "@/lib/analytics";
import type { AnalyticsEventParams } from "@/lib/analytics";

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  eventName: string;
  eventParams?: AnalyticsEventParams;
};

export default function TrackedLink({
  eventName,
  eventParams,
  onClick,
  ...anchorProps
}: TrackedLinkProps) {
  return (
    <a
      {...anchorProps}
      onClick={(event) => {
        trackEvent(eventName, eventParams);
        onClick?.(event);
      }}
    />
  );
}
