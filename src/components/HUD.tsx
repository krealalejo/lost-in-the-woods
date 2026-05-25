interface Props {
  location: string;
  turns: number;
}

export function HUD({ location, turns }: Props) {
  return (
    <div className="hud">
      <div className="title">{"// LOST IN THE WOODS"}&nbsp;v0.3a</div>
      <div className="meta">
        <span>LOC: {location.toUpperCase()}</span>
        <span className="turns">TURNS: {String(turns).padStart(4, "0")}</span>
      </div>
    </div>
  );
}
