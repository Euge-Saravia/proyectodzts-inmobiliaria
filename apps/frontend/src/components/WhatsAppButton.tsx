import TrackedLink from "@/components/TrackedLink";
import { ANALYTICS_EVENT } from "@/lib/analytics";
import "./WhatsAppButton.css";

type WhatsAppButtonProps = {
  whatsappNumber: string;
  whatsappMessage?: string | null;
};

export default function WhatsAppButton({ whatsappNumber, whatsappMessage }: WhatsAppButtonProps) {
  const url = whatsappMessage
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
    : `https://wa.me/${whatsappNumber}`;

  return (
    <TrackedLink
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Contactar por WhatsApp"
      eventName={ANALYTICS_EVENT.whatsappContact}
      eventParams={{ location: "float" }}
    >
      <i className="bi bi-whatsapp"></i>
    </TrackedLink>
  );
}
