interface MapSectionProps {
  address?: string | null;
  title: string;
}

export default function MapSection({ address, title }: MapSectionProps) {
  if (!address) return null;

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <div className="w-100">
      <div style={{ width: "100%", height: "450px" }}>
        <iframe
          src={mapSrc}
          style={{ border: 0, width: "100%", height: "100%" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={title}
        />
      </div>
    </div>
  );
}
