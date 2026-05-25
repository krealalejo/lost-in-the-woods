interface Props {
  mapHtml: string;
  mapItems?: string[];
}

export function MapPanel({ mapHtml, mapItems }: Readonly<Props>) {
  return (
    <div className="map-wrap">
      {/* mapHtml contains hardcoded ASCII art with span tokens — not user input */}
      <pre className="map" dangerouslySetInnerHTML={{ __html: mapHtml }} />
      {mapItems && mapItems.length > 0 && (
        <ul className="map-items">
          {mapItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
