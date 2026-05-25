interface Props {
  mapHtml: string;
}

export function MapPanel({ mapHtml }: Props) {
  return (
    <div className="map-wrap">
      <span className="tag">[ MAP ]</span>
      <span className="compass">N ↑ S ↓ E → W ←</span>
      {/* mapHtml contains hardcoded ASCII art with span tokens — not user input */}
      <pre className="map" dangerouslySetInnerHTML={{ __html: mapHtml }} />
    </div>
  );
}
