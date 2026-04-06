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
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Contactar por WhatsApp"
    >
      <i className="bi bi-whatsapp"></i>
    </a>
  );
}
